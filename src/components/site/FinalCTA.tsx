import { Section } from "./SiteShell";
import { CTA } from "./CTA";
import { Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <Section className="relative overflow-hidden bg-[#030914] py-32 lg:py-48 isolate border-t border-white/5">
      {/* Abstract Glowing Mesh Background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Core central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle,rgba(0,185,121,0.08)_0%,rgba(0,0,0,0)_60%)]" />
        
        {/* Animated Orbs */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[color:var(--t10-emerald)]/10 rounded-full blur-[120px] mix-blend-screen t10-animate-float-slow" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen t10-animate-float-reverse" />
        
        {/* Refined Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDU5LjVoNjBNNTkuNSAwVjYwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-60" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center flex flex-col items-center">
        {/* Premium Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-12 shadow-[0_0_20px_rgba(0,185,121,0.1)] transition-all hover:bg-white/10 hover:scale-105 hover:border-[color:var(--t10-emerald)]/30 cursor-default group">
          <Sparkles className="w-4 h-4 text-[color:var(--t10-green)] group-hover:animate-pulse" />
          <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Ready when you are</span>
        </div>

        {/* Massive Gradient Title */}
        <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40 mb-8 leading-[1.1] pb-2">
          Bring us the business problem you cannot solve alone.
        </h2>
        
        {/* Refined Subtitle */}
        <p className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto mb-14 leading-relaxed font-light">
          Start with a conversation. Zyne responds in seconds; a human expert is one click away.
        </p>

        {/* Premium Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
          {/* Primary CTA */}
          <CTA 
            to="/zyne" 
            variant="primary" 
            className="group relative overflow-hidden !rounded-full w-full sm:w-auto bg-[color:var(--t10-emerald)] hover:bg-[color:var(--t10-green)] text-[#030914] px-10 py-5 text-lg font-bold border-0 shadow-[0_0_40px_rgba(0,185,121,0.4)] hover:shadow-[0_0_80px_rgba(0,185,121,0.6)] hover:-translate-y-1 transition-all duration-300"
          >
            Ask Zyne Now
          </CTA>
          
          {/* Secondary CTA */}
          <CTA
            to="/book-discovery-call"
            variant="outline"
            className="group w-full sm:w-auto !rounded-full px-10 py-5 text-lg font-bold backdrop-blur-xl bg-white/5 border border-white/20 text-white hover:bg-white hover:text-[#081426] hover:-translate-y-1 transition-all duration-300"
          >
            Book a Discovery Call
          </CTA>
        </div>
        
        {/* Premium Trust Indicators / Footer line */}
        <div className="mt-24 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs font-bold tracking-[0.15em] text-white/30 uppercase">
          <div className="hidden sm:block w-24 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
          <p className="hover:text-white/70 transition-colors">Confidential</p>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20" />
          <p className="hover:text-white/70 transition-colors">Practical</p>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/20" />
          <p className="hover:text-white/70 transition-colors">Built around your business</p>
          <div className="hidden sm:block w-24 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>
    </Section>
  );
}
