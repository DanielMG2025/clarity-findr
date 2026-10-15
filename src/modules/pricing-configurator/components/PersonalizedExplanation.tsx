import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ScenarioBundle } from "../logic/types";

export function PersonalizedExplanation({ bundle }: { bundle: ScenarioBundle }) {
  const { profile, notes } = bundle;
  const lines: string[] = [];

  lines.push(
    `For your case, we started from typical prices in ${profile.country} for a ${profile.treatment.toUpperCase()} treatment, then adjusted the range based on your age (${profile.age}).`
  );
  if (profile.needs_pgt) lines.push("Since you flagged interest in genetic testing (PGT-A), we've included it in the premium scenario.");
  if (profile.needs_icsi) lines.push("We've added ICSI to the scenarios where it applies.");
  lines.push(...notes);
  lines.push("These estimates are indicative and don't replace an official clinic quote. They are not medical advice.");

  return (
    <Card className="p-6 rounded-none border-0 border-y border-border/70 bg-gradient-to-br from-primary-soft/30 to-accent-soft/20 shadow-none">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Sparkles className="size-4" />
        <span className="text-xs font-medium uppercase tracking-[0.18em]">Personalized explanation</span>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        {lines.map((l, i) => <p key={i}>{l}</p>)}
      </div>
    </Card>
  );
}
