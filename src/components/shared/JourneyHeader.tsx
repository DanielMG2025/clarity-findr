import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface Step {
  label: string;
}

export type JourneyTone = "explorer" | "navigator" | "expert" | "donor" | "freezing" | "clinic" | "partner";

const TONE_MAP: Record<JourneyTone, { stripe: string; badge: string; ring: string; label: string }> = {
  explorer:  { stripe: "from-primary to-primary-glow",    badge: "bg-primary-soft text-primary border-primary/30",          ring: "ring-primary/30",    label: "Explorer" },
  navigator: { stripe: "from-accent to-accent/70",         badge: "bg-accent-soft text-accent border-accent/30",             ring: "ring-accent/30",     label: "Navigator" },
  expert:    { stripe: "from-expert to-expert/60",         badge: "bg-expert-soft text-expert border-expert/30",             ring: "ring-expert/30",     label: "Expert · Concierge" },
  donor:     { stripe: "from-donor to-donor/60",           badge: "bg-donor-soft text-donor border-donor/30",                ring: "ring-donor/30",      label: "Donor" },
  freezing:  { stripe: "from-freezing to-freezing/60",     badge: "bg-freezing-soft text-freezing border-freezing/30",       ring: "ring-freezing/30",   label: "Egg Freezing" },
  clinic:    { stripe: "from-clinic to-clinic/60",         badge: "bg-clinic-soft text-clinic border-clinic/30",             ring: "ring-clinic/30",     label: "Clinic Portal" },
  partner:   { stripe: "from-partner to-partner/60",       badge: "bg-partner-soft text-partner-foreground border-partner/40", ring: "ring-partner/30",    label: "Partner" },
};

interface JourneyHeaderProps {
  module?: string;
  tone?: JourneyTone;
  title: string;
  subtitle?: string;
  steps: Step[];
  current: number;
  Icon?: LucideIcon;
}

export function JourneyHeader({ module, tone = "explorer", title, subtitle, steps, current, Icon }: JourneyHeaderProps) {
  const pct = ((current + 1) / steps.length) * 100;
  const t = TONE_MAP[tone];
  const moduleLabel = module ?? t.label;
  return (
    <div className="relative">
      {/* Tone stripe */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${t.stripe}`} />
      <div className="container max-w-4xl py-8 space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-smooth">
          <ArrowLeft className="size-4" /> Back to start
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className={`${t.badge} font-semibold gap-1.5`}>
            {Icon && <Icon className="size-3.5" />}
            {moduleLabel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Step {current + 1} of {steps.length} · {steps[current]?.label}
          </span>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <Progress value={pct} className={`h-2 ring-1 ${t.ring}`} />
      </div>
    </div>
  );
}
