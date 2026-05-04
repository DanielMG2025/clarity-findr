import { Link } from "react-router-dom";
import { ArrowRight, Compass, Search, Headset, HeartHandshake, Snowflake } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProfileStore, type JourneyKind } from "@/modules/profile/store";

interface JourneyOption {
  id: JourneyKind;
  href: string;
  icon: LucideIcon;
  label: string;
  description: string;
  time: string;
  tone: string;
}

const JOURNEYS: JourneyOption[] = [
  { id: "explorer",  href: "/explorer",  icon: Compass,        label: "I'm just starting",       description: "You're learning what fertility care is and what it costs. We'll guide you step by step.", time: "~5 min",  tone: "explorer" },
  { id: "navigator", href: "/navigator", icon: Search,         label: "I've already researched", description: "You know some terms. Get precise matching, side-by-side comparisons and financing.",         time: "~10 min", tone: "navigator" },
  { id: "expert",    href: "/expert",    icon: Headset,        label: "I want direct help",      description: "A guided concierge service. We help you build a shortlist and prepare your file.",          time: "Personal",tone: "expert" },
  { id: "donor",     href: "/donor",     icon: HeartHandshake, label: "I want to donate eggs",   description: "Learn what donation means, eligibility, compensation and how to safely connect with clinics.", time: "~3 min", tone: "donor" },
  { id: "freezing",  href: "/freezing",  icon: Snowflake,      label: "I want to freeze my eggs",description: "Understand timing, costs and what to expect — without medical pressure.",                       time: "~5 min", tone: "freezing" },
];

const TONE_STYLES: Record<string, { soft: string; text: string; border: string }> = {
  explorer:  { soft: "bg-primary-soft",  text: "text-primary",  border: "hover:border-primary/40" },
  navigator: { soft: "bg-accent-soft",   text: "text-accent",   border: "hover:border-accent/40" },
  expert:    { soft: "bg-expert-soft",   text: "text-expert",   border: "hover:border-expert/40" },
  donor:     { soft: "bg-donor-soft",    text: "text-donor",    border: "hover:border-donor/40" },
  freezing:  { soft: "bg-freezing-soft", text: "text-freezing", border: "hover:border-freezing/40" },
};

interface JourneySelectorProps {
  /** Optional intro label above the grid. */
  heading?: string;
}

export function JourneySelector({ heading }: JourneySelectorProps) {
  const setJourney = useProfileStore((s) => s.setJourney);
  return (
    <div className="space-y-4">
      {heading && (
        <div className="text-sm font-semibold text-foreground">{heading}</div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {JOURNEYS.map((j) => {
          const Icon = j.icon;
          const t = TONE_STYLES[j.tone];
          return (
            <Link key={j.id} to={j.href} onClick={() => setJourney(j.id)} className="group">
              <Card className={`p-6 h-full hover:shadow-elegant transition-smooth border-2 bg-gradient-card ${t.border} relative overflow-hidden`}>
                <div className={`absolute inset-x-0 top-0 h-1 ${t.soft}`} />
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-12 rounded-2xl grid place-items-center ${t.soft}`}>
                    <Icon className={`size-6 ${t.text}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">{j.time}</Badge>
                </div>
                <Badge variant="outline" className={`mb-2 text-[10px] uppercase tracking-wider ${t.text} border-current/30`}>
                  {j.tone}
                </Badge>
                <h3 className="text-lg font-bold mb-1.5">{j.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{j.description}</p>
                <div className={`text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all ${t.text}`}>
                  Start this path <ArrowRight className="size-4" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
