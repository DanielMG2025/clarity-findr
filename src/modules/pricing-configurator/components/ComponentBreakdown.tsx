import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Repeat, Sparkles } from "lucide-react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { IMPROVEMENT_PATH, type Estimate } from "@/modules/component-pricing";

const eur = (n: number) => `€${Math.round(n).toLocaleString()}`;

/** The configurator's explainable, sourced base range + component breakdown. */
export function ComponentBreakdown({ estimate }: { estimate: Estimate }) {
  const hasRecurring = estimate.recurring_max > 0;
  return (
    <Card className="p-6 space-y-5 rounded-none border-0 border-y border-border/70 bg-transparent shadow-none">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            Orientative range · {estimate.plan_label} · {estimate.market.label}
          </div>
          <div className="font-display text-4xl font-medium tabular-nums tracking-tight mt-1">
            {eur(estimate.total_min)}–{eur(estimate.total_max)}
          </div>
          {hasRecurring && (
            <div className="text-sm text-muted-foreground mt-0.5 inline-flex items-center gap-1">
              <Repeat className="size-3.5" /> + {eur(estimate.recurring_min)}–{eur(estimate.recurring_max)} storage
            </div>
          )}
        </div>
        <ConfidenceBadge level={estimate.confidence} />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{estimate.explanation}</p>

      {/* Component breakdown */}
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary mb-2">
          What's in this range
        </div>
        <ul className="divide-y divide-border/70 border-y border-border/70">
          {estimate.lines.map((l) => (
            <li key={l.key} className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">
                  {l.label}
                  {l.optional && <Badge variant="outline" className="ml-2 text-[10px]">optional</Badge>}
                  {l.recurring && <Badge variant="outline" className="ml-2 text-[10px]">annual</Badge>}
                </span>
                <span className="text-sm tabular-nums shrink-0">
                  {eur(l.min)}–{eur(l.max)}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{l.includes}</div>
              {l.note && (
                <div className="text-[11px] text-amber-700 dark:text-amber-500 mt-0.5 inline-flex items-start gap-1">
                  <Info className="size-3 mt-0.5 shrink-0" /> {l.note}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-y border-accent/40 bg-accent-soft/35 px-4 py-5 space-y-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Heads up:</strong> {estimate.caveat}
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed inline-flex items-start gap-1">
          <Sparkles className="size-3 mt-0.5 shrink-0 text-primary" /> {IMPROVEMENT_PATH}
        </p>
      </div>
    </Card>
  );
}
