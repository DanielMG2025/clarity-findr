import { Sparkles } from "lucide-react";
import { personalizedReasons } from "@/lib/engines/personalEngine";
import type { AssessmentData, MatchResult } from "@/lib/engines/types";

export const PersonalizedReasons = ({ m, a }: { m: MatchResult; a: AssessmentData }) => {
  const reasons = personalizedReasons(m, a);
  if (!reasons.length) return null;
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary-soft/40 to-card p-4 mb-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
        <Sparkles className="size-3.5" /> Why this clinic is a strong match for you
      </div>
      <ul className="space-y-1.5 text-sm text-foreground/90">
        {reasons.map((r, i) => (
          <li key={i} className="flex gap-2 leading-relaxed">
            <span className="text-primary mt-0.5">→</span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
