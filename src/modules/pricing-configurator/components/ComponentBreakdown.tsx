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
    <Card className="p-6 space-y-5 bg-gradient-card border-2">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Orientative range · {estimate.plan_label} · {estimate.market.label}
          </div>
          <div className="text-3xl font-bold tabular-nums mt-1">
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
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          What's in this range
        </div>
        <ul className="divide-y border rounded-lg overflow-hidden">
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

      <div className="rounded-lg bg-muted/40 border border-dashed p-3 space-y-2">
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
