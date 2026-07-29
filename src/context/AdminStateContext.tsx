import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type AdminRole = 
  | "Super Admin"
  | "Founder / Executive"
  | "Operations Manager"
  | "Consultant Verification"
  | "Quality & Compliance"
  | "Finance"
  | "Customer Support"
  | "Enterprise Sales / CRM"
  | "Marketing / Content"
  | "AI Operations"
  | "Data / Analyst";

type AdminMetrics = {
  mrr: number;
  activePaidUsers: number;
  pendingVerifications: number;
  openTickets: number;
  unresolvedComplaints: number;
  aiIncidents: number;
  pendingPayouts: number;
};

type Task = {
  id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Resolved";
  ownerRole: AdminRole;
};

interface AdminContextType {
  adminRole: AdminRole;
  setAdminRole: (role: AdminRole) => void;
  metrics: AdminMetrics;
  tasks: Task[];
  resolveTask: (id: string) => void;
  users: any[];
  tickets: any[];
  bookings: any[];
  transactions: any[];
  refreshData: () => void;
  suspendUser: (uid: string, isSuspended: boolean) => Promise<void>;
  approveConsultant: (uid: string) => Promise<void>;
  updateUserRole: (uid: string, role: string) => Promise<void>;
  updateUserAdminRole: (uid: string, role: string | null) => Promise<void>;
  updateUserProfile: (uid: string, displayName: string, email: string) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  updateBookingStatus: (id: string, status: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  deleteMultipleBookings: (ids: string[]) => Promise<void>;
}

const DEFAULT_METRICS: AdminMetrics = {
  mrr: 0,
  activePaidUsers: 0,
  pendingVerifications: 14,
  openTickets: 0,
  unresolvedComplaints: 3,
  aiIncidents: 1,
  pendingPayouts: 22,
};

const STATIC_TASKS: Task[] = [
  { id: "t1", title: "Approve consultant profile: Sarah J.", category: "Verification", priority: "High", status: "Pending", ownerRole: "Consultant Verification" },
  { id: "t2", title: "Resolve duplicate payment dispute", category: "Finance", priority: "High", status: "Pending", ownerRole: "Finance" },
  { id: "t3", title: "Review AI hallucination flag #992", category: "AI Safety", priority: "Medium", status: "Pending", ownerRole: "AI Operations" },
  { id: "t4", title: "Review enterprise proposal for Emaar", category: "CRM", priority: "High", status: "Pending", ownerRole: "Enterprise Sales / CRM" },
  { id: "t5", title: "Approve Q3 marketing budget", category: "Approvals", priority: "Low", status: "Pending", ownerRole: "Founder / Executive" },
  { id: "t6", title: "System health check and backup audit", category: "Operations", priority: "High", status: "Pending", ownerRole: "Super Admin" },
];

const DEFAULT_ADMIN_CTX: AdminContextType = {
  adminRole: "Super Admin",
  setAdminRole: () => {},
  metrics: DEFAULT_METRICS,
  tasks: STATIC_TASKS,
  resolveTask: () => {},
  users: [],
  tickets: [],
  bookings: [],
  transactions: [],
  refreshData: () => {},
  suspendUser: async () => {},
  approveConsultant: async () => {},
  updateUserRole: async () => {},
  updateUserAdminRole: async () => {},
  updateUserProfile: async () => {},
  deleteUser: async () => {},
  updateBookingStatus: async () => {},
  cancelBooking: async () => {},
  deleteBooking: async () => {},
  deleteMultipleBookings: async () => {},
};

const AdminStateContext = createContext<AdminContextType>(DEFAULT_ADMIN_CTX);

export const AdminStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userDoc } = useAuth();
  // Use adminRole from userDoc if available, else default to "Super Admin" for dev
  const [adminRole, setAdminRoleState] = useState<AdminRole>("Super Admin");

  // Sync adminRole from userDoc when it loads
  useEffect(() => {
    if (userDoc?.adminRole) {
      setAdminRoleState(userDoc.adminRole as AdminRole);
    }
  }, [userDoc?.adminRole]);

  const [metrics, setMetrics] = useState<AdminMetrics>(DEFAULT_METRICS);
  const [tasks, setTasks] = useState<Task[]>(STATIC_TASKS);
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const refreshData = () => {
    import("@/lib/server-actions").then(({ getAllAdminDataFn }) => {
      getAllAdminDataFn()
        .then((data: any) => {
          setUsers(data.users || []);
          setTickets(data.tickets || []);
          setBookings(data.bookings || []);
          
          // Real AED pricing as per Think10 plans
          let paidUsers = 0;
          let mrr = 0;
          data.users.forEach((u: any) => {
            const role = u.plan?.role;
            const status = u.plan?.status;
            if (status === "Suspended") return; // Exclude suspended
            if (role === "ZynePaid") { paidUsers++; mrr += 290; }    // AED 290/mo
            if (role === "Hybrid") { paidUsers++; mrr += 950; }      // AED 950/mo
            if (role === "Premium") { paidUsers++; mrr += 2500; }    // AED 2,500/mo
            if (role === "Enterprise") { paidUsers++; mrr += 5000; } // AED ~5,000/mo estimate
          });

          let openTix = 0;
          const dynamicTasks: Task[] = [];
          data.tickets.forEach((t: any) => {
            if (t.status === "OPEN" || t.status === "IN_PROGRESS") {
              openTix++;
              dynamicTasks.push({
                id: t.id,
                title: `Support Ticket: ${t.category}`,
                category: "Support",
                priority: t.category === "Service Recovery" ? "High" : "Medium",
                status: "Pending",
                ownerRole: "Customer Support"
              });
            }
          });

          setMetrics(prev => ({ ...prev, activePaidUsers: paidUsers, mrr, openTickets: openTix }));
          setTasks(prev => {
            const staticTasks = prev.filter(t => !dynamicTasks.find(dt => dt.id === t.id) && t.id.startsWith("t"));
            return [...staticTasks, ...dynamicTasks];
          });
        })
        .catch(err => console.error("Error fetching admin data from MongoDB:", err));
    });
  };

  // Fetch from MongoDB
  useEffect(() => {
    refreshData();
  }, []);

  const suspendUser = async (uid: string, isSuspended: boolean) => {
    const { suspendUserFn } = await import("@/lib/server-actions");
    await suspendUserFn({ data: { uid, isSuspended } });
    refreshData();
  };

  const approveConsultant = async (uid: string) => {
    const { approveConsultantFn } = await import("@/lib/server-actions");
    await approveConsultantFn({ data: { uid } });
    refreshData();
  };

  const updateUserRole = async (uid: string, role: string) => {
    const { updateUserPlanFn } = await import("@/lib/server-actions");
    await updateUserPlanFn({ data: { uid, role } });
    refreshData();
  };

  const updateUserAdminRole = async (uid: string, role: string | null) => {
    const { updateUserAdminRoleFn } = await import("@/lib/server-actions");
    await updateUserAdminRoleFn({ data: { uid, adminRole: role } });
    refreshData();
  };

  const updateUserProfile = async (uid: string, displayName: string, email: string) => {
    const { updateUserProfileByAdminFn } = await import("@/lib/server-actions");
    await updateUserProfileByAdminFn({ data: { uid, displayName, email } });
    refreshData();
  };

  const deleteUser = async (uid: string) => {
    const { deleteUserFn } = await import("@/lib/server-actions");
    await deleteUserFn({ data: { uid } });
    setUsers(prev => prev.filter(u => u.uid !== uid));
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { updateBookingStatusFn } = await import("@/lib/server-actions");
    await updateBookingStatusFn({ data: { id, status } });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const cancelBooking = async (id: string) => {
    const { cancelBookingFn } = await import("@/lib/server-actions");
    await cancelBookingFn({ data: { bookingId: id, cancelledBy: "admin" } });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "CANCELLED" } : b));
  };

  const deleteBooking = async (id: string) => {
    const { deleteBookingFn } = await import("@/lib/server-actions");
    await deleteBookingFn({ data: { bookingId: id } });
    setBookings(prev => prev.filter(b => b.id !== id && (b as any)._id !== id));
    refreshData();
  };

  const deleteMultipleBookings = async (ids: string[]) => {
    const { deleteMultipleBookingsFn } = await import("@/lib/server-actions");
    await deleteMultipleBookingsFn({ data: { bookingIds: ids } });
    setBookings(prev => prev.filter(b => !ids.includes(b.id) && !ids.includes((b as any)._id)));
    refreshData();
  };

  const resolveTask = (id: string) => {
    if (id.startsWith("t")) {
      setTasks((prev) => prev.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
    } else {
      // It's a real ticket from MongoDB
      import("@/lib/server-actions").then(({ updateSupportTicketStatusFn }) => {
        updateSupportTicketStatusFn({ data: { id, status: "Resolved" } })
          .then(() => {
            setTasks((prev) => prev.filter(t => t.id !== id));
            setMetrics((prev) => ({ ...prev, openTickets: Math.max(0, prev.openTickets - 1) }));
          })
          .catch((err: any) => console.error(err));
      });
    }
  };

  return (
    <AdminStateContext.Provider
      value={{
        adminRole,
        setAdminRole: setAdminRoleState,
        metrics,
        tasks,
        resolveTask,
        users,
        tickets,
        bookings,
        transactions,
        refreshData,
        suspendUser,
        approveConsultant,
        updateUserRole,
        updateUserAdminRole,
        updateUserProfile,
        deleteUser,
        updateBookingStatus,
        cancelBooking,
        deleteBooking,
        deleteMultipleBookings,
      }}
    >
      {children}
    </AdminStateContext.Provider>
  );
};

export const useAdminState = () => {
  return useContext(AdminStateContext);
};
