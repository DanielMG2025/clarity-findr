import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Sparkles } from "lucide-react";
import type { Confidence } from "../blocks";

interface Props {
  completion: number;
  confidence: Confidence;
  unlockedCount: number;
  totalFeatures: number;
}

const CONF_TONE: Record<Confidence, { label: string; cls: string }> = {
  low:    { label: "Low confidence",    cls: "bg-muted text-muted-foreground" },
  medium: { label: "Medium confidence", cls: "bg-primary-soft text-primary" },
  high:   { label: "High confidence",   cls: "bg-accent-soft text-accent" },
};

export function ProfileCompletion({ completion, confidence, unlockedCount, totalFeatures }: Props) {
  const tone = CONF_TONE[confidence];
  return (
    <Card className="p-6 bg-gradient-card border-2">
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
          <Badge className={tone.cls}>
            <ShieldCheck className="size-3 mr-1" /> {tone.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {unlockedCount}/{totalFeatures} features unlocked
          </span>
        </div>
      </div>
      <Progress value={completion} className="h-3" />
    </Card>
  );
}
