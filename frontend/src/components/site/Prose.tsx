import type { ReactNode } from "react";

export function Prose({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`prose-t10 max-w-3xl text-[color:var(--t10-navy)]/90 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[color:var(--t10-navy)] [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[color:var(--t10-navy)] [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-[color:var(--t10-grey)] [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:text-[color:var(--t10-grey)] [&_a]:text-[color:var(--t10-emerald)] [&_a]:underline ${className}`}
    >
      {children}
    </div>
  );
}
