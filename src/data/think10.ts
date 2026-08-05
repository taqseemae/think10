export const NAV = [
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Advisory Areas", to: "/#advisory-areas" },
  { label: "Who It's For", to: "/#who-its-for" },
  { label: "Our Experts", to: "/#experts" },
  { label: "Plans & Pricing", to: "/#plans" },
] as const;

export type AdvisoryArea = {
  slug: string;
  title: string;
  short: string;
  outcome: string;
  questions: string[];
  zyneHelps: string[];
  whenHuman: string[];
  icon: string;
};

export const ADVISORY_AREAS: AdvisoryArea[] = [
  {
    slug: "business-launch",
    title: "Business Launch & Feasibility",
    short: "Validate the idea, model the numbers, choose the right structure.",
    outcome: "A validated concept with a realistic launch plan and licensing route.",
    questions: [
      "Is my product idea viable in the UAE market?",
      "Mainland, free zone, or dropshipping licence — what fits my model?",
      "What are realistic 12-month revenue and cost assumptions?",
    ],
    zyneHelps: [
      "Structure a feasibility brief in minutes",
      "Stress-test unit economics and break-even",
      "Draft a competitor and positioning map",
    ],
    whenHuman: [
      "Legal structure and licensing trade-offs",
      "Capital-raising conversations",
      "Final go / no-go decisions",
    ],
    icon: "Rocket",
  },
  {
    slug: "brand-product",
    title: "Brand & Product",
    short: "Positioning, product architecture, packaging and pricing story.",
    outcome: "A clear brand system your team, agencies and marketplaces can execute against.",
    questions: [
      "How do I position against established UAE brands?",
      "Which SKUs should lead my launch range?",
      "What price ladder works across DTC and marketplaces?",
    ],
    zyneHelps: [
      "Draft brand and product briefs",
      "Compare positioning against 5–10 competitors",
      "Generate naming and messaging options",
    ],
    whenHuman: [
      "Brand identity direction",
      "Packaging and unit-cost decisions",
      "Category strategy for retail buyers",
    ],
    icon: "Sparkle",
  },
  {
    slug: "ecommerce-marketplaces",
    title: "E-commerce & Marketplaces",
    short: "Shopify, Amazon UAE, noon, TikTok Shop and D2C growth.",
    outcome: "A prioritised channel plan with launch, listing and ads roadmap.",
    questions: [
      "Should I launch on Amazon UAE, noon, or my own store first?",
      "Why are my conversion rates below 1%?",
      "How do I fix listing quality on noon?",
    ],
    zyneHelps: [
      "Audit product listings",
      "Draft launch and promo calendars",
      "Map fulfilment options (FBA, noon Express, 3PL)",
    ],
    whenHuman: [
      "Amazon/noon account escalations",
      "Advanced PPC restructures",
      "Multi-channel P&L trade-offs",
    ],
    icon: "ShoppingBag",
  },
  {
    slug: "retail-operations",
    title: "Retail Operations",
    short: "Store, mall, pop-up and wholesale operations.",
    outcome: "Tighter store economics and buyer-ready wholesale collateral.",
    questions: [
      "Is my rent-to-sales ratio sustainable?",
      "How do I get into Ounass, Bloomingdale's or Level Shoes?",
      "How do I structure my first pop-up?",
    ],
    zyneHelps: [
      "Model store P&L scenarios",
      "Draft buyer pitch decks and linesheets",
      "Build daily and weekly store KPIs",
    ],
    whenHuman: ["Landlord and mall negotiations", "Buyer meetings and terms", "Retail team hiring"],
    icon: "Store",
  },
  {
    slug: "marketing-sales",
    title: "Marketing & Sales",
    short: "Positioning, content, paid, influencer and CRM in the UAE.",
    outcome: "A marketing plan tied to revenue, not just impressions.",
    questions: [
      "Why is my Meta CAC 3x my AOV?",
      "Which influencers actually convert in the UAE?",
      "How should I split spend across Meta, TikTok and Google?",
    ],
    zyneHelps: [
      "Draft content and campaign briefs",
      "Suggest funnel and offer changes",
      "Benchmark KPIs against category norms",
    ],
    whenHuman: ["Media buying restructures", "Influencer contracts", "CRM and lifecycle rebuilds"],
    icon: "Megaphone",
  },
  {
    slug: "finance-pricing",
    title: "Finance, Pricing & Cash Flow",
    short: "Unit economics, pricing, cash runway and forecasting.",
    outcome: "A pricing and cash model you actually trust.",
    questions: [
      "Am I actually profitable after marketplace fees?",
      "How do I price for both DTC and wholesale?",
      "How long is my real cash runway?",
    ],
    zyneHelps: [
      "Build unit-economics templates",
      "Model pricing and discount scenarios",
      "Flag cash-flow risks early",
    ],
    whenHuman: [
      "Investor-grade financial models",
      "Fundraising conversations",
      "Restructuring or turnaround decisions",
    ],
    icon: "LineChart",
  },
  {
    slug: "supply-chain-logistics",
    title: "Supply Chain & Logistics",
    short: "Sourcing, inventory, 3PL, customs and returns.",
    outcome: "Reliable stock, fewer stock-outs, healthier working capital.",
    questions: [
      "How do I choose a 3PL in the UAE?",
      "How much inventory should I hold for a Ramadan launch?",
      "Why are my returns eating my margin?",
    ],
    zyneHelps: [
      "Build reorder and safety-stock models",
      "Compare 3PL and fulfilment options",
      "Draft supplier RFQs",
    ],
    whenHuman: [
      "Supplier negotiations",
      "Customs and compliance issues",
      "Warehouse layout and WMS choices",
    ],
    icon: "Truck",
  },
  {
    slug: "people-systems-automation",
    title: "People, Systems & Automation",
    short: "Team, SOPs, tooling, AI and automation.",
    outcome: "A leaner operation that runs without you in every decision.",
    questions: [
      "What should my first 3 hires actually do?",
      "How do I document SOPs my team will use?",
      "Where should I use AI in my business?",
    ],
    zyneHelps: [
      "Draft role scorecards and SOPs",
      "Map current-vs-future workflows",
      "Recommend tools and automations",
    ],
    whenHuman: [
      "Org design and compensation",
      "Founder / partner conflicts",
      "Implementing new systems",
    ],
    icon: "Settings2",
  },
];

export type Expert = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  experienceYears: number;
  areas: string[];
  languages: string[];
  location: string;
  sessionTypes: string[];
  pricePlaceholder: string;
  availability: string[];
  verified: boolean;
  initials: string;
};

export const EXPERTS: Expert[] = [
  {
    slug: "tariq-al-mansoor",
    name: "Tariq Al-Mansoor",
    role: "E-commerce & Marketplace Lead",
    bio: "Former Head of E-commerce at major GCC retail group. Scaled 15+ DTC and Amazon UAE listings to AED 10M+ annual GMV.",
    experienceYears: 14,
    areas: ["ecommerce-marketplaces", "brand-product", "finance-pricing"],
    languages: ["English", "Arabic"],
    location: "Dubai, UAE",
    sessionTypes: ["60-Min Strategy Session", "30-Min Rapid Audit"],
    pricePlaceholder: "AED 550",
    availability: ["Mon", "Wed", "Thu"],
    verified: true,
    initials: "TM",
  },
  {
    slug: "fatima-al-zahra",
    name: "Fatima Al-Zahra",
    role: "Retail Operations & Sourcing Director",
    bio: "Specialist in GCC retail expansion, mall lease negotiations, and supply chain logistics between Turkey, China & UAE.",
    experienceYears: 12,
    areas: ["retail-operations", "supply-chain-logistics", "business-launch"],
    languages: ["English", "Arabic", "French"],
    location: "Abu Dhabi, UAE",
    sessionTypes: ["60-Min Strategy Session"],
    pricePlaceholder: "AED 600",
    availability: ["Tue", "Thu", "Fri"],
    verified: true,
    initials: "FA",
  },
  {
    slug: "sarah-jenkins",
    name: "Sarah Jenkins",
    role: "DTC Performance & CAC Specialist",
    bio: "Ex-Meta performance marketer who managed AED 25M+ media spend across GCC. Expert in Shopify conversion rate & ad attribution.",
    experienceYears: 10,
    areas: ["marketing-sales", "ecommerce-marketplaces"],
    languages: ["English"],
    location: "Dubai, UAE",
    sessionTypes: ["60-Min Deep Dive"],
    pricePlaceholder: "AED 480",
    availability: ["Mon", "Tue", "Wed"],
    verified: true,
    initials: "SJ",
  },
  {
    slug: "vikram-sharma",
    name: "Vikram Sharma",
    role: "Fractional CFO & Unit Economics Expert",
    bio: "Helped 30+ regional startups build investor-ready P&L financial models, manage cash runway, and structure pricing ladders.",
    experienceYears: 16,
    areas: ["finance-pricing", "business-launch", "people-systems-automation"],
    languages: ["English", "Hindi"],
    location: "Dubai, UAE",
    sessionTypes: ["60-Min Financial Audit"],
    pricePlaceholder: "AED 650",
    availability: ["Wed", "Thu", "Fri"],
    verified: true,
    initials: "VS",
  },
];

export type Resource = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string[];
  readTime: string;
  date: string;
  author: string;
  reviewer: string;
};

export const RESOURCES: Resource[] = [
  {
    slug: "launching-in-uae",
    title: "Launching a retail or e-commerce brand in the UAE",
    category: "Launch",
    excerpt: "A practical starting point covering licensing, positioning and the first 90 days.",
    readTime: "9 min",
    date: "2026-01-14",
    author: "Think10 Editorial",
    reviewer: "Reviewed by a Think10 advisor (placeholder)",
    body: [
      "Most UAE launches fail on execution, not on idea quality. This guide covers the decisions that determine whether your first year is spent building momentum or fixing avoidable mistakes.",
      "We walk through mainland vs free zone licensing, initial channel choice (own store, Amazon UAE, noon, wholesale), and the operational stack you need in place before your first order.",
      "You'll also find a 90-day launch checklist, a simple unit-economics template and the questions Zyne will ask you before you go live.",
    ],
  },
  {
    slug: "amazon-noon-checklist",
    title: "The Amazon UAE and noon marketplace readiness checklist",
    category: "Marketplaces",
    excerpt: "Everything to prepare before you list your first SKU on Amazon UAE or noon.",
    readTime: "12 min",
    date: "2026-02-02",
    author: "Think10 Editorial",
    reviewer: "Reviewed by a Think10 advisor (placeholder)",
    body: [
      "Listing on a marketplace is not the same as being ready to compete on one. This checklist covers legal, catalog, content, pricing, fulfilment and PPC readiness for Amazon UAE and noon.",
      "We cover FBA vs FBM, noon Express eligibility, A+ content, backend keywords, VAT considerations and the fees that quietly eat your margin.",
      "Use it before your launch, and again 30 and 90 days in as a health check.",
    ],
  },
  {
    slug: "inventory-planning-uae",
    title: "Inventory planning for UAE founders: Ramadan, DSF and beyond",
    category: "Supply Chain",
    excerpt: "How to plan stock for UAE's seasonality without over-ordering.",
    readTime: "8 min",
    date: "2026-02-20",
    author: "Think10 Editorial",
    reviewer: "Reviewed by a Think10 advisor (placeholder)",
    body: [
      "The UAE calendar has real inventory implications: Ramadan, Eid, DSF, back-to-school and White Friday all shift demand meaningfully.",
      "This guide walks through a lightweight demand plan, reorder points, safety stock and how to negotiate lead times with suppliers in China, Turkey and India.",
      "It also covers what to do when you get it wrong — clearing stock without destroying your brand.",
    ],
  },
  {
    slug: "protecting-your-margins",
    title: "Protecting your margins across DTC, wholesale and marketplaces",
    category: "Finance",
    excerpt: "A framework for pricing across channels without cannibalising yourself.",
    readTime: "10 min",
    date: "2026-03-05",
    author: "Think10 Editorial",
    reviewer: "Reviewed by a Think10 advisor (placeholder)",
    body: [
      "Most founders price their DTC store, then panic-price their marketplace listings. This guide inverts that and starts from a channel-by-channel unit economics view.",
      "We cover MSRP, distributor and wholesale margins, marketplace fees, returns provisions and how to keep a coherent price ladder.",
      "Includes a downloadable-style template you can rebuild in a spreadsheet.",
    ],
  },
  {
    slug: "branding-that-travels",
    title: "Branding that travels: local roots, regional reach",
    category: "Brand",
    excerpt: "How to build a UAE-born brand that also works in KSA, Kuwait and beyond.",
    readTime: "7 min",
    date: "2026-03-19",
    author: "Think10 Editorial",
    reviewer: "Reviewed by a Think10 advisor (placeholder)",
    body: [
      "The UAE is a fantastic launch market, but ceilings arrive faster than founders expect. Regional expansion into KSA and the wider GCC is often the next serious growth lever.",
      "This piece covers what to nail in your brand system so it stretches: naming, bilingual identity, tone of voice and packaging that clears customs and shelves in multiple markets.",
      "It ends with a checklist you can hand to your designer, agency or Zyne to structure the work.",
    ],
  },
  {
    slug: "automation-for-lean-teams",
    title: "Automation for lean founder teams",
    category: "Systems",
    excerpt: "Where AI and automation deliver real leverage — and where they don't.",
    readTime: "9 min",
    date: "2026-04-02",
    author: "Think10 Editorial",
    reviewer: "Reviewed by a Think10 advisor (placeholder)",
    body: [
      "Automation is easy to talk about and hard to sequence. This guide is a practical map of where founder-led teams get real leverage — customer service, listings, reporting, content briefs, finance ops.",
      "We also flag the areas where premature automation makes things worse, especially early customer conversations and pricing decisions.",
      "Use it to sequence your next 90 days of tool and AI adoption.",
    ],
  },
];

export type CaseStudy = {
  slug: string;
  title: string;
  situation: string;
  decision: string;
  action: string;
  outcome: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "beauty-brand-marketplace-launch",
    title: "Illustrative: Beauty brand preparing an Amazon UAE launch",
    situation:
      "A founder-led beauty brand with a Shopify store and modest social following was preparing to list on Amazon UAE without a clear catalog or margin plan.",
    decision:
      "Zyne mapped listing readiness and unit economics. A marketplace expert reviewed the plan and confirmed which SKUs to lead with.",
    action:
      "The team rebuilt six hero listings, restructured pricing to protect DTC, and set an initial PPC and review-generation plan.",
    outcome:
      "The brand launched with a defensible margin, a clear ranking plan and a monthly review cadence with their expert.",
  },
  {
    slug: "concept-retail-expansion",
    title: "Illustrative: Concept retail brand deciding on a second store",
    situation:
      "A single-store concept retailer was under pressure to open a second location in a new mall.",
    decision:
      "Zyne modelled three location scenarios. A retail advisor pressure-tested rent, footfall and staffing assumptions.",
    action:
      "The founder renegotiated key terms, delayed the second store by one quarter and invested in a pop-up test first.",
    outcome:
      "The brand entered the second location with real demand evidence and a stronger lease position.",
  },
  {
    slug: "food-brand-cash-flow",
    title: "Illustrative: Food brand under cash-flow pressure",
    situation:
      "A fast-growing food brand was profitable on paper but constantly running out of cash before payroll.",
    decision:
      "Zyne rebuilt the cash-flow model. A finance advisor identified the working-capital gap between distributor payments and supplier terms.",
    action:
      "The team renegotiated supplier terms, tightened distributor collections and introduced a 13-week cash forecast reviewed monthly.",
    outcome:
      "Cash runway stabilised without raising external capital, and the founder stopped making decisions from a place of panic.",
  },
];

export const PLANS = [
  {
    id: "zyne",
    name: "Zyne",
    price: "Free during preview",
    tagline: "Your always-on AI business advisor.",
    features: [
      "Unlimited business diagnosis chats",
      "Session prep, action plans and follow-ups",
      "Save context to your Command Centre",
      "Escalate to a human expert any time",
    ],
    cta: "Ask Zyne",
    href: "/zyne",
    highlight: false,
  },
  {
    id: "expert-session",
    name: "Expert Session",
    price: "From AED — / session",
    tagline: "One-off 60-minute call with a vetted UAE expert.",
    features: [
      "Matched to your business and area",
      "Zyne-prepared brief before the call",
      "Session summary and action plan after",
      "Recording available on request",
    ],
    cta: "Book an expert",
    href: "/experts",
    highlight: false,
  },
  {
    id: "membership",
    name: "Think10 Membership",
    price: "From AED — / month",
    tagline: "Continuous AI + expert credits for founders operating a business.",
    features: [
      "Monthly expert credits (top-ups available)",
      "Priority matching and scheduling",
      "Full Command Centre with goals and documents",
      "Quarterly business review with Zyne",
    ],
    cta: "Start membership",
    href: "/signup",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium Advisory",
    price: "By application",
    tagline: "Ongoing advisory for founders scaling beyond AED 5M.",
    features: [
      "Dedicated lead advisor + expert bench",
      "Board-style monthly review",
      "Custom Command Centre workspace",
      "Direct WhatsApp access during business hours",
    ],
    cta: "Apply for premium",
    href: "/premium-advisory",
    highlight: false,
  },
] as const;

export const TRUST_CLAIMS = [
  { value: "AED 400M+", label: "Sales advised", note: "placeholder" },
  { value: "12+ years", label: "UAE market experience", note: "placeholder" },
  { value: "Vetted", label: "Human experts", note: "" },
  { value: "Confidential", label: "By design", note: "" },
];

export const FAQS = [
  {
    q: "Is Think10 a course, coaching or a consultancy?",
    a: "None of those. Think10 is a business advisory system: Zyne (AI) for immediate guidance, vetted human experts for judgement calls, and a Command Centre that keeps everything joined up.",
  },
  {
    q: "Do I have to commit long-term?",
    a: "No. You can start with a single Zyne conversation or one expert session. Membership and Premium Advisory are optional when you want continuity.",
  },
  {
    q: "Is my business information confidential?",
    a: "Yes. Experts operate under confidentiality terms and session recordings are only shared with you. See our Recording & Confidentiality page for full details.",
  },
  {
    q: "Can Zyne replace a human advisor?",
    a: "No. Zyne is excellent for diagnosis, structuring, preparation and follow-through. When a decision has real cost or risk, a human expert is the right call.",
  },
  {
    q: "Is Think10 only for women founders?",
    a: "Think10 is primarily built for UAE women founders aged 25–60, but membership is open to all founders operating retail, e-commerce, marketplace and product-based businesses.",
  },
];
