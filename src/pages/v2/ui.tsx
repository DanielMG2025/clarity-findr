// Small presentation pieces shared by the journey v2 pages (editorial tokens only).
import type { ReactNode } from "react";
import { ChevronDown, HardHat } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export const SMALL_CAPS = "text-[11px] font-semibold uppercase tracking-[0.18em]";

/** Pick the active language from an inline {en, es} pair. */
export function useL() {
  const { language } = useLanguage();
  return { language, es: language === "es", L: (v: { en: string; es: string }) => v[language] };
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn(SMALL_CAPS, "text-primary", className)}>{children}</p>;
}

/** A large tappable option (mosaic), not a select. */
export function Tile({ selected, onClick, children, className, testId }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string; testId?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "min-h-11 min-w-0 rounded-lg border px-3 py-2.5 text-left text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-accent",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** "Para qué" line under a question or block. */
export function Why({ children }: { children: ReactNode }) {
  return <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

/** Honest placeholder when no content exists yet. */
export function Pending({ children }: { children: ReactNode }) {
  const { es } = useL();
  return (
    <p className="flex items-start gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground" data-testid="pending">
      <HardHat aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
      <span><strong className="font-semibold text-foreground">{es ? "En preparación" : "In preparation"}</strong> · {children}</span>
    </p>
  );
}

/** Folded block of the guide's deeper layer, with its "why it's here" line. */
export function Fold({ id, title, why, children, defaultOpen = false }: { id: string; title: string; why: string; children: ReactNode; defaultOpen?: boolean }) {
  const { es } = useL();
  return (
    <Collapsible id={id} defaultOpen={defaultOpen} className="scroll-mt-24 border-t border-border/70 py-4">
      <CollapsibleTrigger className="group flex w-full items-start justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="min-w-0">
          <span className="block font-display text-xl font-medium leading-snug">{title}</span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{why}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 pt-1 text-xs text-muted-foreground group-hover:text-primary">
          <span className="sr-only">{es ? "Desplegar" : "Expand"}</span>
          <ChevronDown aria-hidden className="size-4 transition-transform group-data-[state=open]:rotate-180" />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
