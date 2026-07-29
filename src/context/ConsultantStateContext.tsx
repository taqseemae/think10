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
  cancelBooking: (id: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  deleteMultipleBookings: (ids: string[]) => Promise<void>;
  rescheduleBooking: (id: string, newStartTime: string, newEndTime: string) => Promise<void>;
  loading: boolean;
}

const DEFAULT_METRICS: ConsultantMetrics = {
  activeClients: 0,
  completedSessions: 0,
  pendingReviews: 0,
  rating: 0,
  totalEarnings: 0,
};

const DEFAULT_CONSULTANT_CTX: ConsultantContextType = {
  metrics: DEFAULT_METRICS,
  bookings: [],
  refreshData: () => {},
  updateBookingStatus: async () => {},
  cancelBooking: async () => {},
  deleteBooking: async () => {},
  deleteMultipleBookings: async () => {},
  rescheduleBooking: async () => {},
  loading: false,
};

const ConsultantStateContext = createContext<ConsultantContextType>(DEFAULT_CONSULTANT_CTX);

export const ConsultantStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userDoc } = useAuth();
  const [metrics, setMetrics] = useState<ConsultantMetrics>(DEFAULT_METRICS);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    if (!currentUser || !userDoc) return;
    setLoading(true);

    import("@/lib/server-actions").then(({ getConsultantBookingsFn }) => {
      getConsultantBookingsFn({ data: currentUser.uid })
        .then((myBookings: any[]) => {
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
    refreshData();
  };

  const cancelBooking = async (id: string) => {
    const { cancelBookingFn } = await import("@/lib/server-actions");
    await cancelBookingFn({ data: { bookingId: id, cancelledBy: "consultant" } });
    refreshData();
  };

  const deleteBooking = async (id: string) => {
    const { deleteBookingFn } = await import("@/lib/server-actions");
    await deleteBookingFn({ data: { bookingId: id } });
    refreshData();
  };

  const deleteMultipleBookings = async (ids: string[]) => {
    const { deleteMultipleBookingsFn } = await import("@/lib/server-actions");
    await deleteMultipleBookingsFn({ data: { bookingIds: ids } });
    refreshData();
  };

  const rescheduleBooking = async (id: string, newStartTime: string, newEndTime: string) => {
    const { rescheduleBookingFn } = await import("@/lib/server-actions");
    await rescheduleBookingFn({ data: { bookingId: id, newStartTime, newEndTime, timezone: "Asia/Dubai" } });
    refreshData();
  };

  return (
    <ConsultantStateContext.Provider
      value={{
        metrics,
        bookings,
        refreshData,
        updateBookingStatus,
        cancelBooking,
        deleteBooking,
        deleteMultipleBookings,
        rescheduleBooking,
        loading,
      }}
    >
      {children}
    </ConsultantStateContext.Provider>
  );
};

export const useConsultantState = () => {
  return useContext(ConsultantStateContext);
};
