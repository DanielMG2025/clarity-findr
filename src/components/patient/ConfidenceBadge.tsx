import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type ConfidenceLevel = "high" | "medium" | "low";

const MAP: Record<ConfidenceLevel, { label: string; cls: string; Icon: typeof Shield; hint: string }> = {
  high:   { label: "High confidence",   cls: "bg-accent-soft text-accent border-accent/30",             Icon: ShieldCheck, hint: "We have enough data to back this. It should be a solid starting point for your conversations." },
  medium: { label: "Medium confidence", cls: "bg-primary-soft text-primary border-primary/30",          Icon: Shield,      hint: "We mix public data with model estimates. The more you complete your profile, the sharper it gets." },
  low:    { label: "Low confidence",    cls: "bg-warning/15 text-warning-foreground border-warning/30", Icon: ShieldAlert, hint: "We still have limited data. Treat this as indicative only." },
};

/** One consistent confidence badge for every page that shows a confidence level. */
export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const m = MAP[level];
  const Icon = m.Icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`${m.cls} gap-1.5 cursor-help`}>
          <Icon className="size-3.5" /> {m.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{m.hint}</TooltipContent>
    </Tooltip>
  );
}
