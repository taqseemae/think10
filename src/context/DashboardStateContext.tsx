import React, { createContext, useContext, useState, useEffect } from "react";
import { type Expert, EXPERTS } from "@/data/think10";
import { useAuth } from "@/context/AuthContext";
import {
  saveUserProfile,
  saveUserPlan,
  saveOnboardingState,
  saveHealthScores,
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
  messageAllowanceUsed: number; // For Free users, out of 5

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
  completeCall: (bookingId: string, rating: number, feedback: string) => void;
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
  messageAllowanceUsed: 0,
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
      if (userDoc.onboarding) {
        setOnboardingCompletedState(userDoc.onboarding.completed);
        // Fallback to 1 if step is 0 (legacy accounts or bugged DB entries)
        setOnboardingStepState(userDoc.onboarding.step || 1);
      }
      if (userDoc.profile) {
        setProfileState(userDoc.profile);
      }
      if (userDoc.healthScores) {
        setHealthScoresState(userDoc.healthScores);
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

  // Onboarding
  const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStepState] = useState<number>(1);

  // Business Profile
  const [profile, setProfileState] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [profileAuditLogs, setProfileAuditLogs] = useState<AuditLogEntry[]>([]);

  // Health Assessment
  const [healthScores, setHealthScoresState] = useState<HealthScores>(DEFAULT_SCORES);
  const [healthAssessmentHistory, setHealthAssessmentHistory] = useState<{ timestamp: string; totalScore: number }[]>([]);

  // Zyne Chats
  const [conversations, setConversations] = useState<ZyneChatSession[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [messageAllowanceUsed, setMessageAllowanceUsed] = useState<number>(0);

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
    setMessageAllowanceUsed(0);
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

      if (isFree) {
        setMessageAllowanceUsed((u) => u + 1);
      }
    }

    return newId;
  };

  const sendChatMessage = async (content: string) => {
    if (!activeConversationId) return;

    // Check message limit first
    if (role === "Free" && messageAllowanceUsed >= 5) {
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
                content: "You have reached your 5 free messages limit on the Zyne VA free tier. Please upgrade your plan in Plan & Payments to continue chatting with Zyne VC.",
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
    
    if (role === "Free") {
      setMessageAllowanceUsed((u) => u + 1);
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
      // Virtual Assistant Response (simpler platform help)
      let answer = "I am the Zyne Virtual Assistant. I help you navigate the Think10 platform. For deeper business diagnostics, recommendations, and custom reports, please upgrade to a paid Plan to unlock Zyne VC.";
      
      if (text.includes("onboarding") || text.includes("start")) {
        answer = "To complete your onboarding, go to your Business profile tab, fill in the business information, and take the 10-dimension Business Health Assessment. After that, choose an advisory plan.";
      } else if (text.includes("expert") || text.includes("book") || text.includes("call")) {
        answer = "You can book vetted experts in the Advisors tab. Hybrid members get 2 credits included monthly, Premium members get 5. As a Free user, you can book on a pay-per-call basis.";
      } else if (text.includes("report") || text.includes("pdf")) {
        answer = "Reports are generated after completing a consultation with a human advisor. You can view them in the Bookings or Documents tab.";
      }

      return {
        role: "zyne",
        content: answer,
        timestamp: nowStr,
      };
    } else {
      // Virtual Consultant Response via Gemini
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE" || apiKey === "") {
        return {
          role: "zyne",
          content: "System Alert: Gemini API Key is not configured. Please add VITE_GEMINI_API_KEY in the .env file.",
          timestamp: nowStr,
          sections: {
            understanding: "API configuration missing.",
            recommendation: "Please set up the environment variables to activate Zyne's intelligence engine.",
            assumptions: "None",
            risks: "Zyne VC cannot function without an API key.",
            nextActions: ["Configure VITE_GEMINI_API_KEY"],
            sources: ["System Setup Guide"]
          }
        };
      }

      try {
        const systemPrompt = `You are Zyne VC, Think10's expert AI business consultant specializing exclusively in Dubai and GCC retail and e-commerce.

Your expertise covers:
- Amazon UAE and noon.com marketplace strategy (listings, PPC, ACOS optimization)
- UAE retail and Shopify DTC (conversion, AOV, LTV, subscription)
- GCC market entry strategy (Dubai, Abu Dhabi, KSA, Qatar, Kuwait)
- UAE import regulations, customs, VAT (5%), and logistics
- UAE-specific consumer behavior and seasonal campaigns (Ramadan, White Friday, DSF, Eid)
- B2B wholesale and distributor channels in GCC
- Cash flow, unit economics, and margin optimization for GCC brands
- Supply chain and 3PL in UAE (Aramex, Fetchr, Shipa Freight)
- Digital marketing in UAE (Meta, TikTok, Google Ads, influencer marketing)

Client Business Profile:
- Business: ${profile.businessName || 'Not specified'}
- Industry: ${profile.industry || 'Not specified'}
- Stage: ${profile.stage || 'Not specified'}
- Active Channels: ${profile.channels.length > 0 ? profile.channels.join(', ') : 'Not specified'}
- Goals: ${profile.goals.length > 0 ? profile.goals.join(', ') : 'Not specified'}
- Annual Revenue: ${profile.revenue || 'Not specified'}

Rules:
- ONLY discuss Dubai/GCC retail and e-commerce topics relevant to this client.
- If asked about unrelated topics, politely redirect to GCC business matters.
- Be direct, data-driven, and immediately actionable.
- Reference UAE-specific platforms, regulations, and market conditions.
- Suggest escalating to a human Think10 expert when deep judgment or relationship-building is needed.

Respond in valid JSON only with this exact structure:
{
  "understanding": "1 sentence showing you understand their specific GCC context",
  "recommendation": "A detailed multi-paragraph diagnosis and recommendation",
  "assumptions": "1 sentence outlining key assumptions",
  "risks": "1 sentence highlighting main risks",
  "nextActions": ["Action 1", "Action 2", "Action 3"],
  "sources": ["Source or benchmark 1", "Source 2"]
}
Do not use markdown blocks. Output raw JSON only.`;

        const requestBody = {
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            ...history.map(msg => ({
              role: msg.role === "zyne" ? "model" : "user",
              parts: [{ text: msg.sections ? JSON.stringify(msg.sections) : msg.content }]
            })),
            {
              role: "user",
              parts: [{ text: input }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || "Gemini API error");
        }

        const rawText = data.candidates[0]?.content?.parts[0]?.text;
        if (!rawText) throw new Error("Empty response from AI");

        // Clean the response just in case it has markdown ticks
        const cleanedText = rawText.replace(/^```json/g, '').replace(/```$/g, '').trim();
        const parsed = JSON.parse(cleanedText);

        return {
          role: "zyne",
          content: "Here is my structured diagnosis.", // fallback plain text
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
      } catch (err: any) {
        console.error("Gemini API Error:", err);
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

  const completeCall = (bookingId: string, rating: number, feedback: string) => {
    import("@/lib/server-actions").then(({ updateBookingStatusFn }) => {
      updateBookingStatusFn({ data: { id: bookingId, status: "COMPLETED" } })
        .then(() => setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "COMPLETED", rating, feedback } : b)))
        .catch(err => console.error(err));
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
    const newTask: ActionItem = {
      id: "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      title,
      done: false,
      owner,
      deadline,
      source,
      sourceLink,
      notes,
    };
    setActionItems((prev) => [newTask, ...prev]);
  };

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const updateActionItem = (id: string, updates: Partial<ActionItem>) => {
    setActionItems((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteActionItem = (id: string) => {
    setActionItems((prev) => prev.filter((t) => t.id !== id));
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
        messageAllowanceUsed,
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
