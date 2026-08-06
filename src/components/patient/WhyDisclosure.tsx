import { Info, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The shared "Why you see this" affordance. Purely presentational: a consistent,
 * inviting disclosure used everywhere the product explains a figure or verdict.
 */
export function WhyDisclosure({
  label = "Why you see this",
  children,
  className = "",
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <details className={`group rounded-xl border border-border/70 bg-muted/25 px-3.5 py-2.5 ${className}`}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <Info className="size-3.5 shrink-0 text-primary" />
        <span>{label}</span>
        <ChevronDown className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="mt-2.5 space-y-2 text-xs leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

/** One labelled line inside a WhyDisclosure. */
export function WhyLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p>
      <span className="font-medium text-foreground">{label}:</span> {children}
    </p>
  );
}
