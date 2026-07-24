import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

type Props = {
  to: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "navy" | "ghost";
  icon?: boolean;
  className?: string;
};

export function CTA({ to, children, variant = "primary", icon = false, className = "" }: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-colors";
  const styles: Record<string, string> = {
    primary: "bg-[color:var(--t10-emerald)] text-white shadow-sm hover:bg-[color:var(--t10-green)]",
    outline:
      "border border-[color:var(--t10-navy)] text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-navy)] hover:text-white",
    navy: "bg-[color:var(--t10-navy)] text-white hover:bg-[color:var(--t10-navy-2)]",
    ghost: "text-[color:var(--t10-navy)] hover:bg-[color:var(--t10-mint)]",
  };
  return (
    <Link href={to} className={`${base} ${styles[variant]} ${className}`}>
      {icon ? <Sparkles className="h-4 w-4" /> : null}
      {children}
      {!icon ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}
