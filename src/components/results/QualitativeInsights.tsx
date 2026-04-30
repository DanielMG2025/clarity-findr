import { MessageSquare, Star, Users } from "lucide-react";
import { qualitativeInsights } from "@/lib/engines/personalEngine";
import type { Clinic } from "@/lib/engines/types";

const SENTIMENT_STYLE = {
  positive: { label: "Positive", cls: "bg-accent-soft text-accent border-accent/40" },
  mixed: { label: "Mixed", cls: "bg-warning/15 text-warning border-warning/40" },
  negative: { label: "Negative", cls: "bg-destructive/10 text-destructive border-destructive/40" },
} as const;

export const QualitativeInsights = ({ clinic }: { clinic: Clinic }) => {
  const q = qualitativeInsights(clinic);
  const s = SENTIMENT_STYLE[q.sentiment];
  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">
          Patient experience summary
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${s.cls}`}>
          Overall sentiment: {s.label}
        </span>
      </div>
      <div className="grid sm:grid-cols-3 gap-2.5">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/80 mb-1">
            <Star className="size-3.5 text-warning" /> Google Reviews
          </div>
          <div className="text-xs text-muted-foreground leading-snug">{q.google.summary}</div>
          <div className="text-[10px] text-muted-foreground mt-1.5">
            {q.google.rating}/5 · {q.google.reviews} reviews
          </div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/80 mb-1">
            <Users className="size-3.5 text-primary" /> Community insights
          </div>
          <div className="text-xs text-muted-foreground leading-snug">{q.community.summary}</div>
          <div className="text-[10px] text-muted-foreground mt-1.5">{q.community.mentions} member stories</div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/80 mb-1">
            <MessageSquare className="size-3.5 text-accent" /> Forum discussions
          </div>
          <div className="text-xs text-muted-foreground leading-snug">{q.forum.summary}</div>
          <div className="text-[10px] text-muted-foreground mt-1.5">{q.forum.threads} threads analyzed</div>
        </div>
      </div>
    </div>
  );
};
