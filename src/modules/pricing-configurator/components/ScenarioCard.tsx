import { Check, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WhyDisclosure, WhyLine } from "@/components/patient/WhyDisclosure";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { Confidence, Scenario } from "../logic/types";

const TONE: Record<Scenario["tone"], { ring: string; chip: string; bar: string; dot: string }> = {
  emerald: { ring: "ring-accent/30",   chip: "bg-accent-soft text-accent",     bar: "bg-accent",     dot: "bg-accent" },
  blue:    { ring: "ring-primary/30",  chip: "bg-primary-soft text-primary",   bar: "bg-primary",    dot: "bg-primary" },
  violet:  { ring: "ring-expert/30",   chip: "bg-expert-soft text-expert",     bar: "bg-expert",     dot: "bg-expert" },
};

const RISK_CLS: Record<Scenario["riskLabel"], string> = {
  "Low risk":     "bg-accent-soft text-accent border-accent/30",
  "Medium risk":  "bg-primary-soft text-primary border-primary/30",
  "Higher risk":  "bg-warning/15 text-warning-foreground border-warning/30",
};

interface Props {
  scenario: Scenario;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
  /** Bundle-level confidence, shown as the module's shared badge when available. */
  confidence?: Confidence;
  /** Market the range is anchored to, used in the "why" explanation. */
  market?: string;
}

export function ScenarioCard({ scenario, selected, onSelect, compact, confidence, market }: Props) {

  const t = TONE[scenario.tone];
  return (
    <Card
      className={cn(
        "p-5 transition-smooth cursor-pointer ring-1 hover:shadow-card",
        selected ? `ring-2 ${t.ring} shadow-card` : "ring-border",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold", t.chip)}>
            <span>{t.label}</span> {scenario.label}
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{scenario.shortDesc}</p>
        </div>
        {selected && <Check className="size-5 text-accent shrink-0" />}
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="text-3xl font-bold tabular-nums tracking-tight">
          €{scenario.total_min.toLocaleString()} – €{scenario.total_max.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">Estimated total range · all-in</div>
      </div>

      <Badge variant="outline" className={cn("gap-1.5", RISK_CLS[scenario.riskLabel])}>
        <AlertTriangle className="size-3" />
        {scenario.riskLabel}
      </Badge>
      <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{scenario.riskHint}</p>

      {!compact && (
        <div className="mt-4 space-y-2">
          {scenario.components.slice(0, 4).map((c) => (
            <div key={c.key} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{c.label}</span>
              <span className="font-semibold tabular-nums">€{c.min.toLocaleString()}–{c.max.toLocaleString()}</span>
            </div>
          ))}
          {scenario.components.length > 4 && (
            <div className="text-[11px] text-muted-foreground italic">+ {scenario.components.length - 4} more items in the breakdown</div>
          )}
        </div>
      )}

      {onSelect && (
        <Button variant={selected ? "default" : "outline"} size="sm" className="mt-4 w-full gap-1.5">
          <Sparkles className="size-3.5" />
          {selected ? "Selected" : "View breakdown"}
        </Button>
      )}
    </Card>
  );
}
