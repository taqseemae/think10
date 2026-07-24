"use client";

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

  const refreshData = () => {
    if (!currentUser || !userDoc) return;
    
    // For MVP, we are identifying the consultant bookings by their UID or if they are just an admin checking.
    // In a real scenario, we'd use expertSlug matching their profile.
    // For now, let's just fetch all bookings to display in their dashboard, or match by expertName.
    // Let's use getConsultantBookingsFn, passing their UID or a dummy slug if needed.
    
    import("@/lib/server-actions").then(({ getAllAdminDataFn }) => {
      // For MVP consultant, we might just filter all bookings.
      // We could use getConsultantBookingsFn if we knew their slug.
      getAllAdminDataFn()
        .then((data: any) => {
           // If they are a verified consultant from EXPERTS array, match by name or slug.
           // Since we don't have a rigid slug mapping for new users yet, let's just show all bookings for now 
           // or filter by "expertName" matching their company name.
           const myBookings = data.bookings; // In a full app: data.bookings.filter(b => b.expertSlug === userDoc.profile.slug)
           
           setBookings(myBookings);

           const completed = myBookings.filter((b: any) => b.status === "COMPLETED").length;
           const active = new Set(myBookings.map((b: any) => b.userId)).size;
           
           setMetrics({
             activeClients: active,
             completedSessions: completed,
             pendingReviews: 0,
             rating: 4.8,
             totalEarnings: completed * 450
           });
        })
        .catch(err => console.error("Error fetching consultant data:", err));
    });
  };

  useEffect(() => {
    refreshData();
  }, [currentUser]);

  const updateBookingStatus = async (id: string, status: string) => {
    const { updateBookingStatusFn } = await import("@/lib/server-actions");
    await updateBookingStatusFn({ data: { bookingId: id, status } });
    refreshData();
  };

  return (
    <ConsultantStateContext.Provider
      value={{
        metrics,
        bookings,
        refreshData,
        updateBookingStatus
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
