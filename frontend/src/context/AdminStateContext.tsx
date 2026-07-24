"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  refreshData: () => void;
  suspendUser: (uid: string, isSuspended: boolean) => Promise<void>;
  approveConsultant: (uid: string) => Promise<void>;
  updateUserRole: (uid: string, role: string) => Promise<void>;
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

const AdminStateContext = createContext<AdminContextType | undefined>(undefined);

export const AdminStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminRole, setAdminRoleState] = useState<AdminRole>("Super Admin");

  const [metrics, setMetrics] = useState<AdminMetrics>(DEFAULT_METRICS);
  const [tasks, setTasks] = useState<Task[]>(STATIC_TASKS);
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  const refreshData = () => {
    import("@/lib/server-actions").then(({ getAllAdminDataFn }) => {
      getAllAdminDataFn()
        .then((data: any) => {
          setUsers(data.users || []);
          setTickets(data.tickets || []);
          setBookings(data.bookings || []);
          
          let paidUsers = 0;
          let mrr = 0;
          (data.users || []).forEach((u: any) => {
            const role = u.plan?.role;
            if (role === "ZynePaid") { paidUsers++; mrr += 99; }
            if (role === "Hybrid") { paidUsers++; mrr += 499; }
            if (role === "Premium") { paidUsers++; mrr += 999; }
          });

          let openTix = 0;
          const dynamicTasks: Task[] = [];
          (data.tickets || []).forEach((t: any) => {
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
    await updateUserPlanFn({ data: { uid, plan: { role } } });
    refreshData();
  };

  const resolveTask = (id: string) => {
    if (id.startsWith("t")) {
      setTasks((prev) => prev.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
    } else {
      // It's a real ticket from MongoDB
      import("@/lib/server-actions").then(({ updateSupportTicketStatusFn }) => {
        updateSupportTicketStatusFn({ data: { ticketId: id, status: "Resolved" } })
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
        refreshData,
        suspendUser,
        approveConsultant,
        updateUserRole,
      }}
    >
      {children}
    </AdminStateContext.Provider>
  );
};

export const useAdminState = () => {
  const context = useContext(AdminStateContext);
  if (!context) {
    throw new Error("useAdminState must be used within an AdminStateProvider");
  }
  return context;
};
