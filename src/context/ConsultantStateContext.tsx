import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type ConsultantMetrics = {
  activeClients: number;
  completedSessions: number;
  pendingReviews: number;
  rating: number;
  totalEarnings: number;
};

interface ConsultantContextType {
  metrics: ConsultantMetrics;
  bookings: any[];
  refreshData: () => void;
  updateBookingStatus: (id: string, status: string) => Promise<void>;
  loading: boolean;
}

const DEFAULT_METRICS: ConsultantMetrics = {
  activeClients: 0,
  completedSessions: 0,
  pendingReviews: 0,
  rating: 0,
  totalEarnings: 0,
};

const ConsultantStateContext = createContext<ConsultantContextType | undefined>(undefined);

export const ConsultantStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userDoc } = useAuth();
  const [metrics, setMetrics] = useState<ConsultantMetrics>(DEFAULT_METRICS);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    if (!currentUser || !userDoc) return;
    setLoading(true);

    import("@/lib/server-actions").then(({ getAllAdminDataFn }) => {
      getAllAdminDataFn()
        .then((data: any) => {
          // Match bookings where expertSlug matches consultant uid, displayName, or companyName
          // This allows both hardcoded EXPERTS and real DB-registered consultants to match
          const consultantName = userDoc.displayName || currentUser.displayName || "";
          const consultantUid = currentUser.uid;

          const myBookings = data.bookings.filter((b: any) =>
            b.consultantId === consultantUid ||
            b.expertSlug === consultantUid ||
            (consultantName && b.expertName === consultantName) ||
            b.userId === consultantUid // fallback for legacy
          );

          // Unique clients
          const uniqueClientIds = new Set(myBookings.map((b: any) => b.userId).filter(Boolean));

          // Completed sessions
          const completed = myBookings.filter((b: any) =>
            b.status === "COMPLETED" || b.status === "Completed"
          );

          // Pending reviews (completed without a report)
          const pendingReports = completed.filter((b: any) => !b.report).length;

          // Average rating from completed sessions
          const ratedSessions = completed.filter((b: any) => b.rating);
          const avgRating = ratedSessions.length > 0
            ? ratedSessions.reduce((sum: number, b: any) => sum + (b.rating || 0), 0) / ratedSessions.length
            : 0;

          // Earnings: AED 450 per completed session
          const earnings = completed.length * 450;

          setBookings(myBookings);
          setMetrics({
            activeClients: uniqueClientIds.size,
            completedSessions: completed.length,
            pendingReviews: pendingReports,
            rating: Math.round(avgRating * 10) / 10,
            totalEarnings: earnings,
          });
        })
        .catch(err => console.error("Error fetching consultant data:", err))
        .finally(() => setLoading(false));
    });
  };

  useEffect(() => {
    if (currentUser && userDoc) {
      refreshData();
    } else {
      setBookings([]);
      setMetrics(DEFAULT_METRICS);
    }
  }, [currentUser?.uid, userDoc?.uid]);

  const updateBookingStatus = async (id: string, status: string) => {
    const { updateBookingStatusFn } = await import("@/lib/server-actions");
    await updateBookingStatusFn({ data: { id, status } });
    // Optimistically update UI
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    // Recalculate metrics after status update
    setTimeout(() => refreshData(), 300);
  };

  return (
    <ConsultantStateContext.Provider
      value={{
        metrics,
        bookings,
        refreshData,
        updateBookingStatus,
        loading,
      }}
    >
      {children}
    </ConsultantStateContext.Provider>
  );
};

export const useConsultantState = () => {
  const context = useContext(ConsultantStateContext);
  if (!context) {
    throw new Error("useConsultantState must be used within a ConsultantStateProvider");
  }
  return context;
};
