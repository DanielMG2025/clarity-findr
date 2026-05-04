import { Card } from "@/components/ui/card";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEATURES } from "../blocks";

export function UnlockedFeatures({ completion }: { completion: number }) {
  return (
    <Card className="p-5">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Features unlocked by your profile
      </div>
      <ul className="space-y-2">
        {FEATURES.map((f) => {
          const unlocked = completion >= f.threshold;
          return (
            <li
              key={f.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-smooth",
                unlocked ? "border-accent/30 bg-accent-soft/40" : "border-border bg-muted/30 opacity-70",
              )}
            >
              <span
                className={cn(
                  "size-7 rounded-full grid place-items-center shrink-0",
                  unlocked ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {unlocked ? <Check className="size-4" /> : <Lock className="size-3.5" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{f.label}</div>
                <div className="text-xs text-muted-foreground">{f.description}</div>
              </div>
              {!unlocked && (
                <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap">
                  at {f.threshold}%
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
