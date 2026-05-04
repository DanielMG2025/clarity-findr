import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WhyYouSeeThisProps {
  title?: string;
  reasons: string[];
  variant?: "default" | "inline";
  className?: string;
}

/**
 * Universal explainer block. Use under any AI/algorithmic output (pricing
 * estimates, clinic ranking, suggested next steps) so the user always knows
 * the "why" behind a recommendation.
 */
export function WhyYouSeeThis({
  title = "Why you see this",
  reasons,
  variant = "default",
  className,
}: WhyYouSeeThisProps) {
  if (!reasons.length) return null;

  if (variant === "inline") {
    return (
      <div className={cn("rounded-xl border border-dashed border-primary/30 bg-primary-soft/30 p-3", className)}>
        <div className="text-[11px] uppercase tracking-wider font-bold text-primary inline-flex items-center gap-1 mb-1.5">
          <Sparkles className="size-3" /> {title}
        </div>
        <ul className="text-sm text-muted-foreground space-y-1">
          {reasons.map((r, i) => (
            <li key={i} className="leading-relaxed">• {r}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Card className={cn("p-5 bg-accent-soft/40 border-accent/20", className)}>
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl bg-background grid place-items-center shrink-0 border border-accent/20">
          <Sparkles className="size-4 text-accent" />
        </div>
        <div className="space-y-1.5">
          <div className="font-semibold text-sm text-foreground">{title}</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="leading-relaxed">• {r}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
