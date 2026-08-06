import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";
import { ConfidenceBadge } from "@/components/patient/ConfidenceBadge";
import type { Confidence } from "../blocks";

interface Props {
  completion: number;
  confidence: Confidence;
  unlockedCount: number;
  totalFeatures: number;
}

export function ProfileCompletion({ completion, confidence, unlockedCount, totalFeatures }: Props) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="size-3" /> Your fertility profile
          </div>
          <h2 className="text-2xl font-bold mt-1">{completion}% complete</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The more you complete, the more accurate your estimates and recommendations.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ConfidenceBadge level={confidence} />
          <span className="text-xs text-muted-foreground">
            {unlockedCount}/{totalFeatures} features unlocked
          </span>
        </div>
      </div>
      <Progress value={completion} className="h-2" />
    </Card>
  );
}
