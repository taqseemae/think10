import React, { createContext, useContext, useState, useEffect } from "react";
import { type Expert, EXPERTS } from "@/data/think10";
import { useAuth } from "@/context/AuthContext";

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
  startNewChat: (initialMessage?: string) => string;
  sendChatMessage: (content: string) => void;
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
  rescheduleBooking: (bookingId: string, newSlot: string) => void;
  triggerServiceRecovery: (bookingId: string, type: "TECH_FAILURE" | "NO_SHOW") => void;
  completeCall: (bookingId: string, rating: number, feedback: string) => void;

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

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State — delegated to Firebase AuthContext
  const { currentUser, logout: firebaseLogout, authLoading } = useAuth();
  const isLoggedIn = !!currentUser;

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
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("t10_role") as UserRole) || "Free";
    }
    return "Free";
  });

  const [floatingAlert, setFloatingAlert] = useState<AlertNotification | null>(null);

  // Onboarding
  const [onboardingCompleted, setOnboardingCompletedState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("t10_onboarding_completed") === "true";
    }
    return false;
  });
  const [onboardingStep, setOnboardingStepState] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("t10_onboarding_step") || "1");
    }
    return 1;
  });

  // Business Profile
  const [profile, setProfileState] = useState<BusinessProfile>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_profile");
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    }
    return DEFAULT_PROFILE;
  });

  const [profileAuditLogs, setProfileAuditLogs] = useState<AuditLogEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_profile_audit");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Health Assessment
  const [healthScores, setHealthScoresState] = useState<HealthScores>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_health_scores");
      return saved ? JSON.parse(saved) : DEFAULT_SCORES;
    }
    return DEFAULT_SCORES;
  });

  const [healthAssessmentHistory, setHealthAssessmentHistory] = useState<{ timestamp: string; totalScore: number }[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_health_history");
      return saved ? JSON.parse(saved) : [{ timestamp: "2026-06-15 10:00", totalScore: 57 }];
    }
    return [{ timestamp: "2026-06-15 10:00", totalScore: 57 }];
  });

  // Zyne Chats
  const [conversations, setConversations] = useState<ZyneChatSession[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_conversations");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("t10_active_chat_id");
    }
    return null;
  });
  const [messageAllowanceUsed, setMessageAllowanceUsed] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("t10_msg_allowance") || "0");
    }
    return 0;
  });

  // Bookings (Sessions) — starts empty for real users
  const [bookings, setBookings] = useState<BookingSession[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_bookings");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Action Items — starts empty for real users
  const [actionItems, setActionItems] = useState<ActionItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_action_items");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Billing & Credits — starts at 0 for real users
  const [credits, setCredits] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_credits");
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const [creditsLedger, setCreditsLedger] = useState<LedgerEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_ledger");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [invoices] = useState<{ id: string; date: string; amount: string; status: string }[]>([]);

  // Documents — starts empty for real users
  const [documents, setDocuments] = useState<LibraryDocument[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_documents");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Community Posts
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_posts");
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: "p1",
        space: "Launch",
        title: "Mainland vs Freezone licensing costs in Dubai",
        author: "Sarah J.",
        authorCompany: "Opal Skin",
        content: "Just spent 3 weeks navigating DED Mainland vs Meydan Freezone. Meydan was significantly cheaper for e-commerce, but mainland lets us hold local stock without a 3PL. Happy to share my DED cost sheet if anyone needs it!",
        likes: 12,
        likedByUser: false,
        timestamp: "2026-07-12 14:00",
        comments: [
          { id: "c1", author: "Reem Al M.", content: "Please share! I am in the exact same dilemma.", timestamp: "2026-07-12 15:30" },
        ],
      },
      {
        id: "p2",
        space: "Marketing",
        title: "Meta Ads GCC CPA benchmark - Q2 2026",
        author: "Layla Hassan",
        authorCompany: "Advisor",
        content: "Seeing CPMs climb 15% across UAE & KSA retail beauty sectors this quarter. I highly recommend running broad targeting with custom creator videos rather than micro-interest segments. Happy to discuss in our office hours next Wed.",
        likes: 24,
        likedByUser: true,
        timestamp: "2026-07-10 09:00",
        comments: [],
      },
    ];
  });

  // Connections Record — starts empty for real users
  const [connections, setConnections] = useState<Record<string, "CONNECT" | "PENDING" | "ACCEPTED" | "BLOCKED">>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_connections");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("t10_tickets");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Write changes to localStorage when states update
  useEffect(() => {
    localStorage.setItem("t10_role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("t10_onboarding_completed", String(onboardingCompleted));
  }, [onboardingCompleted]);

  useEffect(() => {
    localStorage.setItem("t10_onboarding_step", String(onboardingStep));
  }, [onboardingStep]);

  useEffect(() => {
    localStorage.setItem("t10_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("t10_profile_audit", JSON.stringify(profileAuditLogs));
  }, [profileAuditLogs]);

  useEffect(() => {
    localStorage.setItem("t10_health_scores", JSON.stringify(healthScores));
  }, [healthScores]);

  useEffect(() => {
    localStorage.setItem("t10_health_history", JSON.stringify(healthAssessmentHistory));
  }, [healthAssessmentHistory]);

  useEffect(() => {
    localStorage.setItem("t10_conversations", JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem("t10_active_chat_id", activeConversationId || "");
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem("t10_msg_allowance", String(messageAllowanceUsed));
  }, [messageAllowanceUsed]);

  useEffect(() => {
    localStorage.setItem("t10_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("t10_action_items", JSON.stringify(actionItems));
  }, [actionItems]);

  useEffect(() => {
    localStorage.setItem("t10_credits", String(credits));
  }, [credits]);

  useEffect(() => {
    localStorage.setItem("t10_ledger", JSON.stringify(creditsLedger));
  }, [creditsLedger]);

  useEffect(() => {
    localStorage.setItem("t10_documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem("t10_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("t10_connections", JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem("t10_tickets", JSON.stringify(tickets));
  }, [tickets]);

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
    
    setProfileState((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });

    addAuditLog(`profile.${field}`, oldVal, newVal);
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
  const startNewChat = (initialMessage?: string) => {
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

    if (initialMessage) {
      newSession.messages.push({
        role: "user",
        content: initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      // Generate initial AI response
      const answer = generateZyneResponse(initialMessage, type);
      newSession.messages.push(answer);
      if (isFree) {
        setMessageAllowanceUsed((u) => u + 1);
      }
    }

    setConversations((prev) => [newSession, ...prev]);
    setActiveConversationIdState(newId);
    return newId;
  };

  const sendChatMessage = (content: string) => {
    if (!activeConversationId) return;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversationId) return c;

        // Message limit checking for Free users
        if (role === "Free" && messageAllowanceUsed >= 5) {
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
        }

        const userMsg: ChatMessage = {
          role: "user",
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const responseMsg = generateZyneResponse(content, c.type);
        
        if (role === "Free") {
          setMessageAllowanceUsed((u) => u + 1);
        }

        let title = c.title;
        if (c.messages.length === 0) {
          title = content.length > 25 ? content.substr(0, 25) + "..." : content;
        }

        return {
          ...c,
          title,
          messages: [...c.messages, userMsg, responseMsg],
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

  const generateZyneResponse = (input: string, type: "VA" | "VC"): ChatMessage => {
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
      // Virtual Consultant Response (detailed diagnostics)
      let understanding = `Analyzing UAE ${profile.industry} business context. Stage: ${profile.stage}. Channels: ${profile.channels.join(", ")}. Primary Goals: ${profile.goals.slice(0, 2).join(", ")}.`;
      let recommendation = "";
      let assumptions = "Assuming local stock fulfillment via standard UAE carriers; Meta CPC averages AED 1.8–2.5; Shopify store is optimized for mobile checkout.";
      let risks = "Fulfilment delays with noon express during peak seasons; high ad waste if catalog pricing isn't aligned.";
      let nextActions: string[] = [];
      let sources = ["Think10 UAE Launch Guide", "Amazon UAE Seller Commission Matrix 2026"];

      if (text.includes("amazon") || text.includes("noon") || text.includes("marketplace") || text.includes("launch")) {
        recommendation = `For your Amazon UAE launch in ${profile.industry}, focus on 3 high-margin SKUs to build initial review velocity. Price them competitively (10-15% below MSRP) for the first 30 days and set a daily PPC budget of AED 150. Optimize listing backend keywords for GCC search intent (e.g. Ramadan focus).`;
        nextActions = [
          "Rebuild 6 hero listings on Amazon UAE",
          "Book Amazon UAE launch review with expert Layla Hassan",
          "Confirm 3PL margins with Fetchr and iMile",
        ];
      } else if (text.includes("price") || text.includes("margin") || text.includes("wholesale") || text.includes("cost")) {
        recommendation = "To protect pricing margins across DTC and wholesale, implement a three-tiered pricing framework: MSRP on Shopify, -30% wholesale/distributor floor, and promotional campaigns isolated on Amazon to avoid catalog conflict. Maintain minimum 60% gross margin on DTC items.";
        nextActions = [
          "Draft new pricing ladder across DTC + noon",
          "Upload product cost breakdown sheet to Documents",
          "Book pricing sanity check session with finance expert Priya Menon",
        ];
      } else if (text.includes("cash") || text.includes("runway") || text.includes("finance")) {
        recommendation = `Given your challenge of '${profile.challenges[1]}', we must extend your runway. Shift supplier payment terms from 50% upfront to Net-30 where possible. Keep cash reserves equivalent to 3 months of operational burn (staffing, Shopify apps, basic rent).`;
        nextActions = [
          "Prep Q4 cash-flow model for expert review",
          "Consolidate daily invoice sheets into Documents",
        ];
      } else {
        recommendation = `Welcome! I have loaded your business profile for '${profile.businessName}'. I recommend starting with a Business Health Assessment in the 'My Business' tab to map your priority growth areas, or booking a 60-min session with Layla Hassan to audit your launch strategy.`;
        nextActions = [
          "Complete Business Health Assessment",
          "Browse vetted experts in Advisors panel",
        ];
      }

      return {
        role: "zyne",
        content: `Here is my structured diagnosis:\n\n${recommendation}\n\nKey risks include: ${risks}`,
        timestamp: nowStr,
        sections: {
          understanding,
          recommendation,
          assumptions,
          risks,
          nextActions,
          sources,
        },
      };
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

    const newBooking: BookingSession = {
      id: "booking_" + Date.now(),
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

    setBookings((prev) => [newBooking, ...prev]);

    // Create automated pre-call actions
    addActionItem(
      `Pre-call prep with ${expert.name}`,
      "Founder",
      slot.split(" ")[1] || "2026-07-20",
      "Manual",
      newBooking.id,
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
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        
        // Restore credit if within policy
        const needsCredit = role === "Hybrid" || role === "Premium";
        if (needsCredit) {
          const target = credits + 1;
          setCredits(target);
          addLedgerEntry(`Cancelled session with ${b.expertName} (Credit restored)`, 1, target);
        }
        
        return { ...b, status: "CANCELLED" as const };
      })
    );
    // Remove related action items
    setActionItems((prev) => prev.filter((i) => i.sourceLink !== bookingId));

    setFloatingAlert({
      id: "alert_cancel_" + Date.now(),
      type: "info",
      message: "Session successfully cancelled.",
      dismissible: true,
    });
  };

  const rescheduleBooking = (bookingId: string, newSlot: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return { ...b, when: newSlot };
        }
        return b;
      })
    );

    setFloatingAlert({
      id: "alert_resched_" + Date.now(),
      type: "success",
      message: `Session rescheduled to ${newSlot}`,
      dismissible: true,
    });
  };

  const triggerServiceRecovery = (bookingId: string, type: "TECH_FAILURE" | "NO_SHOW") => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          // Restore credits automatically
          const target = credits + 1;
          setCredits(target);
          addLedgerEntry(`Service Recovery: Credit restored for failed session with ${b.expertName}`, 1, target);
          return { ...b, status: type };
        }
        return b;
      })
    );

    const booking = bookings.find((b) => b.id === bookingId);
    const expertName = booking ? booking.expertName : "Advisor";

    // Create a support ticket
    createSupportTicket(
      type === "TECH_FAILURE" ? "Technical Issue during Call" : "Advisor No-Show Complaint",
      `System automatically opened this ticket because booking '${bookingId}' with ${expertName} failed due to: ${type}. Immediate refund credit of 1 unit was issued to customer.`,
      bookingId
    );

    setFloatingAlert({
      id: "alert_sr_" + Date.now(),
      type: "error",
      message: `Session failed: ${type === "TECH_FAILURE" ? "Connection lost" : "Advisor did not attend"}. Credit restored instantly. Support ticket created.`,
      dismissible: true,
    });
  };

  const completeCall = (bookingId: string, rating: number, feedback: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    // Generate mock consultant report based on expert specialization
    const report: SessionReport = {
      summary: `Successfully conducted 60-min session with ${booking.expertName} regarding '${booking.topic}'. Reviewed P&L documents and product catalog listings.`,
      recommendations: [
        `Complete PPC restructure as recommended by ${booking.expertName}`,
        "Renegotiate supplier payment milestones (aim for Net-30 on subsequent raw orders)",
        "Audit noon catalog listings weekly to prevent silent brand takeovers",
      ],
      actionItems: [
        `Submit revised linesheet to ${booking.expertName} by end of week`,
        "Set up daily Google Analytics tracking for conversion drop-off",
      ],
      recordingUrl: "#",
      surveyCompleted: true,
    };

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: "COMPLETED" as const,
            rating,
            feedback,
            report,
          };
        }
        return b;
      })
    );

    // Auto-generate Action items
    report.actionItems.forEach((title) => {
      addActionItem(title, "Founder", "2026-07-28", "Expert", bookingId, `Generated from expert session review with ${booking.expertName}`);
    });

    setFloatingAlert({
      id: "alert_comp_" + Date.now(),
      type: "success",
      message: "Call completed! Review summary report in Sessions.",
      dismissible: true,
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
    const newTicket: SupportTicket = {
      id: "ticket_" + Date.now(),
      category,
      description,
      status: "OPEN",
      bookingId,
      createdAt: new Date().toISOString().replace("T", " ").substr(0, 16),
      updates: [
        {
          timestamp: new Date().toISOString().replace("T", " ").substr(0, 16),
          message: "Ticket created. Operations team has been notified.",
        },
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  // Custom setters for wizard
  const setOnboardingCompleted = (val: boolean) => {
    setOnboardingCompletedState(val);
    addAuditLog("onboarding_status", onboardingCompleted ? "complete" : "incomplete", val ? "complete" : "incomplete");
  };

  const setOnboardingStep = (step: number) => {
    setOnboardingStepState(step);
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
        rescheduleBooking,
        triggerServiceRecovery,
        completeCall,
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
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardState must be used within a DashboardStateProvider");
  }
  return context;
};
