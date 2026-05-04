import type { ReactNode } from "react";
import { Info, Sparkles, Coins, Stethoscope } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SideInfoKind = "treatment" | "component" | "pricing";

interface SideInfoProps {
  /** Short label users click on (e.g. "ICSI", "PGT-A"). */
  term: string;
  kind?: SideInfoKind;
  /** What it is — plain language. */
  what: ReactNode;
  /** When it is used / who needs it. */
  when?: ReactNode;
  /** Impact on price — qualitative or numeric range. */
  priceImpact?: ReactNode;
  /** Optional small helper link. */
  learnMoreHref?: string;
  className?: string;
}

const KIND_META: Record<SideInfoKind, { label: string; icon: typeof Info }> = {
  treatment: { label: "Treatment", icon: Stethoscope },
  component: { label: "Component", icon: Sparkles },
  pricing:   { label: "Pricing",   icon: Coins },
};

/**
 * Reusable contextual explainer surfaced inline next to medical or pricing
 * terminology. Always presents three sections: what it is, when it's used,
 * and how it impacts price — so users never have to guess.
 */
export function SideInfo({ term, kind = "treatment", what, when, priceImpact, learnMoreHref, className }: SideInfoProps) {
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-md text-xs font-medium text-primary hover:underline underline-offset-2",
            className,
          )}
        >
          <Info className="size-3.5" />
          <span>{term}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm" side="top">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 text-[10px] uppercase tracking-wider">
            <Icon className="size-3" /> {meta.label}
          </Badge>
          <span className="font-semibold">{term}</span>
        </div>
        <Section label="What it is">{what}</Section>
        {when && <Section label="When it's used">{when}</Section>}
        {priceImpact && <Section label="Impact on price">{priceImpact}</Section>}
        {learnMoreHref && (
          <a href={learnMoreHref} className="text-xs font-medium text-primary hover:underline" target="_blank" rel="noreferrer">
            Learn more →
          </a>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
    </div>
  );
}
