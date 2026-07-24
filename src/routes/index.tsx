import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useDashboardState } from "@/context/DashboardStateContext";
import { useAuth } from "@/context/AuthContext";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { SiteShell } from "@/components/site/SiteShell";
import { ADVISORY_AREAS, EXPERTS, PLANS, FAQS } from "@/data/think10";
import {
  ArrowUpRight,
  ArrowRight,
  Star,
  Check,
  MessageCircle,
  LayoutGrid,
  Package,
  Tag,
  User,
  Settings,
  TrendingUp,
  ShieldCheck,
  Users,
  BarChart3,
  Rocket,
  Sparkles as SparkleIcon,
  ShoppingBag,
  Store,
  Megaphone,
  LineChart,
  Truck,
  Settings2,
  Send,
  Plus,
  Minus,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Think10 — Premium AI + Human Business Advisory for UAE Founders" },
      {
        name: "description",
        content:
          "Build and scale your UAE retail & e-commerce business with confidence. Get 24/7 guidance from Zyne AI plus vetted UAE experts for marketplaces, inventory, marketing and growth.",
      },
      {
        name: "keywords",
        content:
          "UAE business advisory, Dubai e-commerce consultant, Amazon UAE, noon marketplace, AI business advisor, retail consulting Dubai, founder advisory GCC",
      },
      { property: "og:title", content: "Think10 — Premium Advisory for UAE Founders" },
      {
        property: "og:description",
        content:
          "AI + human business advisory built for UAE retail, e-commerce and marketplace founders.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Sparkle: SparkleIcon,
  ShoppingBag,
  Store,
  Megaphone,
  LineChart,
  Truck,
  Settings2,
};

function Home() {
  const { isLoggedIn } = useDashboardState();
  const navigate = useNavigate();

  const { userDoc, authLoading, docLoading } = useAuth();

  return (
    <SiteShell>
      <div id="top" />
      <Hero />
      <TrustStrip />
      <BuiltForUAE />
      <WhyThink10 />
      <PlatformExplainer />
      <HowItWorks />
      <AdvisoryAreas />
      <WhoItsFor />
      <ZyneSection />
      <ExpertsSection />
      <PlansSection />
      <FAQSection />
      <ContactCTA />
      <FloatingZyne />
    </SiteShell>
  );
}

/* ---------------- HERO ---------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--t10-mint)] via-[#fbfefd] to-white">
      {/* subtle grid + glow */}
      <div className="pointer-events-none absolute inset-0 t10-grid-bg opacity-80" aria-hidden />
      <div
        className="pointer-events-none absolute -right-20 top-10 h-[520px] w-[520px] rounded-full"
        style={{
          background: "radial-gradient(closest-side, rgba(0,201,139,0.18), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="t10-container relative grid gap-12 py-[50px] lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-emerald)]">
            AI + Human Business Advisory for UAE Founders
          </p>
          <h1 className="mt-6 text-[42px] font-bold leading-[1.05] tracking-tight text-[color:var(--t10-navy)] sm:text-[56px] lg:text-[64px]">
            Build and scale your <span className="whitespace-nowrap">UAE retail</span> &amp;{" "}
            <span className="whitespace-nowrap">e-commerce</span> business{" "}
            <span className="text-[color:var(--t10-emerald)]">with confidence.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[color:var(--t10-grey)]">
            Get 24/7 guidance from Zyne, your AI business advisor, plus practical support from
            vetted UAE retail and e-commerce experts for inventory, marketplaces, marketing, and
            business growth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#zyne"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--t10-emerald)] px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--t10-green)]"
            >
              Start with Zyne <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--t10-emerald)] bg-white px-6 py-3.5 text-[15px] font-semibold text-[color:var(--t10-emerald)] transition-colors hover:bg-[color:var(--t10-mint)]"
            >
              Book a Discovery Call <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["#0c2340", "#00b979", "#c9a84c"].map((c, i) => (
                <span
                  key={i}
                  className="grid h-9 w-9 place-items-center rounded-full border-2 border-white text-xs font-semibold text-white"
                  style={{ background: c }}
                >
                  {["A", "S", "N"][i]}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)]"
                  />
                ))}
              </div>
              <p className="mt-0.5 text-xs text-[color:var(--t10-grey)]">
                Trusted by UAE founders and growing brands
              </p>
            </div>
          </div>
        </div>

        <ZyneHeroMock />
      </div>
    </section>
  );
}

function ZyneHeroMock() {
  // Cycle through 4 scenes: Chat → Apps → Inventory → Pricing
  const SCENES = ["chat", "apps", "inventory", "pricing"] as const;
  type Scene = (typeof SCENES)[number];
  const [sceneIdx, setSceneIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSceneIdx((i) => (i + 1) % SCENES.length), 2400);
    return () => clearInterval(id);
  }, []);
  const scene: Scene = SCENES[sceneIdx];
  const railIcons: { icon: typeof MessageCircle; key: Scene | "user" | "settings" }[] = [
    { icon: MessageCircle, key: "chat" },
    { icon: LayoutGrid, key: "apps" },
    { icon: Package, key: "inventory" },
    { icon: Tag, key: "pricing" },
    { icon: User, key: "user" },
    { icon: Settings, key: "settings" },
  ];
  return (
    <div className="relative">
      <div
        className="absolute -inset-6 rounded-[32px]"
        style={{
          background: "radial-gradient(closest-side, rgba(0,201,139,0.18), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--t10-border)] bg-white shadow-[0_30px_80px_-30px_rgba(8,20,38,0.25)]">
        <div className="grid grid-cols-[56px_1fr]">
          {/* left icon rail */}
          <div className="flex flex-col items-center gap-4 border-r border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] py-5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--t10-emerald)] text-white">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-white" />
            </span>
            {railIcons.map(({ icon: I, key }) => {
              const active = key === scene;
              return (
                <motion.button
                  key={key}
                  className={`relative grid h-9 w-9 place-items-center rounded-lg ${
                    active
                      ? "bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]"
                      : "text-[color:var(--t10-grey)]"
                  }`}
                  animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ duration: 0.5 }}
                  aria-label={key}
                >
                  <I className="h-4 w-4" />
                  {active && (
                    <motion.span
                      layoutId="zyne-rail-active"
                      className="absolute -left-[9px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-[color:var(--t10-emerald)]"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                <motion.p
                  key={scene}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25 }}
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--t10-navy)]"
                >
                  {scene === "chat" && "Zyne Business Advisor"}
                  {scene === "apps" && "Command Centre · Apps"}
                  {scene === "inventory" && "Inventory Intelligence"}
                  {scene === "pricing" && "Pricing & Margins"}
                </motion.p>
              </AnimatePresence>
              <span className="inline-flex items-center gap-1.5 text-xs text-[color:var(--t10-grey)]">
                <motion.span
                  className="h-2 w-2 rounded-full bg-[color:var(--t10-emerald)]"
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
                Online
              </span>
            </div>

            <div className="relative mt-5 h-[460px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {scene === "chat" && <SceneChat />}
                  {scene === "apps" && <SceneApps />}
                  {scene === "inventory" && <SceneInventory />}
                  {scene === "pricing" && <ScenePricing />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      {/* scene progress dots */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {SCENES.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === sceneIdx
                ? "w-8 bg-[color:var(--t10-emerald)]"
                : "w-1.5 bg-[color:var(--t10-border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SceneChat() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--t10-grey)]">
          You
        </p>
        <div className="mt-2 inline-block rounded-2xl bg-[color:var(--t10-offwhite)] px-4 py-2.5 text-sm text-[color:var(--t10-navy)]">
          Which products should I prioritise for my Amazon UAE launch?
        </div>
      </motion.div>
      <motion.div
        className="mt-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--t10-emerald)]">
          Zyne AI
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--t10-navy)]">
          Based on UAE demand, margins, competition and inventory risk, here are the top product
          opportunities for your Amazon launch.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          {[
            <MiniCard
              key="a"
              title="Product Opportunity"
              icon={<TrendingUp className="h-4 w-4 text-[color:var(--t10-emerald)]" />}
              primary="9.2"
              primarySub="High Score"
              footer="Strong demand with healthy margins."
            />,
            <MiniCard
              key="b"
              title="Inventory Risk"
              icon={<Package className="h-4 w-4 text-[color:var(--t10-emerald)]" />}
              primary="Low"
              ring
              footer="Stable supply and low stock risk."
            />,
            <MiniCard
              key="c"
              title="Marketplace Readiness"
              icon={<ShieldCheck className="h-4 w-4 text-[color:var(--t10-emerald)]" />}
              bullets={["Category Demand", "Competition", "Listing Readiness", "Policy Compliance"]}
              footer="Ready to Launch"
            />,
            <MiniCard
              key="d"
              title="Next Step"
              icon={<Users className="h-4 w-4 text-[color:var(--t10-emerald)]" />}
              circle
              footer="Validate shortlisted products with an expert advisor."
            />,
          ].map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.7 + i * 0.1 }}
            >
              {node}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SceneApps() {
  const apps = [
    { icon: MessageCircle, name: "Zyne Chat", tag: "AI advisor" },
    { icon: BarChart3, name: "Analytics", tag: "Live KPIs" },
    { icon: Package, name: "Inventory", tag: "Stock health" },
    { icon: Tag, name: "Pricing", tag: "Margins" },
    { icon: Megaphone, name: "Marketing", tag: "Campaigns" },
    { icon: Truck, name: "Logistics", tag: "Fulfilment" },
    { icon: Users, name: "Experts", tag: "Book a call" },
    { icon: Rocket, name: "Growth Plan", tag: "90-day roadmap" },
  ];
  return (
    <div>
      <p className="text-sm text-[color:var(--t10-grey)]">
        Your Think10 workspace — every tool a UAE founder needs, in one place.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-3">
        {apps.map((a, i) => (
          <motion.div
            key={a.name}
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.05 + i * 0.05 }}
            className="rounded-xl border border-[color:var(--t10-border)] bg-white p-3 hover:border-[color:var(--t10-emerald)]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--t10-mint)]">
              <a.icon className="h-4 w-4 text-[color:var(--t10-emerald)]" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[color:var(--t10-navy)]">{a.name}</p>
            <p className="text-[11px] text-[color:var(--t10-grey)]">{a.tag}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SceneInventory() {
  const rows = [
    { name: "Argan Hair Oil 100ml", sku: "AH-100", stock: 84, status: "Healthy", tone: "emerald" },
    {
      name: "Bamboo Toothbrush 4-pack",
      sku: "BT-04",
      stock: 22,
      status: "Reorder soon",
      tone: "amber",
    },
    { name: "Linen Kaftan (M)", sku: "LK-M", stock: 6, status: "Low", tone: "red" },
    { name: "Ceramic Diffuser", sku: "CD-01", stock: 41, status: "Healthy", tone: "emerald" },
  ];
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--t10-grey)]">
          Live SKU health across Amazon.ae, noon and Shopify.
        </p>
        <span className="rounded-full bg-[color:var(--t10-mint)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--t10-emerald)]">
          4 SKUs
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.sku}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-[color:var(--t10-border)] bg-white px-3 py-2.5"
          >
            <div>
              <p className="text-sm font-semibold text-[color:var(--t10-navy)]">{r.name}</p>
              <p className="text-[11px] text-[color:var(--t10-grey)]">SKU {r.sku}</p>
            </div>
            <div className="w-28">
              <div className="h-1.5 overflow-hidden rounded-full bg-[color:var(--t10-offwhite)]">
                <motion.div
                  className={`h-full ${r.tone === "emerald" ? "bg-[color:var(--t10-emerald)]" : r.tone === "amber" ? "bg-amber-400" : "bg-red-400"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, r.stock)}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                />
              </div>
              <p className="mt-1 text-[10px] text-[color:var(--t10-grey)]">{r.stock} units</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                r.tone === "emerald"
                  ? "bg-[color:var(--t10-mint)] text-[color:var(--t10-emerald)]"
                  : r.tone === "amber"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-600"
              }`}
            >
              {r.status}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-[color:var(--t10-emerald)] bg-[color:var(--t10-mint)]/40 p-3 text-xs text-[color:var(--t10-navy)]">
        <span className="font-semibold text-[color:var(--t10-emerald)]">Zyne suggests:</span>{" "}
        Reorder Linen Kaftan (M) within 5 days to avoid stock-out during Ramadan demand spike.
      </div>
    </div>
  );
}

function ScenePricing() {
  const rows = [
    { name: "Argan Hair Oil 100ml", cost: 24, price: 79, margin: 62 },
    { name: "Bamboo Toothbrush 4-pack", cost: 11, price: 39, margin: 58 },
    { name: "Ceramic Diffuser", cost: 46, price: 129, margin: 51 },
  ];
  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Avg. Margin", value: "57%", sub: "+4% vs last month" },
          { label: "Blended ROAS", value: "3.8x", sub: "Amazon + noon" },
          { label: "Price Health", value: "Strong", sub: "12 SKUs optimised" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + i * 0.08 }}
            className="rounded-xl border border-[color:var(--t10-border)] bg-white p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--t10-grey)]">
              {k.label}
            </p>
            <p className="mt-1 text-xl font-bold text-[color:var(--t10-navy)]">{k.value}</p>
            <p className="text-[10px] text-[color:var(--t10-emerald)]">{k.sub}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-[color:var(--t10-border)]">
        <div className="grid grid-cols-[1.4fr_.6fr_.6fr_1fr] bg-[color:var(--t10-offwhite)] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--t10-grey)]">
          <span>Product</span>
          <span>Cost</span>
          <span>Price</span>
          <span>Margin</span>
        </div>
        {rows.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 + i * 0.08 }}
            className="grid grid-cols-[1.4fr_.6fr_.6fr_1fr] items-center border-t border-[color:var(--t10-border)] bg-white px-3 py-2.5 text-xs text-[color:var(--t10-navy)]"
          >
            <span className="font-semibold">{r.name}</span>
            <span>AED {r.cost}</span>
            <span>AED {r.price}</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[color:var(--t10-offwhite)]">
                <motion.span
                  className="block h-full bg-[color:var(--t10-emerald)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${r.margin}%` }}
                  transition={{ duration: 0.6, delay: 0.35 + i * 0.08 }}
                />
              </span>
              <span className="text-[color:var(--t10-emerald)] font-semibold">{r.margin}%</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MiniCard({
  title,
  icon,
  primary,
  primarySub,
  footer,
  bullets,
  ring,
  circle,
}: {
  title: string;
  icon: React.ReactNode;
  primary?: string;
  primarySub?: string;
  footer: string;
  bullets?: string[];
  ring?: boolean;
  circle?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--t10-border)] bg-white p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--t10-grey)]">
          {title}
        </p>
        {icon}
      </div>
      <div className="mt-3 grid h-[72px] place-items-center">
        {bullets ? (
          <ul className="w-full space-y-1">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-center gap-1.5 text-[10px] text-[color:var(--t10-navy)]"
              >
                <Check className="h-2.5 w-2.5 text-[color:var(--t10-emerald)]" /> {b}
              </li>
            ))}
          </ul>
        ) : ring ? (
          <div className="relative grid h-14 w-14 place-items-center">
            <svg viewBox="0 0 40 40" className="h-14 w-14 -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#eafbf5" strokeWidth="5" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#00b979"
                strokeWidth="5"
                strokeDasharray="100"
                strokeDashoffset="18"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-[color:var(--t10-navy)]">
              {primary}
            </span>
          </div>
        ) : circle ? (
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--t10-mint)]">
            <Users className="h-5 w-5 text-[color:var(--t10-emerald)]" />
          </div>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-bold text-[color:var(--t10-navy)]">{primary}</p>
            <p className="text-[10px] font-medium text-[color:var(--t10-grey)]">{primarySub}</p>
          </div>
        )}
      </div>
      <p className="mt-2 text-[10px] leading-snug text-[color:var(--t10-grey)]">{footer}</p>
    </div>
  );
}

/* ---------------- TRUST STRIP ---------------- */

function TrustStrip() {
  const credentials = [
    { src: "/uae/17.png", label: "UAE Credential 1" },
    { src: "/uae/18.png", label: "UAE Credential 2" },
    { src: "/uae/19.png", label: "UAE Credential 3" },
    { src: "/uae/20.png", label: "UAE Credential 4" },
    { src: "/uae/21.png", label: "UAE Credential 5" },
    { src: "/uae/22.png", label: "UAE Credential 6" },
  ];
  const marketplaces = [
    { src: "/partners-logos/1.png", label: "Amazon.ae" },
    { src: "/partners-logos/11.png", label: "noon" },
    { src: "/partners-logos/9.png", label: "Shopify" },
    { src: "/partners-logos/4.png", label: "Carrefour" },
    { src: "/partners-logos/10.png", label: "InstaShop" },
    { src: "/partners-logos/15.png", label: "Trendyol" },
  ];
  const partners = [
    { src: "/partners-logos/2.png", label: "Aramex" },
    { src: "/partners-logos/5.png", label: "DHL" },
    { src: "/partners-logos/13.png", label: "Talabat" },
    { src: "/partners-logos/8.png", label: "Stripe" },
    { src: "/partners-logos/6.png", label: "Tamara" },
    { src: "/partners-logos/12.png", label: "Tabby" },
  ];
  return (
    <section className="border-y border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)]">
      <div className="t10-container py-[50px]">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-navy)]">
            UAE-Registered · Locally Experienced · Marketplace-Ready
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[color:var(--t10-grey)]">
            Built on hands-on experience across UAE retail, e-commerce, and leading marketplace
            ecosystems.
          </p>
        </div>

        <div className="mt-10 grid items-start gap-12 md:grid-cols-[1fr_1px_1fr_1px_1fr] md:gap-8">
          <TrustColumn title="UAE Business Credentials">
            <LogoRow items={credentials} cols={3} compact />
          </TrustColumn>

          <div
            className="hidden md:block h-40 w-px justify-self-center bg-[color:var(--t10-border)]"
            aria-hidden
          />

          <TrustColumn title="Marketplace Experience">
            <LogoRow items={marketplaces} cols={3} />
          </TrustColumn>

          <div
            className="hidden md:block h-40 w-px justify-self-center bg-[color:var(--t10-border)]"
            aria-hidden
          />

          <TrustColumn title="Local Partners">
            <LogoRow items={partners} cols={3} />
          </TrustColumn>
        </div>

        <p className="mt-8 text-center text-[11px] text-[color:var(--t10-grey)]">
          All trademarks belong to their respective owners. Display does not imply endorsement
          unless explicitly stated.
        </p>
      </div>
    </section>
  );
}

function TrustColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--t10-emerald)]">
        {title}
      </p>
      <div className="mt-6 flex min-h-[64px] items-center justify-center">{children}</div>
    </div>
  );
}

function LogoRow({ items, cols = 4, compact = false }: { items: { src: string; label: string }[]; cols?: number; compact?: boolean }) {
  const colClass = cols === 3 ? "grid-cols-3" : cols === 2 ? "grid-cols-2" : "grid-cols-4";
  return (
    <div className={`mx-auto grid w-full ${colClass} gap-4 sm:gap-5`}>
      {items.map((i) => (
        <div
          key={i.label}
          title={i.label}
          className={`flex h-[88px] w-full items-center justify-center rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
            compact ? "p-1.5" : "p-4"
          }`}
        >
          <img
            src={i.src}
            alt={`${i.label} logo`}
            loading="lazy"
            className={compact ? "h-full w-full object-contain mix-blend-multiply" : "h-full w-full object-contain"}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------------- BUILT FOR UAE ---------------- */

function BuiltForUAE() {
  const cards = [
    {
      n: "1",
      title: "UAE Market Context",
      icon: Store,
      body: "Guidance shaped by local customer behaviour, regulations, retail operations, and marketplace dynamics.",
    },
    {
      n: "2",
      title: "AI + Human Expertise",
      icon: Users,
      body: "Use Zyne for fast everyday decisions and speak with vetted industry experts when deeper judgement is required.",
    },
    {
      n: "3",
      title: "Practical Growth Plans",
      icon: TrendingUp,
      body: "Receive clear next steps across inventory, marketplaces, margins, marketing, operations, and business growth.",
    },
  ];
  return (
    <section id="how-it-works" className="relative bg-white">
      <div
        className="pointer-events-none absolute right-0 top-10 h-[400px] w-[400px] rounded-full opacity-70"
        style={{
          background: "radial-gradient(closest-side, rgba(0,201,139,0.12), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="t10-container relative py-[50px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--t10-border)] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--t10-grey)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--t10-emerald)]" />
              Built for the UAE market
            </span>
            <h2 className="mt-5 text-[36px] font-bold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-[46px]">
              Built for the realities of <span className="whitespace-nowrap">UAE retail</span> and{" "}
              <span className="whitespace-nowrap">
                e-commerce<span className="text-[color:var(--t10-emerald)]">.</span>
              </span>
            </h2>
          </div>
          <div className="text-[15px] leading-relaxed text-[color:var(--t10-grey)]">
            <p>
              Generic business advice often overlooks the realities founders face in the UAE — from
              marketplace rules and inventory risk to pricing, margins, customer behaviour, and
              operational complexity.
            </p>
            <p className="mt-4">
              Think10 combines 24/7 guidance from Zyne with vetted industry experts to turn
              uncertainty into clear, practical action.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.n}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-30px_rgba(8,20,38,0.25)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[color:var(--t10-mint)]">
                <c.icon className="h-5 w-5 text-[color:var(--t10-emerald)]" />
              </span>
              <h3 className="mt-6 text-lg font-bold text-[color:var(--t10-navy)]">
                {c.n}. {c.title}
              </h3>
              <div className="mt-2 h-0.5 w-10 bg-[color:var(--t10-emerald)]" />
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--t10-grey)]">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Ask Zyne",
      body: "Start any business question in seconds. Zyne diagnoses the problem in UAE context — margins, marketplaces, inventory, growth.",
    },
    {
      n: "02",
      title: "Get a Plan",
      body: "Zyne returns a clear structured answer with next steps, benchmarks, and where a human should get involved.",
    },
    {
      n: "03",
      title: "Book an Expert",
      body: "When judgement matters, book a 60-minute call with a vetted UAE retail, e-commerce or finance expert — prepared by Zyne.",
    },
    {
      n: "04",
      title: "Execute",
      body: "Leave with a written action plan, follow-ups, and Zyne on hand to keep momentum through the week.",
    },
  ];
  return (
    <section className="bg-[color:var(--t10-offwhite)]">
      <div className="t10-container py-[50px]">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-emerald)]">
            How It Works
          </span>
          <h2 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-[46px]">
            From question to clear action, in four steps.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-[color:var(--t10-border)] bg-white p-6"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--t10-emerald)]">
                Step {s.n}
              </p>
              <h3 className="mt-3 text-lg font-bold text-[color:var(--t10-navy)]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--t10-grey)]">{s.body}</p>
              {i < steps.length - 1 ? (
                <ArrowRight className="absolute -right-3.5 top-[26px] hidden h-5 w-5 text-[color:var(--t10-emerald)] lg:block z-10" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ADVISORY AREAS ---------------- */

function AdvisoryAreas() {
  return (
    <section id="advisory-areas" className="bg-white">
      <div className="t10-container py-[50px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-emerald)]">
              Advisory Areas
            </span>
            <h2 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-[46px]">
              Eight specialisms, one integrated advisory system.
            </h2>
          </div>
          <p className="max-w-md text-sm text-[color:var(--t10-grey)]">
            Every area is covered by Zyne for immediate diagnosis and by human experts when
            judgement matters most.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADVISORY_AREAS.map((a) => {
            const Icon = ICONS[a.icon] ?? SparkleIcon;
            return (
              <div
                key={a.slug}
                className="group flex flex-col rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 transition-all hover:-translate-y-1 hover:border-[color:var(--t10-emerald)] hover:shadow-[0_20px_60px_-30px_rgba(0,185,121,0.35)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color:var(--t10-mint)]">
                  <Icon className="h-5 w-5 text-[color:var(--t10-emerald)]" />
                </span>
                <h3 className="mt-5 text-base font-bold text-[color:var(--t10-navy)]">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--t10-grey)]">
                  {a.short}
                </p>
                <p className="mt-4 text-xs font-medium text-[color:var(--t10-emerald)]">
                  {a.outcome}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHO IT'S FOR ---------------- */

function WhoItsFor() {
  const groups = [
    {
      title: "Launching Founders",
      body: "You have a product idea or a soft launch and need a clear route to market — licensing, channel choice, pricing, and inventory.",
      tags: ["Feasibility", "Licensing", "Positioning"],
    },
    {
      title: "Operators",
      body: "You're live, doing revenue and drowning in decisions. Marketing spend, marketplace fees, staff, systems — you need a second brain.",
      tags: ["Marketplaces", "Ops", "Cash flow"],
    },
    {
      title: "Scaling Brands",
      body: "You've proven the model and are scaling into KSA, wholesale, or new categories. You need discipline, not more opinions.",
      tags: ["Expansion", "Finance", "Team"],
    },
  ];
  return (
    <section id="who-its-for" className="bg-[color:var(--t10-offwhite)]">
      <div className="t10-container py-[50px]">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-emerald)]">
            Who It's For
          </span>
          <h2 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-[46px]">
            Built for UAE founders at every stage.
          </h2>
          <p className="mt-4 text-[15px] text-[color:var(--t10-grey)]">
            Retail, e-commerce, marketplace, and product businesses — from first launch to regional
            expansion.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {groups.map((g) => (
            <div
              key={g.title}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-7"
            >
              <h3 className="text-lg font-bold text-[color:var(--t10-navy)]">{g.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--t10-grey)]">{g.body}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {g.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[color:var(--t10-mint)] px-3 py-1 text-[11px] font-semibold text-[color:var(--t10-emerald)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- ZYNE ---------------- */

function ZyneSection() {
  return (
    <section id="zyne" className="bg-white">
      <div className="t10-container py-[50px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-emerald)]">
              Meet Zyne
            </span>
            <h2 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-[46px]">
              Your always-on AI business advisor for the UAE.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--t10-grey)]">
              Zyne is trained on UAE retail, e-commerce and marketplace realities. Ask anything —
              product pricing, Amazon UAE listings, Ramadan planning, cash flow — and get a
              structured answer in seconds, not a generic chatbot reply.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Diagnoses your problem in UAE market context",
                "Returns structured plans, not one-line replies",
                "Prepares briefs before every expert call",
                "Escalates to a human expert when judgement matters",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[color:var(--t10-navy)]">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-[color:var(--t10-mint)]">
                    <Check className="h-3 w-3 text-[color:var(--t10-emerald)]" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--t10-emerald)] px-6 py-3 text-sm font-semibold text-white hover:bg-[color:var(--t10-green)]"
              >
                Try Zyne now <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <ZyneLiveDemo />
        </div>
      </div>
    </section>
  );
}

function ZyneLiveDemo() {
  const [msgs, setMsgs] = useState<{ role: "you" | "zyne"; text: string }[]>([
    { role: "you", text: "My meta ads CAC is 3x my AOV. Kill spend or fix the funnel?" },
    {
      role: "zyne",
      text: "Don't kill spend — your AOV is the real problem. Bundle 2–3 SKUs into a launch set (typically lifts AOV 40–60% in beauty). Move discount from % off to gift-with-purchase. Only then restructure ads by intent.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = (t: string) => {
    const v = t.trim();
    if (!v) return;
    setMsgs((m) => [...m, { role: "you", text: v }]);
    setInput("");
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          role: "zyne",
          text: "Great question — I'd structure the diagnosis around margin, channel and demand, then recommend the tightest next step. Book an expert to pressure-test the numbers.",
        },
      ]);
    }, 700);
  };

  return (
    <div className="relative">
      <div
        className="absolute -inset-6 rounded-[32px]"
        style={{
          background: "radial-gradient(closest-side, rgba(0,201,139,0.15), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--t10-border)] bg-white shadow-[0_30px_80px_-30px_rgba(8,20,38,0.25)]">
        <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--t10-emerald)] text-white">
              <span className="h-2 w-2 rounded-full border-2 border-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-[color:var(--t10-navy)]">Zyne AI</p>
              <p className="text-[10px] text-[color:var(--t10-grey)]">UAE business advisor</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[color:var(--t10-grey)]">
            <span className="h-2 w-2 rounded-full bg-[color:var(--t10-emerald)]" /> Online
          </span>
        </div>
        <div className="max-h-[360px] space-y-3 overflow-y-auto px-5 py-5">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "you" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "you"
                    ? "bg-[color:var(--t10-navy)] text-white"
                    : "border border-[color:var(--t10-border)] bg-white text-[color:var(--t10-navy)]"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-[color:var(--t10-border)] bg-white px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zyne a business question…"
            className="flex-1 rounded-full border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] px-4 py-2.5 text-sm outline-none focus:border-[color:var(--t10-emerald)]"
          />
          <button
            type="submit"
            aria-label="Send"
            className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--t10-emerald)] text-white hover:bg-[color:var(--t10-green)]"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------------- EXPERTS ---------------- */

function ExpertsSection() {
  return (
    <section id="experts" className="bg-[color:var(--t10-offwhite)]">
      <div className="t10-container py-[50px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-emerald)]">
              Our Experts
            </span>
            <h2 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-[46px]">
              Vetted UAE operators, not generalist consultants.
            </h2>
          </div>
          <p className="max-w-md text-sm text-[color:var(--t10-grey)]">
            Every expert has 10+ years of hands-on UAE experience in retail, marketplaces, brand, or
            finance.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERTS.map((e) => (
            <div
              key={e.slug}
              className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--t10-navy)] text-sm font-bold text-white">
                  {e.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-[color:var(--t10-navy)]">{e.name}</p>
                  <p className="text-[11px] text-[color:var(--t10-grey)]">{e.location}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--t10-emerald)]">
                {e.role}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--t10-grey)]">{e.bio}</p>
              <div className="mt-4 flex items-center justify-between border-t border-[color:var(--t10-border)] pt-4">
                <span className="text-[11px] font-semibold text-[color:var(--t10-navy)]">
                  {e.experienceYears}+ yrs UAE
                </span>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--t10-emerald)] hover:underline"
                >
                  Book <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PLANS ---------------- */

function PlansSection() {
  return (
    <section id="plans" className="bg-white">
      <div className="t10-container py-[50px]">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-emerald)]">
            Plans &amp; Pricing
          </span>
          <h2 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-[46px]">
            Start with a question. Scale with a system.
          </h2>
          <p className="mt-4 text-[15px] text-[color:var(--t10-grey)]">
            Use Zyne free during preview. Add expert sessions or Membership when you're ready.
          </p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col rounded-2xl border p-7 ${
                p.highlight
                  ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-navy)] text-white shadow-xl"
                  : "border-[color:var(--t10-border)] bg-white"
              }`}
            >
              {p.highlight ? (
                <span className="mb-3 inline-flex w-fit rounded-full bg-[color:var(--t10-emerald)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Most popular
                </span>
              ) : null}
              <h3
                className={`text-lg font-bold ${p.highlight ? "text-white" : "text-[color:var(--t10-navy)]"}`}
              >
                {p.name}
              </h3>
              <p
                className={`mt-1 text-xs ${p.highlight ? "text-white/70" : "text-[color:var(--t10-grey)]"}`}
              >
                {p.tagline}
              </p>
              <p
                className={`mt-4 text-2xl font-bold ${p.highlight ? "text-[color:var(--t10-green)]" : "text-[color:var(--t10-navy)]"}`}
              >
                {p.price}
              </p>
              <ul
                className={`mt-5 flex-1 space-y-2.5 text-sm ${p.highlight ? "text-white/85" : "text-[color:var(--t10-grey)]"}`}
              >
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-[color:var(--t10-green)]" : "text-[color:var(--t10-emerald)]"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-6 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold ${
                  p.highlight
                    ? "bg-[color:var(--t10-emerald)] text-white hover:bg-[color:var(--t10-green)]"
                    : "border border-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)] hover:bg-[color:var(--t10-mint)]"
                }`}
              >
                {p.cta} <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-[color:var(--t10-offwhite)]">
      <div className="t10-container py-[50px]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-emerald)]">
              FAQ
            </span>
            <h2 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-[46px]">
              Answers, before you ask.
            </h2>
          </div>
          <div className="mt-10 divide-y divide-[color:var(--t10-border)] rounded-2xl border border-[color:var(--t10-border)] bg-white">
            {FAQS.map((f, i) => (
              <button
                key={f.q}
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[color:var(--t10-navy)]">{f.q}</p>
                  {open === i ? (
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--t10-grey)]">
                      {f.a}
                    </p>
                  ) : null}
                </div>
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color:var(--t10-border)] text-[color:var(--t10-emerald)]">
                  {open === i ? (
                    <Minus className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CONTACT CTA ---------------- */

function ContactCTA() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[color:var(--t10-navy)] text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: "radial-gradient(60% 60% at 50% 40%, rgba(0,201,139,0.25), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="t10-container relative py-[50px]">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--t10-green)]">
            Ready when you are
          </span>
          <h2 className="mt-4 text-[36px] font-bold leading-[1.1] tracking-tight sm:text-[52px]">
            Bring us the business problem you cannot solve alone.
          </h2>
          <p className="mt-5 text-[16px] text-white/75">
            Start with a conversation. Zyne responds in seconds — a human expert is one click away.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#zyne"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--t10-emerald)] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[color:var(--t10-green)]"
            >
              Ask Zyne Now <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:hello@think10.ae"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-[color:var(--t10-navy)]"
            >
              Book a Discovery Call <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-6 text-xs text-white/50">
            Confidential. Practical. Built around your business.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FLOATING ZYNE BUBBLE ---------------- */

function FloatingZyne() {
  return (
    <a
      href="#zyne"
      className="fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-[color:var(--t10-emerald)] text-white shadow-[0_15px_40px_-10px_rgba(0,185,121,0.55)] transition-transform hover:scale-105"
      aria-label="Ask Zyne"
    >
      <SparkleIcon className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-[color:var(--t10-emerald)]">
        1
      </span>
    </a>
  );
}
/* ---------------- PLATFORM EXPLAINER (animated) ---------------- */

type ExplainerStep = {
  tag: string;
  title: string;
  body: string;
  chat: {
    user?: string;
    thinking?: readonly string[];
    handoff?: string;
    plan?: readonly string[];
  };
};

const EXPLAINER_STEPS: readonly ExplainerStep[] = [
  {
    tag: "01 / Ask",
    title: "You bring a real business question.",
    body: "Type it in plain language — launch decisions, pricing, cash flow, marketplace strategy, growth blockers. No forms, no jargon.",
    chat: {
      user: "Should I launch on noon or Amazon.ae first? Beauty brand, 8 SKUs.",
    },
  },
  {
    tag: "02 / Zyne analyses",
    title: "Zyne AI diagnoses in seconds, in UAE context.",
    body: "Zyne pulls category benchmarks, marketplace economics and your inputs to structure a decision — not a generic answer.",
    chat: {
      thinking: ["Reading category signals", "Modelling fees & CAC", "Comparing noon vs Amazon.ae"],
    },
  },
  {
    tag: "03 / Human expert",
    title: "A vetted UAE expert steps in when it matters.",
    body: "For high-stakes calls, Zyne matches you to a specialist advisor — retail, e-commerce, marketplace, finance or ops.",
    chat: {
      handoff: "Layla Hassan — Marketplace Strategist",
    },
  },
  {
    tag: "04 / Action plan",
    title: "You leave with a plan you can execute Monday.",
    body: "Structured next steps, owners, timelines and risks — saved in your dashboard, revisited whenever you need.",
    chat: {
      plan: ["Prioritise 3 hero SKUs", "Launch DTC pilot — 60 days", "List on noon Express in Q2"],
    },
  },
] as const;

function PlatformExplainer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const [active, setActive] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (window.innerWidth >= 1024) {
        const idx = Math.min(EXPLAINER_STEPS.length - 1, Math.floor(v * EXPLAINER_STEPS.length));
        setActive(idx);
      }
    });
  }, [scrollYProgress]);

  return (
    <section id="platform" ref={wrapRef} className="relative bg-white lg:h-[300vh]">
      <div className="relative lg:sticky lg:top-0 flex min-h-screen lg:h-screen items-center py-10 lg:py-0 lg:pt-[72px] overflow-visible lg:overflow-hidden">
        <div className="t10-container grid w-full gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* Left: copy + step rail */}
          <div>
            <p className="t10-mono text-xs uppercase tracking-[0.3em] text-[color:var(--t10-emerald)]">
              / How Think10 works
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-[color:var(--t10-navy)] sm:text-4xl lg:text-5xl">
              A business advisor that thinks with you —{" "}
              <span className="text-[color:var(--t10-emerald)]">not at you.</span>
            </h2>
            <p className="mt-3 max-w-lg text-base text-[color:var(--t10-grey)]">
              Watch how a founder question moves through Think10 — from typed input, to AI
              diagnosis, to a human expert, to an executable plan.
            </p>

            <ol className="mt-8 space-y-3">
              {EXPLAINER_STEPS.map((s, i) => {
                const isActive = i === active;
                const isDone = i < active;
                return (
                  <li key={s.tag} className="relative pl-8">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--t10-emerald)] rounded-lg py-0.5 cursor-pointer"
                    >
                      <span
                        className={`absolute left-0 top-1.5 grid h-5 w-5 place-items-center rounded-full border-2 transition-colors ${
                          isActive || isDone
                            ? "border-[color:var(--t10-emerald)] bg-[color:var(--t10-emerald)]"
                            : "border-[color:var(--t10-border)] bg-white"
                        }`}
                      >
                        {isDone ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
                      </span>
                      <p
                        className={`t10-mono text-[11px] uppercase tracking-[0.25em] transition-colors ${
                          isActive
                            ? "text-[color:var(--t10-emerald)]"
                            : "text-[color:var(--t10-grey)]"
                        }`}
                      >
                        {s.tag}
                      </p>
                      <p
                        className={`mt-0.5 text-base font-semibold transition-colors ${
                          isActive ? "text-[color:var(--t10-navy)]" : "text-[color:var(--t10-grey)]"
                        }`}
                      >
                        {s.title}
                      </p>
                      <AnimatePresence>
                        {isActive ? (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-1.5 max-w-md overflow-hidden text-sm text-[color:var(--t10-grey)]"
                          >
                            {s.body}
                          </motion.p>
                        ) : null}
                      </AnimatePresence>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right: animated stage */}
          <div className="relative">
            <div
              className="absolute -inset-6 -z-10 rounded-[32px] opacity-70"
              style={{
                background:
                  "radial-gradient(60% 60% at 30% 30%, rgba(0,185,121,0.15), transparent 70%), radial-gradient(50% 50% at 80% 80%, rgba(8,20,38,0.08), transparent 70%)",
              }}
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[24px] border border-[color:var(--t10-border)] bg-white shadow-[0_30px_80px_-30px_rgba(8,20,38,0.25)]">
              {/* window header */}
              <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[color:var(--t10-navy)]">
                    <SparkleIcon className="h-3.5 w-3.5 text-[color:var(--t10-emerald)]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--t10-navy)]">Zyne</p>
                    <p className="text-[10px] uppercase tracking-widest text-[color:var(--t10-grey)]">
                      UAE business mode
                    </p>
                  </div>
                </div>
                <span className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-emerald)]">
                  live
                </span>
              </div>

              {/* stage */}
              <div className="relative min-h-[360px] p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <ExplainerStage step={active} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExplainerStage({ step }: { step: number }) {
  const s = EXPLAINER_STEPS[step];

  if (step === 0) {
    return (
      <>
        <p className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-grey)]">
          You
        </p>
        <div className="rounded-2xl bg-[color:var(--t10-navy)] px-4 py-3 text-white">
          <TypewriterLine text={s.chat.user ?? ""} />
        </div>
        <p className="t10-mono mt-6 text-[10px] uppercase tracking-widest text-[color:var(--t10-emerald)]">
          Zyne
        </p>
        <div className="rounded-2xl border border-dashed border-[color:var(--t10-border)] px-4 py-3 text-sm text-[color:var(--t10-grey)]">
          Waiting for your question…
        </div>
      </>
    );
  }

  if (step === 1) {
    const items = s.chat.thinking ?? [];
    return (
      <>
        <p className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-emerald)]">
          Zyne is analysing
        </p>
        <div className="space-y-2 rounded-2xl border border-[color:var(--t10-border)] bg-[color:var(--t10-offwhite)] p-4">
          {items.map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.35 }}
              className="flex items-center gap-3"
            >
              <motion.span
                className="h-2 w-2 rounded-full bg-[color:var(--t10-emerald)]"
                animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
              <span className="t10-mono text-sm text-[color:var(--t10-navy)]">{t}…</span>
            </motion.div>
          ))}
          <div className="mt-3 grid grid-cols-3 gap-2 pt-3">
            {[42, 68, 91].map((w, i) => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4 + i * 0.2, duration: 0.6 }}
                className="origin-left rounded-md bg-[color:var(--t10-mint)] p-2"
              >
                <div className="t10-mono text-[9px] uppercase tracking-widest text-[color:var(--t10-grey)]">
                  {["Fees", "CAC", "Demand"][i]}
                </div>
                <div className="mt-1 text-base font-bold text-[color:var(--t10-navy)]">{w}%</div>
              </motion.div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (step === 2) {
    return (
      <>
        <p className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-emerald)]">
          Handoff suggested
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 rounded-2xl border border-[color:var(--t10-border)] bg-white p-4 shadow-sm"
        >
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[color:var(--t10-emerald)] to-[color:var(--t10-navy)] text-lg font-bold text-white">
            LH
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[color:var(--t10-navy)]">{s.chat.handoff}</p>
            <p className="text-xs text-[color:var(--t10-grey)]">
              12 years · ex-noon · UAE beauty & FMCG
            </p>
            <div className="mt-2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3 w-3 fill-[color:var(--t10-emerald)] text-[color:var(--t10-emerald)]"
                />
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-full bg-[color:var(--t10-emerald)] px-3 py-1.5 text-xs font-semibold text-white"
          >
            Connect
          </motion.div>
        </motion.div>
        <div className="rounded-2xl border border-dashed border-[color:var(--t10-border)] p-3 text-xs text-[color:var(--t10-grey)]">
          Matched from 40+ vetted UAE advisors — retail, e-commerce, marketplace, finance & ops.
        </div>
      </>
    );
  }

  // step 3
  const plan = s.chat.plan ?? [];
  return (
    <>
      <p className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-emerald)]">
        Your action plan
      </p>
      <div className="space-y-2">
        {plan.map((p, i) => (
          <motion.div
            key={p}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="flex items-start gap-3 rounded-xl border border-[color:var(--t10-border)] bg-white p-3"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[color:var(--t10-emerald)] text-[11px] font-bold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[color:var(--t10-navy)]">{p}</p>
              <p className="t10-mono text-[10px] uppercase tracking-widest text-[color:var(--t10-grey)]">
                {["This week", "Next 60 days", "Q2 2026"][i]}
              </p>
            </div>
            <Check className="h-4 w-4 text-[color:var(--t10-emerald)]" />
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="flex items-center justify-between rounded-xl bg-[color:var(--t10-navy)] px-4 py-3 text-white"
      >
        <span className="text-xs">Saved to your dashboard</span>
        <ArrowRight className="h-4 w-4" />
      </motion.div>
    </>
  );
}

function TypewriterLine({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 25);
    return () => clearInterval(id);
  }, [text]);
  return (
    <p className="text-sm">
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-[color:var(--t10-emerald)] align-middle" />
    </p>
  );
}

/* ---------------- WHY THINK10 (animated purpose section) ---------------- */

/* ---------- Timed 60-second explainer video with voiceover ---------- */

type ExplainerScene = {
  start: number; // seconds
  end: number;
  eyebrow: string;
  caption: string;
  visual:
    | "lonely"
    | "logo"
    | "platform"
    | "zyne-ask"
    | "zyne-think"
    | "expert"
    | "command"
    | "plans"
    | "closing"
    | "tagline";
};

const EXPLAINER_SCENES: ExplainerScene[] = [
  {
    start: 0,
    end: 6.2,
    eyebrow: "The reality",
    caption:
      "Running a business can feel lonely — every decision affects your time, money, and growth.",
    visual: "lonely",
  },
  {
    start: 6.2,
    end: 9.4,
    eyebrow: "Our answer",
    caption: "That's why we created Think10.",
    visual: "logo",
  },
  {
    start: 9.4,
    end: 16.5,
    eyebrow: "What it is",
    caption:
      "An AI and human business advisory platform built for UAE retail and e-commerce founders.",
    visual: "platform",
  },
  {
    start: 16.5,
    end: 28.0,
    eyebrow: "Step 1 — Ask",
    caption:
      "Ask Zyne, your always-available AI advisor, anything: launching, inventory, pricing, marketplaces, marketing, operations, growth.",
    visual: "zyne-ask",
  },
  {
    start: 28.0,
    end: 34.5,
    eyebrow: "Step 2 — Think",
    caption:
      "Zyne helps you understand the problem, explore options, and identify the next best step.",
    visual: "zyne-think",
  },
  {
    start: 34.5,
    end: 44.5,
    eyebrow: "Step 3 — Escalate",
    caption:
      "When the decision needs deeper experience, Think10 connects you with a vetted human expert who knows the UAE market.",
    visual: "expert",
  },
  {
    start: 44.5,
    end: 53.0,
    eyebrow: "Step 4 — Command Centre",
    caption:
      "Insights, action plans, documents, goals and follow-ups stay organised in your Think10 Command Centre.",
    visual: "command",
  },
  {
    start: 53.0,
    end: 58.5,
    eyebrow: "How to start",
    caption:
      "Start with one question, book a single expert session, or choose ongoing advisory support.",
    visual: "plans",
  },
  {
    start: 58.5,
    end: 62.0,
    eyebrow: "Our promise",
    caption: "With Think10, you're never building alone.",
    visual: "closing",
  },
  {
    start: 62.0,
    end: 999,
    eyebrow: "Think10",
    caption: "Think clearly. Act confidently. Grow with Think10.",
    visual: "tagline",
  },
];

function WhyThink10() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const play = async () => {
    const v = videoRef.current;
    if (!v) return;
    setHasStarted(true);
    v.muted = false;
    try {
      await v.play();
    } catch {
      // fallback: play muted if browser blocks audio autoplay
      v.muted = true;
      try {
        await v.play();
      } catch {
        /* noop */
      }
    }
  };

  return (
    <section
      id="why"
      className="relative overflow-hidden bg-[color:var(--t10-navy)] py-[50px] text-white"
    >
      {/* ambient grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* soft emerald glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--t10-emerald)] opacity-25 blur-[160px]"
      />

      <div className="t10-container relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="t10-mono text-xs uppercase tracking-[0.3em] text-[color:var(--t10-emerald)]">
            / Why we built Think10
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            A 60-second story about the platform,{" "}
            <span className="text-[color:var(--t10-emerald)]">and who it's for.</span>
          </h2>
          <p className="mt-5 text-lg text-white/70">
            Press play. Hear why Think10 exists, how Zyne AI works with vetted UAE experts, and what
            your Command Centre keeps organised for you.
          </p>
        </div>

        {/* Video canvas */}
        <div className="relative mx-auto mt-14 max-w-5xl">
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1a30] via-[#081426] to-[#050e1c] shadow-[0_40px_120px_-30px_rgba(0,185,121,0.35)]">
            <video
              ref={videoRef}
              src="/think10-explainer.mp4"
              className="absolute inset-0 h-full w-full object-cover"
              controls={hasStarted}
              playsInline
              preload="metadata"
            />

            {/* Play overlay (before first play) */}
            {!hasStarted && (
              <button
                type="button"
                onClick={play}
                className="group absolute inset-0 z-10 flex flex-col items-center justify-center bg-[color:var(--t10-navy)]/70 backdrop-blur-[2px]"
                aria-label="Play Think10 explainer video"
              >
                <span className="flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--t10-emerald)] text-[color:var(--t10-navy)] shadow-[0_20px_60px_-10px_rgba(0,185,121,0.6)] transition-transform group-hover:scale-105">
                  <Play className="h-10 w-10 translate-x-0.5" fill="currentColor" />
                </span>
                <span className="mt-6 t10-mono text-xs uppercase tracking-[0.3em] text-white/80">
                  Play · 60 seconds · with voice
                </span>
                <span className="mt-2 text-sm text-white/60">Narrated by Zyne</span>
              </button>
            )}
          </div>
        </div>

        {/* Trust chips under the video */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {[
            "Built for UAE founders",
            "Especially women building product brands",
            "AI + vetted human experts",
            "Confidential by design",
          ].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-xs text-white/80"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function ExplainerVisual({ visual }: { visual: ExplainerScene["visual"] }) {
  if (visual === "lonely") {
    return (
      <div className="relative w-full max-w-2xl">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
          <User className="h-16 w-16 text-white/60" />
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {["Time", "Money", "Growth"].map((w, i) => (
            <motion.div
              key={w}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.4 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <p className="t10-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
                Every decision affects
              </p>
              <p className="mt-1 text-lg font-semibold text-white">{w}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  if (visual === "logo") {
    return (
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[color:var(--t10-emerald)] text-3xl font-bold text-[color:var(--t10-navy)]">
          T10
        </div>
        <p className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">Think10.</p>
      </motion.div>
    );
  }
  if (visual === "platform") {
    return (
      <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <SparkleIcon className="h-6 w-6 text-[color:var(--t10-emerald)]" />
          <p className="mt-3 text-lg font-semibold">Zyne AI</p>
          <p className="mt-1 text-sm text-white/60">Always-on business advisor</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <Users className="h-6 w-6 text-[color:var(--t10-emerald)]" />
          <p className="mt-3 text-lg font-semibold">Vetted UAE experts</p>
          <p className="mt-1 text-sm text-white/60">Retail · E-commerce · Product</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-[color:var(--t10-emerald)]/40 bg-[color:var(--t10-emerald)]/10 p-5 text-center">
          <p className="t10-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--t10-emerald)]">
            Built for
          </p>
          <p className="mt-1 text-xl font-semibold">UAE retail & e-commerce founders</p>
        </div>
      </div>
    );
  }
  if (visual === "zyne-ask") {
    return (
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--t10-emerald)] text-[color:var(--t10-navy)]">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold">Zyne · AI Business Advisor</p>
        </div>
        <div className="mt-4 space-y-2">
          {[
            "How do I price for Amazon UAE vs my own store?",
            "Should I launch on noon or Namshi first?",
            "How much stock should I hold for Ramadan?",
          ].map((q, i) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.35, duration: 0.35 }}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/90"
            >
              {q}
            </motion.div>
          ))}
        </div>
        <p className="mt-4 t10-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
          Launching · Inventory · Pricing · Marketplaces · Marketing · Ops · Growth
        </p>
      </div>
    );
  }
  if (visual === "zyne-think") {
    return (
      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-3 gap-3">
          {[
            { t: "Understand", d: "the real problem" },
            { t: "Explore", d: "your options" },
            { t: "Identify", d: "the next best step" },
          ].map((c, i) => (
            <motion.div
              key={c.t}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--t10-emerald)]">
                0{i + 1}
              </p>
              <p className="mt-2 text-base font-semibold">{c.t}</p>
              <p className="mt-1 text-xs text-white/60">{c.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  if (visual === "expert") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--t10-emerald)] text-lg font-semibold text-[color:var(--t10-navy)]">
            LH
          </div>
          <div>
            <p className="text-base font-semibold">Layla Hassan</p>
            <p className="text-xs text-white/60">E-commerce & Marketplace · 14 yrs · Dubai</p>
          </div>
          <span className="ml-auto rounded-full bg-[color:var(--t10-emerald)]/15 px-2 py-0.5 t10-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--t10-emerald)]">
            Vetted
          </span>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/80">
          "Deeper decision? A human expert who knows your industry and the UAE market steps in."
        </div>
      </div>
    );
  }
  if (visual === "command") {
    return (
      <div className="w-full max-w-3xl">
        <div className="mb-3 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-[color:var(--t10-emerald)]" />
          <p className="t10-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
            Command Centre
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { i: SparkleIcon, l: "Insights" },
            { i: Check, l: "Action plans" },
            { i: Package, l: "Documents" },
            { i: TrendingUp, l: "Goals & follow-ups" },
          ].map((c, k) => {
            const Icon = c.i;
            return (
              <motion.div
                key={c.l}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: k * 0.12, duration: 0.35 }}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <Icon className="h-5 w-5 text-[color:var(--t10-emerald)]" />
                <p className="mt-3 text-sm font-semibold">{c.l}</p>
                <p className="mt-1 text-[11px] text-white/50">Auto-organised</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }
  if (visual === "plans") {
    return (
      <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { t: "One question", d: "Ask Zyne, free" },
          { t: "One expert session", d: "60-minute call" },
          { t: "Ongoing advisory", d: "Membership" },
        ].map((p, i) => (
          <motion.div
            key={p.t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.35 }}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
          >
            <p className="text-base font-semibold">{p.t}</p>
            <p className="mt-1 text-xs text-white/60">{p.d}</p>
            <ArrowRight className="mt-4 h-4 w-4 text-[color:var(--t10-emerald)]" />
          </motion.div>
        ))}
      </div>
    );
  }
  if (visual === "closing") {
    return (
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center text-4xl font-semibold tracking-tight sm:text-6xl"
      >
        You're never <span className="text-[color:var(--t10-emerald)]">building alone.</span>
      </motion.p>
    );
  }
  // tagline
  return (
    <div className="text-center">
      <p className="t10-mono text-xs uppercase tracking-[0.4em] text-[color:var(--t10-emerald)]">
        Think10
      </p>
      <p className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
        Think clearly. Act confidently.
        <br />
        <span className="text-[color:var(--t10-emerald)]">Grow with Think10.</span>
      </p>
    </div>
  );
}
