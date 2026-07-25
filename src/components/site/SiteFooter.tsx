import { Link } from "@tanstack/react-router";
import { MapPin, Mail, ShieldCheck, ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-slate-200 bg-white text-slate-800 overflow-hidden">
      {/* Light Grid Background Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]" aria-hidden="true">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDU5LjVoNjBNNTkuNSAwVjYwIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')]" />
      </div>

      <div className="relative z-10 t10-container mx-auto px-6 py-20">
        {/* Top Section */}
        <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr_1.2fr_1.2fr] border-b border-slate-100 pb-16">
          {/* Column 1: Info & Brand */}
          <div className="flex flex-col gap-6">
            <a href="/#top" className="flex items-center gap-2">
              <img src="/logo/t10-icon-logo.svg" alt="T10" className="h-10 w-10 shrink-0" />
              <img src="/logo/t10-brand-logo.svg" alt="Think10 Premium Advisory" className="h-10 w-auto shrink-0" />
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-slate-500 font-light">
              Think10 combines your personal AI Business Advisor with exit-vetted human consultants to solve inventory, marketing, and marketplace challenges in real-time.
            </p>
            <div className="flex flex-col gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[color:var(--t10-emerald)] shrink-0" />
                <span>Marina Plaza, Dubai Marina, UAE</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[color:var(--t10-emerald)] shrink-0" />
                <a href="mailto:advisory@think10.ae" className="hover:text-[color:var(--t10-emerald)] transition-colors">
                  advisory@think10.ae
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[color:var(--t10-emerald)] mb-6">
              Platform
            </h3>
            <ul className="space-y-4">
              {[
                { label: "Advisory Areas", href: "/#advisory-areas" },
                { label: "Meet Zyne AI", href: "/#zyne" },
                { label: "Who Is It For", href: "/#who-its-for" },
                { label: "Our Consultants", href: "/#experts" },
                { label: "Membership Plans", href: "/#plans" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Framework Core */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[color:var(--t10-emerald)] mb-6">
              Framework Core
            </h3>
            <ul className="space-y-4 mb-4">
              {[
                "01. Brand Development & Positioning",
                "02. Retail Storefront Operations",
                "03. Marketplace Strategy",
                "04. Amazon UAE Strategy & Ads",
                "05. Noon FBN Optimization",
              ].map((label) => (
                <li key={label} className="text-sm text-slate-600 font-medium">
                  {label}
                </li>
              ))}
            </ul>
            <a
              href="/#framework"
              className="inline-flex items-center gap-1 text-xs font-bold text-[color:var(--t10-emerald)] hover:text-[color:var(--t10-green)] transition-colors mt-2"
            >
              View remaining areas <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          {/* Column 4: Security Posture */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[color:var(--t10-emerald)] mb-6">
              Security Posture
            </h3>
            <ul className="space-y-4">
              {[
                "DED Dubai Registered",
                "ADGM Trade Compliance",
                "Mutual NDA Pre-Authorized",
                "Confidential Brand Portals",
                "Secure Client Encryption",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                  <ShieldCheck className="h-5 w-5 text-[color:var(--t10-emerald)] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Large transparent logo watermark in the middle */}
        <div className="relative py-12 md:py-20 flex justify-center items-center overflow-hidden pointer-events-none select-none">
          <img
            src="/logo/t10-brand-logo.svg"
            alt="Think10 Watermark"
            className="w-full max-w-[700px] h-auto opacity-[0.05] object-contain"
          />
        </div>

        {/* Legal & Notice Section */}
        <div className="border-t border-slate-100 pt-8 pb-10">
          <p className="text-xs leading-relaxed text-slate-400 font-light max-w-5xl">
            <strong className="font-semibold text-slate-500">Advisory & Confidentiality Notice:</strong>{" "}
            Think10 is a private advisory membership platform and does not offer formal DED legal registration representation or financial banking brokerage. All strategic forecasts, inventory simulations, and marketplace compliance templates are synthesized for operational modeling, intended solely for internal strategic planning under executed Mutual NDAs.
          </p>
        </div>

        {/* Very Bottom Copyright & Legal Links */}
        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} Think10. Managed by Taqseem Consulting Services LLC. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { label: "Confidentiality Protocol", href: "/privacy" },
              { label: "NDA Terms of Service", href: "/terms" },
              { label: "Vault Security", href: "/security" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
