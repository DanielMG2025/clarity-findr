import { Link } from "react-router-dom";
import { Check, Compass, Calculator, Building2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type JourneyStage = "explore" | "price" | "clinics" | "lead";

const STAGES: { key: JourneyStage; label: string; href: string; icon: typeof Compass }[] = [
  { key: "explore", label: "Explore",   href: "/explorer",     icon: Compass },
  { key: "price",   label: "Price",     href: "/pricing-lab",  icon: Calculator },
  { key: "clinics", label: "Clinics",   href: "/navigator",    icon: Building2 },
  { key: "lead",    label: "Contact",   href: "/results",      icon: MessageSquare },
];

interface JourneyProgressProps {
  current: JourneyStage;
  className?: string;
}

/**
 * High-level journey rail (Explore → Price → Clinics → Contact). Sits above the
 * per-screen step bar and helps users keep the bigger picture in mind.
 */
export function JourneyProgress({ current, className }: JourneyProgressProps) {
  const currentIdx = STAGES.findIndex((s) => s.key === current);
  return (
    <nav
      aria-label="Journey progress"
      className={cn(
        "w-full bg-card/60 backdrop-blur border border-border rounded-2xl p-2 flex items-center gap-1 overflow-x-auto",
        className,
      )}
    >
      {STAGES.map((s, i) => {
        const Icon = s.icon;
        const done = i < currentIdx;
        const active = i === currentIdx;
        const clickable = i <= currentIdx;
        const content = (
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-smooth whitespace-nowrap",
              active && "bg-primary text-primary-foreground shadow-sm",
              done && "text-foreground hover:bg-muted",
              !active && !done && "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-6 rounded-full grid place-items-center text-[11px] font-bold",
                active && "bg-primary-foreground/20 text-primary-foreground",
                done && "bg-primary/15 text-primary",
                !active && !done && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
            </span>
            <span>{s.label}</span>
          </div>
        );
        return (
          <div key={s.key} className="flex items-center gap-1">
            {clickable ? <Link to={s.href}>{content}</Link> : content}
            {i < STAGES.length - 1 && (
              <div className={cn("w-6 h-px shrink-0", i < currentIdx ? "bg-primary/40" : "bg-border")} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
