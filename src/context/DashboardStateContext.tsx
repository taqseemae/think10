import React, { createContext, useContext, useState, useEffect } from "react";
import { type Expert, EXPERTS } from "@/data/think10";
import { useAuth } from "@/context/AuthContext";
import {
  saveUserProfile,
  saveUserPlan,
  saveOnboardingState,
  saveHealthScores,
  updateZyneTokens,
} from "@/lib/firestore";

export type UserRole = "Free" | "ZynePaid" | "Hybrid" | "Premium" | "Cancelled" | "Enterprise";

export type BusinessProfile = {
  businessName: string;
  stage: string;
  industry: string;
  channels: string[];
  teamSize: string;
  revenue: string;
  goals: string[];
  challenges: string[];
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
  user: string;
};

export type HealthScores = {
  valueProp: number;
  marketFit: number;
  unitEconomics: number;
  channelEfficiency: number;
  operations: number;
  teamOrg: number;
  marketingRoi: number;
  cashFlow: number;
  supplyChain: number;
  systems: number;
};

export type ChatMessage = {
  role: "user" | "zyne";
  content: string;
  timestamp: string;
  sections?: {
    understanding?: string;
    recommendation?: string;
    assumptions?: string;
    risks?: string;
    nextActions?: string[];
    sources?: string[];
  };
};

export type ZyneChatSession = {
  id: string;
  title: string;
  type: "VA" | "VC";
  messages: ChatMessage[];
  timestamp: string;
};

export type SessionStatus =
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "TECH_FAILURE"
  | "NO_SHOW"
  | "DISPUTED";

export type SessionReport = {
  summary: string;
  recommendations: string[];
  actionItems: string[];
  recordingUrl?: string;
  surveyCompleted: boolean;
};

export type BookingSession = {
  id: string;
  userId?: string;
  expertSlug: string;
  expertName: string;
  expertRole: string;
  when: string;
  topic: string;
  status: SessionStatus;
  sessionType: string;
  preCallAnswers?: {
    challenge: string;
    questions: string;
    additionalDocs: string;
  };
  preCallFiles?: string[];
  report?: SessionReport;
  meetLink?: string;
  rating?: number;
  feedback?: string;
};

export type ActionItem = {
  id: string;
  title: string;
  done: boolean;
  owner: string;
  deadline: string;
  source: "Zyne" | "Expert" | "Manual";
  sourceLink?: string;
  notes?: string;
};

export type LedgerEntry = {
  id: string;
  timestamp: string;
  description: string;
  amount: number; // positive or negative
  balanceAfter: number;
  status: "Settled" | "Pending";
};

export type LibraryDocument = {
  id: string;
  name: string;
  size: string;
  type: "Finance" | "Brand" | "Marketplaces" | "Legal" | "Operations" | "General";
  uploadedAt: string;
  sharedWith: string[]; // expertSlugs
};

export type CommunityPost = {
  id: string;
  space: string;
  title: string;
  author: string;
  authorCompany: string;
  content: string;
  likes: number;
  likedByUser?: boolean;
  comments: { id: string; author: string; content: string; timestamp: string }[];
  timestamp: string;
};

export type SupportTicket = {
  id: string;
  userId?: string;
  category: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  bookingId?: string;
  createdAt: string;
  resolvedAt?: string;
  updates: { timestamp: string; message: string }[];
};

export type AlertNotification = {
  id: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  actionLabel?: string;
  actionTo?: string;
  dismissible: boolean;
};

interface DashboardContextType {
  // Plan Simulation
  role: UserRole;
  setRole: (role: UserRole) => void;
  floatingAlert: AlertNotification | null;
  setFloatingAlert: (alert: AlertNotification | null) => void;
  resetAllData: () => void;

  // Auth State
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  logout: () => void;

  // Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;

  // Business Profile
  profile: BusinessProfile;
  updateProfileField: (field: keyof BusinessProfile, value: any) => void;
  profileAuditLogs: AuditLogEntry[];

  // Health Assessment
  healthScores: HealthScores;
  updateHealthScores: (scores: Partial<HealthScores>) => void;
  healthAssessmentHistory: { timestamp: string; totalScore: number }[];
  calculateOverallHealthScore: () => number;

  // Zyne Chats
  conversations: ZyneChatSession[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  startNewChat: (initialMessage?: string) => Promise<string>;
  sendChatMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  zyneTokens: number;
  setZyneTokens: (tokens: number) => void;

  // Booking & Expert matching
  bookings: BookingSession[];
  createBooking: (
    expertSlug: string,
    slot: string,
    sessionType: string,
    topic: string,
    preCall: { challenge: string; questions: string; additionalDocs: string },
    files: string[]
  ) => boolean;
  cancelBooking: (bookingId: string) => void;
  deleteBooking: (bookingId: string) => Promise<void>;
  deleteMultipleBookings: (bookingIds: string[]) => Promise<void>;
  rescheduleBooking: (bookingId: string, newSlot: string) => void;
  triggerServiceRecovery: (bookingId: string, type: "TECH_FAILURE" | "NO_SHOW") => void;
  completeCall: (bookingId: string, rating: number, feedback: string, transcript?: string, topic?: string) => void;
  fetchBookings: () => void;

  // Action Items
  actionItems: ActionItem[];
  addActionItem: (title: string, owner: string, deadline: string, source: "Zyne" | "Expert" | "Manual", sourceLink?: string, notes?: string) => void;
  toggleActionItem: (id: string) => void;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => void;
  deleteActionItem: (id: string) => void;

  // Billing
  credits: number;
  buyCredits: (amount: number) => void;
  creditsLedger: LedgerEntry[];
  invoices: { id: string; date: string; amount: string; status: string }[];

  // Documents
  documents: LibraryDocument[];
  uploadDocument: (name: string, size: string, type: LibraryDocument["type"]) => void;
  deleteDocument: (id: string) => void;
  toggleDocumentShare: (docId: string, expertSlug: string) => void;

  // Community
  posts: CommunityPost[];
  addPost: (space: string, title: string, content: string) => void;
  likePost: (id: string) => void;
  addComment: (postId: string, content: string) => void;
  connections: Record<string, "CONNECT" | "PENDING" | "ACCEPTED" | "BLOCKED">;
  toggleConnection: (expertSlug: string) => void;

  // Support
  tickets: SupportTicket[];
  createSupportTicket: (category: string, description: string, bookingId?: string) => void;
}

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: "",
  stage: "",
  industry: "",
  channels: [],
  teamSize: "",
  revenue: "",
  goals: [],
  challenges: [],
};

const DEFAULT_SCORES: HealthScores = {
  valueProp: 0,
  marketFit: 0,
  unitEconomics: 0,
  channelEfficiency: 0,
  operations: 0,
  teamOrg: 0,
  marketingRoi: 0,
  cashFlow: 0,
  supplyChain: 0,
  systems: 0,
};

const DashboardContext = createContext<DashboardContextType | null>(null);

// Empty no-op default — used during SSR before provider mounts
const EMPTY_DASHBOARD_CTX: DashboardContextType = {
  role: "Free",
  setRole: () => {},
  floatingAlert: null,
  setFloatingAlert: () => {},
  resetAllData: () => {},
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  logout: () => {},
  onboardingStep: 1,
  setOnboardingStep: () => {},
  onboardingCompleted: false,
  setOnboardingCompleted: () => {},
  profile: { businessName: "", stage: "", industry: "", channels: [], teamSize: "", revenue: "", goals: [], challenges: [] },
  updateProfileField: () => {},
  profileAuditLogs: [],
  healthScores: { valueProp: 0, marketFit: 0, unitEconomics: 0, channelEfficiency: 0, operations: 0, teamOrg: 0, marketingRoi: 0, cashFlow: 0, supplyChain: 0, systems: 0 },
  updateHealthScores: () => {},
  healthAssessmentHistory: [],
  calculateOverallHealthScore: () => 0,
  conversations: [],
  activeConversationId: null,
  setActiveConversationId: () => {},
  startNewChat: async () => "",
  sendChatMessage: async () => {},
  deleteConversation: () => {},
  zyneTokens: 0,
  setZyneTokens: () => {},
  bookings: [],
  createBooking: () => false,
  cancelBooking: () => {},
  deleteBooking: async () => {},
  deleteMultipleBookings: async () => {},
  rescheduleBooking: () => {},
  triggerServiceRecovery: () => {},
  completeCall: () => {},
  fetchBookings: () => {},
  actionItems: [],
  addActionItem: () => {},
  toggleActionItem: () => {},
  updateActionItem: () => {},
  deleteActionItem: () => {},
  credits: 0,
  buyCredits: () => {},
  creditsLedger: [],
  invoices: [],
  documents: [],
  uploadDocument: () => {},
  deleteDocument: () => {},
  toggleDocumentShare: () => {},
  posts: [],
  addPost: () => {},
  likePost: () => {},
  addComment: () => {},
  connections: {},
  toggleConnection: () => {},
  tickets: [],
  createSupportTicket: () => {},
};

export const DashboardStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State — delegated to Firebase AuthContext
  const { currentUser, userDoc, logout: firebaseLogout, authLoading, refreshUserDoc } = useAuth();
  const isLoggedIn = !!currentUser;

  // Sync state with userDoc from Firestore when loaded
  useEffect(() => {
    if (userDoc) {
      if (userDoc.plan?.role) {
        setRoleState(userDoc.plan.role as UserRole);
      }

      // Check if user has completed onboarding in DB, profile data exists, or local storage has flag
      const localCompleted = typeof window !== "undefined" && localStorage.getItem("t10_onboarding_completed") === "true";
      const profileHasData = !!(userDoc.profile?.businessName || userDoc.profile?.industry || userDoc.profile?.stage);
      const isCompleted = userDoc.onboarding?.completed === true || profileHasData || localCompleted;

      setOnboardingCompletedState(isCompleted);
      if (userDoc.onboarding?.step) {
        setOnboardingStepState(userDoc.onboarding.step);
      } else if (isCompleted) {
        setOnboardingStepState(5);
      }

      if (userDoc.profile) {
        setProfileState(userDoc.profile);
      }
      if (userDoc.healthScores) {
        setHealthScoresState(userDoc.healthScores);
      }
      if (userDoc.zyneTokens !== undefined) {
        setZyneTokensState(userDoc.zyneTokens);
      }
    }
  }, [userDoc]);

  // Compatibility shim — components that call setIsLoggedIn(false) will logout via Firebase
  const setIsLoggedIn = (val: boolean) => {
    if (!val) firebaseLogout();
  };

  const logout = () => {
    firebaseLogout();
    setOnboardingCompletedState(false);
    setRoleState("Free");
    if (typeof window !== "undefined") {
      localStorage.removeItem("t10_role");
      localStorage.removeItem("t10_onboarding_completed");
    }
  };

  // Role & Simulation State
  const [role, setRoleState] = useState<UserRole>("Free");
  const [floatingAlert, setFloatingAlert] = useState<AlertNotification | null>(null);

  // Onboarding (defaults to true for existing users, synced when userDoc resolves)
  const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("t10_onboarding_completed");
      if (stored === "true") return true;
      if (stored === "false") return false;
    }
    return true;
  });
  const [onboardingStep, setOnboardingStepState] = useState<number>(1);

  // Business Profile
  const [profile, setProfileState] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [profileAuditLogs, setProfileAuditLogs] = useState<AuditLogEntry[]>([]);

  // Health Assessment
  const [healthScores, setHealthScoresState] = useState<HealthScores>(DEFAULT_SCORES);
  const [healthAssessmentHistory, setHealthAssessmentHistory] = useState<{ timestamp: string; totalScore: number }[]>([]);

  // Zyne Tokens
  const [zyneTokens, setZyneTokensState] = useState<number>(0);

  // Zyne Chats — persisted per user in localStorage
  const [conversations, setConversationsState] = useState<ZyneChatSession[]>(() => {
    if (typeof window !== "undefined") {
      const storageKey = currentUser?.uid ? `t10_zyne_chats_${currentUser.uid}` : "t10_zyne_chats_guest";
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error parsing stored conversations:", e);
        }
      }
    }
    return [];
  });

  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const storageKey = currentUser?.uid ? `t10_zyne_chats_${currentUser.uid}` : "t10_zyne_chats_guest";
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].id;
          }
        } catch (e) {}
      }
    }
    return null;
  });

  const setConversations = (updater: ZyneChatSession[] | ((prev: ZyneChatSession[]) => ZyneChatSession[])) => {
    setConversationsState((prev) => {
      const nextVal = typeof updater === "function" ? updater(prev) : updater;
      if (typeof window !== "undefined") {
        const storageKey = currentUser?.uid ? `t10_zyne_chats_${currentUser.uid}` : "t10_zyne_chats_guest";
        localStorage.setItem(storageKey, JSON.stringify(nextVal));
      }
      return nextVal;
    });
  };

  // Sync stored chats whenever currentUser changes
  useEffect(() => {
    if (typeof window !== "undefined" && currentUser?.uid) {
      const storageKey = `t10_zyne_chats_${currentUser.uid}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversationsState(parsed);
            if (!activeConversationId) {
              setActiveConversationIdState(parsed[0].id);
            }
          }
        } catch (e) {}
      }
    }
  }, [currentUser?.uid]);

  const setZyneTokens = (tokens: number) => {
    setZyneTokensState(tokens);
  };

  // Bookings (Sessions) - fetched from MongoDB via Server Action
  const [bookings, setBookings] = useState<BookingSession[]>([]);

  const fetchBookings = () => {
    if (!currentUser?.uid) return;
    import("@/lib/server-actions").then(({ getUserBookingsFn }) => {
      getUserBookingsFn({ data: currentUser.uid })
        .then((b) => setBookings(b as any))
        .catch(console.error);
    });
  };

  useEffect(() => {
    fetchBookings();
  }, [currentUser?.uid]);

  // Action Items
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    import("@/lib/server-actions").then(({ getActionItemsFn }) => {
      getActionItemsFn()
        .then((items) => setActionItems(items as ActionItem[]))
        .catch(console.error);
    });
  }, [currentUser?.uid]);

  // Billing & Credits
  const [credits, setCredits] = useState<number>(0);
  const [creditsLedger, setCreditsLedger] = useState<LedgerEntry[]>([]);
  const [invoices] = useState<{ id: string; date: string; amount: string; status: string }[]>([]);

  // Documents
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);

  // Community Posts
  const [posts, setPosts] = useState<CommunityPost[]>([]);

  // Connections Record
  const [connections, setConnections] = useState<Record<string, "CONNECT" | "PENDING" | "ACCEPTED" | "BLOCKED">>({});

  // Support Tickets - fetched from MongoDB via Server Action
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setTickets([]);
      return;
    }
    import("@/lib/server-actions").then(({ getUserTicketsFn }) => {
      getUserTicketsFn({ data: currentUser.uid })
        .then((t) => setTickets(t as any))
        .catch(console.error);
    });
  }, [currentUser?.uid]);

  // Write changes to localStorage when states update
  // (Removed for fully MongoDB backed system)

  // Set initial default context values if role changes
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    // Adjust credits based on role defaults
    let newCreds = credits;
    if (newRole === "Free" || newRole === "Cancelled") newCreds = 0;
    else if (newRole === "ZynePaid") newCreds = 0;
    else if (newRole === "Hybrid") newCreds = 2;
    else if (newRole === "Premium") newCreds = 5;
    
    if (newCreds !== credits) {
      setCredits(newCreds);
      addLedgerEntry(`Role switched to ${newRole} (Creds updated)`, newCreds - credits, newCreds);
    }

    addAuditLog("user_plan", role, newRole);

    if (currentUser) {
      saveUserPlan(currentUser.uid, newRole).catch(console.error);
      import("@/lib/server-actions").then(({ updateUserPlanFn }) => {
        updateUserPlanFn({ data: { uid: currentUser.uid, role: newRole } }).catch(console.error);
      });
    }
    
    setFloatingAlert({
      id: "alert_" + Date.now(),
      type: "success",
      message: `Plan simulated as: ${newRole}`,
      dismissible: true,
    });
  };

  const resetAllData = () => {
    localStorage.clear();
    setRoleState("Hybrid");
    setCredits(2);
    setOnboardingCompletedState(false);
    setOnboardingStepState(1);
    setProfileState(DEFAULT_PROFILE);
    setHealthScoresState(DEFAULT_SCORES);
    setProfileAuditLogs([]);
    setConversations([]);
    setActiveConversationIdState(null);
    setZyneTokensState(0);
    setTickets([]);
    setFloatingAlert({
      id: "reset_" + Date.now(),
      type: "warning",
      message: "Prototype state has been fully reset.",
      dismissible: true,
    });
    // Triggers window reload after state flush to reload default initial states
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Helper function to log field changes for Audit Log
  const addAuditLog = (field: string, oldValue: string, newValue: string) => {
    const entry: AuditLogEntry = {
      id: "audit_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString().replace("T", " ").substr(0, 19),
      field,
      oldValue,
      newValue,
      user: "Founder",
    };
    setProfileAuditLogs((prev) => [entry, ...prev]);
  };

  // Update Profile
  const updateProfileField = (field: keyof BusinessProfile, value: any) => {
    const oldVal = JSON.stringify(profile[field]);
    const newVal = JSON.stringify(value);
    
    const updatedProfile = { ...profile, [field]: value };
    setProfileState(updatedProfile);

    addAuditLog(`profile.${field}`, oldVal, newVal);

    if (currentUser) {
      saveUserProfile(currentUser.uid, updatedProfile).catch(console.error);
      import("@/lib/server-actions").then(({ updateUserProfileFn }) => {
        updateUserProfileFn({ data: { uid: currentUser.uid, profile: updatedProfile } }).catch(console.error);
      });
    }
  };

  // Update Health scores
  const updateHealthScores = (scores: Partial<HealthScores>) => {
    const newScores = { ...healthScores, ...scores };
    setHealthScoresState(newScores);
    
    // Add history entry
    const total = Object.values(newScores).reduce((a, b) => a + b, 0);
    setHealthAssessmentHistory((prev) => [
      {
        timestamp: new Date().toISOString().replace("T", " ").substr(0, 16),
        totalScore: total,
      },
      ...prev,
    ]);

    addAuditLog("health_scores", JSON.stringify(healthScores), JSON.stringify(newScores));

    if (currentUser) {
      saveHealthScores(currentUser.uid, newScores).catch(console.error);
      import("@/lib/server-actions").then(({ updateHealthScoresFn }) => {
        updateHealthScoresFn({ data: { uid: currentUser.uid, scores: newScores } }).catch(console.error);
      });
    }
  };

  const calculateOverallHealthScore = () => {
    const values = Object.values(healthScores);
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / (values.length * 10)) * 100);
  };

  // Ledger entries Helper
  const addLedgerEntry = (description: string, amount: number, customBalance?: number) => {
    const balance = customBalance !== undefined ? customBalance : credits + amount;
    const entry: LedgerEntry = {
      id: "led_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString().replace("T", " ").substr(0, 16),
      description,
      amount,
      balanceAfter: balance,
      status: "Settled",
    };
    setCreditsLedger((prev) => [entry, ...prev]);
  };

  const buyCredits = (amount: number) => {
    const target = credits + amount;
    setCredits(target);
    addLedgerEntry("Purchased additional credit top-up", amount, target);
  };

  // Zyne Chat functions
  const startNewChat = async (initialMessage?: string) => {
    const isFree = role === "Free";
    const type = isFree ? "VA" : "VC";
    const newId = "chat_" + Date.now();
    const newSession: ZyneChatSession = {
      id: newId,
      title: initialMessage ? (initialMessage.length > 25 ? initialMessage.substr(0, 25) + "..." : initialMessage) : "New Conversation",
      type,
      messages: [],
      timestamp: new Date().toISOString().replace("T", " ").substr(0, 16),
    };

    setConversations((prev) => [newSession, ...prev]);
    setActiveConversationIdState(newId);

    if (initialMessage) {
      // Create user message immediately so it shows up in UI while AI thinks
      const userMsg: ChatMessage = {
        role: "user",
        content: initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setConversations((prev) =>
        prev.map((c) => (c.id === newId ? { ...c, messages: [...c.messages, userMsg] } : c))
      );

      // Generate AI response asynchronously
      const answer = await generateZyneResponse(initialMessage, type, []);
      
      setConversations((prev) =>
        prev.map((c) => (c.id === newId ? { ...c, messages: [...c.messages, answer] } : c))
      );

      // Deduct token
      if (zyneTokensState > 0) {
        setZyneTokensState((prev) => prev - 1);
        if (currentUser) updateZyneTokens(currentUser.uid, -1).catch(console.error);
      }
    }

    return newId;
  };

  const sendChatMessage = async (content: string) => {
    if (!activeConversationId) return;

    // Check token limit first
    if (zyneTokensState <= 0) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          return {
            ...c,
            messages: [
              ...c.messages,
              {
                role: "user",
                content,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
              {
                role: "zyne",
                content: "You have exhausted your Zyne AI Tokens. Please purchase more tokens in the Billing & Plan section to continue using Zyne.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        })
      );
      return;
    }

    const userMsg: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Extract conversation history to pass to Gemini
    let conversationHistory: ChatMessage[] = [];

    // Append user message immediately
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversationId) return c;
        let title = c.title;
        if (c.messages.length === 0) {
          title = content.length > 25 ? content.substr(0, 25) + "..." : content;
        }
        conversationHistory = c.messages;
        return {
          ...c,
          title,
          messages: [...c.messages, userMsg],
        };
      })
    );

    // Grab the active session type
    const activeSession = conversations.find(c => c.id === activeConversationId);
    if (!activeSession) return;

    const responseMsg = await generateZyneResponse(content, activeSession.type, conversationHistory);
    
    // Deduct token
    if (zyneTokensState > 0) {
      setZyneTokensState((prev) => prev - 1);
      if (currentUser) updateZyneTokens(currentUser.uid, -1).catch(console.error);
    }

    // Append AI response
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversationId) return c;
        return {
          ...c,
          messages: [...c.messages, responseMsg],
        };
      })
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationIdState(null);
    }
  };

  const generateZyneResponse = async (input: string, type: "VA" | "VC", history: ChatMessage[]): Promise<ChatMessage> => {
    const text = input.toLowerCase();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === "VA") {
      // Virtual Assistant Response via Server Function
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        const { generateZyneResponseFn } = await import('@/lib/server-ai');
        
        const formattedMessages = [
          ...history.map(msg => ({
            role: (msg.role === "zyne" ? "model" : "user") as "user" | "model",
            text: msg.content
          })),
          { role: "user" as const, text: input }
        ];

        const response = await generateZyneResponseFn({ 
          data: { 
            messages: formattedMessages, 
            isGuest: false,
            businessProfile: profile
          } 
        });

        return {
          role: "zyne",
          content: response.text || "I am having trouble connecting right now.",
          timestamp: nowStr,
        };
      } catch (err: any) {
        console.error("Zyne VA API Error:", err);
        return {
          role: "zyne",
          content: `Connection error: ${err?.message || "Service unavailable"}`,
          timestamp: nowStr,
        };
      }
    } else {
      // Virtual Consultant Response via Server Function
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        const { generateZyneResponseFn } = await import('@/lib/server-ai');
        
        const formattedMessages = [
          ...history.map(msg => ({
            role: (msg.role === "zyne" ? "model" : "user") as "user" | "model",
            text: msg.sections ? JSON.stringify(msg.sections) : msg.content
          })),
          { role: "user" as const, text: input }
        ];

        const response = await generateZyneResponseFn({ 
          data: { 
            messages: formattedMessages, 
            isGuest: false, 
            businessProfile: profile 
          } 
        });

        if (!response.success) {
           return {
             role: "zyne",
             content: response.text,
             timestamp: nowStr,
           };
        }

        try {
          const parsed = JSON.parse(response.text);
          return {
            role: "zyne",
            content: "Consultant Diagnosis Completed", 
            timestamp: nowStr,
            sections: {
              understanding: parsed.understanding || "Context processed.",
              recommendation: parsed.recommendation || "No recommendation provided.",
              assumptions: parsed.assumptions || "None.",
              risks: parsed.risks || "None.",
              nextActions: parsed.nextActions || [],
              sources: parsed.sources || []
            },
          };
        } catch(e) {
          return {
             role: "zyne",
             content: response.text, // raw fallback
             timestamp: nowStr,
          };
        }
      } catch (err: any) {
        console.error("Zyne API Error:", err);
        return {
          role: "zyne",
          content: `Sorry, I encountered an error while processing your request: ${err.message}`,
          timestamp: nowStr,
        };
      }
    }
  };

  // Booking functions
  const createBooking = (
    expertSlug: string,
    slot: string,
    sessionType: string,
    topic: string,
    preCall: { challenge: string; questions: string; additionalDocs: string },
    files: string[]
  ) => {
    const expert = EXPERTS.find((e) => e.slug === expertSlug);
    if (!expert) return false;

    // Check credits or payment
    const isPaidPlan = role === "Hybrid" || role === "Premium" || role === "ZynePaid";
    const needsCredit = role === "Hybrid" || role === "Premium";
    
    if (needsCredit && credits <= 0) {
      setFloatingAlert({
        id: "alert_booking_err_" + Date.now(),
        type: "error",
        message: "Insufficient credits! Please buy additional credits or upgrade your plan.",
        dismissible: true,
      });
      return false;
    }

    if (needsCredit) {
      const target = credits - 1;
      setCredits(target);
      addLedgerEntry(`Booked strategy session with ${expert.name}`, -1, target);
    }

    const newBooking: Omit<BookingSession, "id"> = {
      userId: currentUser?.uid,
      expertSlug,
      expertName: expert.name,
      expertRole: expert.role,
      when: slot,
      topic,
      status: "CONFIRMED",
      sessionType,
      preCallAnswers: preCall,
      preCallFiles: files,
    };

    // Save to MongoDB instead of local state
    import("@/lib/server-actions").then(({ createBookingFn }) => {
      createBookingFn({ data: newBooking })
        .then(() => {
          // Manually update UI since we don't have real-time listeners anymore
          setBookings(prev => [{ ...newBooking, id: "optimistic_" + Date.now() } as any, ...prev]);
        })
        .catch(err => console.error("Error creating booking", err));
    });

    // Create automated pre-call actions
    addActionItem(
      `Pre-call prep with ${expert.name}`,
      "Founder",
      slot.split(" ")[1] || "2026-07-20",
      "Manual",
      expertSlug,
      "Answer pre-call questions and ensure documents are shared."
    );

    setFloatingAlert({
      id: "alert_booking_succ_" + Date.now(),
      type: "success",
      message: `Successfully booked session with ${expert.name} on ${slot}`,
      dismissible: true,
    });

    addAuditLog("booking", "none", `${expert.name} - ${slot}`);
    return true;
  };

  const cancelBooking = (bookingId: string) => {
    import("@/lib/server-actions").then(({ cancelBookingFn }) => {
      cancelBookingFn({ data: { bookingId, cancelledBy: "user" } })
        .then(() => setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "CANCELLED" } : b)))
        .catch(err => console.error("Error cancelling booking:", err));
    });
  };

  const deleteBooking = async (bookingId: string) => {
    const { deleteBookingFn } = await import("@/lib/server-actions");
    await deleteBookingFn({ data: { bookingId } });
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const deleteMultipleBookings = async (bookingIds: string[]) => {
    const { deleteMultipleBookingsFn } = await import("@/lib/server-actions");
    await deleteMultipleBookingsFn({ data: { bookingIds } });
    setBookings(prev => prev.filter(b => !bookingIds.includes(b.id)));
  };

  const rescheduleBooking = (bookingId: string, newSlot: string) => {
    // Basic reschedule assuming 1 hr duration in GST
    const newStart = new Date(newSlot);
    const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
    
    import("@/lib/server-actions").then(({ rescheduleBookingFn }) => {
      rescheduleBookingFn({ 
        data: { 
          bookingId, 
          newStartTime: newStart.toISOString(),
          newEndTime: newEnd.toISOString(),
          timezone: "Asia/Dubai"
        } 
      })
      .then(() => {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, when: newSlot, status: "CONFIRMED" } : b))
        );
      })
      .catch(err => console.error("Error rescheduling booking:", err));
    });
  };

  const triggerServiceRecovery = (bookingId: string, type: "TECH_FAILURE" | "NO_SHOW") => {
    import("@/lib/server-actions").then(({ updateBookingStatusFn }) => {
      updateBookingStatusFn({ data: { id: bookingId, status: type } })
        .then(() => setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: type } : b)))
        .catch(err => console.error(err));
    });
    createSupportTicket(
      "Service Recovery",
      `The session encountered a ${type} error. Please review.`,
      bookingId
    );
  };

  const completeCall = (bookingId: string, rating: number, feedback: string, transcript?: string, topic?: string) => {
    import("@/lib/server-actions").then(async ({ updateBookingStatusFn, generateMeetingSummaryFn }) => {
      let reportData = null;
      if (transcript && topic) {
        try {
          reportData = await generateMeetingSummaryFn({ data: { bookingId, transcript, topic } });
        } catch (err) {
          console.error("AI Summary generation failed", err);
          reportData = {
            summary: "AI Summary generation failed. Please review the notes.",
            recommendations: ["System was unable to generate recommendations."],
            actionItems: []
          };
          // Try to save the fallback report
          import("@/lib/server-actions").then(({ updateBookingStatusFn }) => {
            updateBookingStatusFn({ data: { id: bookingId, status: "COMPLETED" } });
          });
        }
      } else {
        await updateBookingStatusFn({ data: { id: bookingId, status: "COMPLETED" } });
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: "COMPLETED", rating, feedback, report: reportData || b.report }
            : b
        )
      );
    });
  };

  // Action Items functions
  const addActionItem = (
    title: string,
    owner: string,
    deadline: string,
    source: "Zyne" | "Expert" | "Manual",
    sourceLink?: string,
    notes?: string
  ) => {
    import("@/lib/server-actions").then(({ createActionItemFn }) => {
      createActionItemFn({ data: { title, owner, deadline, source, sourceLink, notes } })
        .then((id) => {
          const newTask: ActionItem = {
            id,
            title,
            done: false,
            owner,
            deadline,
            source,
            sourceLink,
            notes,
          };
          setActionItems((prev) => [newTask, ...prev]);
        })
        .catch(console.error);
    });
  };

  const toggleActionItem = (id: string) => {
    const item = actionItems.find((i) => i.id === id);
    if (!item) return;
    import("@/lib/server-actions").then(({ updateActionItemStatusFn }) => {
      updateActionItemStatusFn({ data: { id, done: !item.done } })
        .then(() => {
          setActionItems((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
          );
        })
        .catch(console.error);
    });
  };

  const updateActionItem = (id: string, updates: Partial<ActionItem>) => {
    import("@/lib/server-actions").then(({ updateActionItemStatusFn }) => {
      updateActionItemStatusFn({ data: { id, done: updates.done || false, updates } })
        .then(() => {
          setActionItems((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
          );
        })
        .catch(console.error);
    });
  };

  const deleteActionItem = (id: string) => {
    import("@/lib/server-actions").then(({ deleteActionItemFn }) => {
      deleteActionItemFn({ data: { id } })
        .then(() => setActionItems((prev) => prev.filter((t) => t.id !== id)))
        .catch(console.error);
    });
  };

  // Documents functions
  const uploadDocument = (name: string, size: string, type: LibraryDocument["type"]) => {
    const newDoc: LibraryDocument = {
      id: "doc_" + Date.now(),
      name,
      size,
      type,
      uploadedAt: new Date().toISOString().replace("T", " ").substr(0, 16),
      sharedWith: [],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    setFloatingAlert({
      id: "doc_up_" + Date.now(),
      type: "success",
      message: `'${name}' successfully uploaded to library. Zyne now has access.`,
      dismissible: true,
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleDocumentShare = (docId: string, expertSlug: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        const shared = d.sharedWith.includes(expertSlug)
          ? d.sharedWith.filter((s) => s !== expertSlug)
          : [...d.sharedWith, expertSlug];
        return { ...d, sharedWith: shared };
      })
    );
  };

  // Community Forum functions
  const addPost = (space: string, title: string, content: string) => {
    const newPost: CommunityPost = {
      id: "post_" + Date.now(),
      space,
      title,
      author: "Founder",
      authorCompany: profile.businessName,
      content,
      likes: 0,
      timestamp: new Date().toISOString().replace("T", " ").substr(0, 16),
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const likePost = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const liked = !p.likedByUser;
        return {
          ...p,
          likedByUser: liked,
          likes: liked ? p.likes + 1 : p.likes - 1,
        };
      })
    );
  };

  const addComment = (postId: string, content: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              id: "comment_" + Date.now(),
              author: "Founder",
              content,
              timestamp: new Date().toISOString().replace("T", " ").substr(0, 16),
            },
          ],
        };
      })
    );
  };

  const toggleConnection = (expertSlug: string) => {
    setConnections((prev) => {
      const current = prev[expertSlug] || "CONNECT";
      let nextState: Record<string, "CONNECT" | "PENDING" | "ACCEPTED" | "BLOCKED"> = { ...prev };
      if (current === "CONNECT") nextState[expertSlug] = "PENDING";
      else if (current === "PENDING") nextState[expertSlug] = "CONNECT";
      else if (current === "ACCEPTED") nextState[expertSlug] = "CONNECT";
      return nextState;
    });
  };

  // Support functions
  const createSupportTicket = (category: string, description: string, bookingId?: string) => {
    const newTicket: Omit<SupportTicket, "id"> = {
      userId: currentUser?.uid,
      category,
      description,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updates: [],
      bookingId,
    };
    
    import("@/lib/server-actions").then(({ createSupportTicketFn }) => {
      createSupportTicketFn({ data: newTicket })
        .then(() => setTickets(prev => [{ ...newTicket, id: "optimistic_" + Date.now() } as any, ...prev]))
        .catch(err => console.error(err));
    });

    setFloatingAlert({
      id: "ticket_" + Date.now(),
      type: "info",
      message: "Support ticket created. Our team will respond shortly.",
      dismissible: true,
    });
  };

  // Custom setters for wizard
  const setOnboardingCompleted = (val: boolean) => {
    setOnboardingCompletedState(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("t10_onboarding_completed", val ? "true" : "false");
    }
    addAuditLog("onboarding_status", onboardingCompleted ? "complete" : "incomplete", val ? "complete" : "incomplete");
    if (currentUser) {
      saveOnboardingState(currentUser.uid, val, onboardingStep).catch(console.error);
      import("@/lib/server-actions").then(({ updateUserOnboardingFn }) => {
        updateUserOnboardingFn({ data: { uid: currentUser.uid, completed: val, step: onboardingStep } }).catch(console.error);
      });
    }
  };

  const setOnboardingStep = (step: number) => {
    setOnboardingStepState(step);
    if (currentUser) {
      saveOnboardingState(currentUser.uid, onboardingCompleted, step).catch(console.error);
      import("@/lib/server-actions").then(({ updateUserOnboardingFn }) => {
        updateUserOnboardingFn({ data: { uid: currentUser.uid, completed: onboardingCompleted, step } }).catch(console.error);
      });
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        role,
        setRole,
        floatingAlert,
        setFloatingAlert,
        resetAllData,
        isLoggedIn,
        setIsLoggedIn,
        logout,
        onboardingStep,
        setOnboardingStep,
        onboardingCompleted,
        setOnboardingCompleted,
        profile,
        updateProfileField,
        profileAuditLogs,
        healthScores,
        updateHealthScores,
        healthAssessmentHistory,
        calculateOverallHealthScore,
        conversations,
        activeConversationId,
        setActiveConversationId: setActiveConversationIdState,
        startNewChat,
        sendChatMessage,
        deleteConversation,
        bookings,
        createBooking,
        cancelBooking,
        deleteBooking,
        deleteMultipleBookings,
        rescheduleBooking,
        triggerServiceRecovery,
        completeCall,
        fetchBookings,
        actionItems,
        addActionItem,
        toggleActionItem,
        updateActionItem,
        deleteActionItem,
        credits,
        buyCredits,
        creditsLedger,
        invoices,
        documents,
        uploadDocument,
        deleteDocument,
        toggleDocumentShare,
        posts,
        addPost,
        likePost,
        addComment,
        connections,
        toggleConnection,
        tickets,
        createSupportTicket,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardState = () => {
  return useContext(DashboardContext) ?? EMPTY_DASHBOARD_CTX;
};
