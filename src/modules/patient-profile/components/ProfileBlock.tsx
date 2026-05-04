import { useState, type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  required?: boolean;
  progress: number;
  unlocks: string[];
  defaultOpen?: boolean;
  children: ReactNode;
}

export function ProfileBlock({ icon: Icon, title, subtitle, required, progress, unlocks, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const done = progress >= 80;
  return (
    <Card className={cn("p-5 transition-smooth", done && "border-accent/40")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 text-left"
      >
        <div
          className={cn(
            "size-11 shrink-0 rounded-2xl grid place-items-center",
            done ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold">{title}</h3>
            {required && <Badge variant="secondary" className="text-[10px]">Required</Badge>}
            {done && <Badge className="text-[10px] bg-accent text-accent-foreground">Complete</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs font-semibold tabular-nums w-9 text-right">{progress}%</span>
          </div>
        </div>
        {open ? <ChevronUp className="size-4 text-muted-foreground mt-1" /> : <ChevronDown className="size-4 text-muted-foreground mt-1" />}
      </button>

      {open && (
        <div className="mt-5 pt-5 border-t space-y-4">
          {unlocks.length > 0 && (
            <div className="rounded-lg bg-primary-soft/50 p-3 text-xs flex items-start gap-2">
              <Sparkles className="size-3.5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-primary">Completing this unlocks:</span>{" "}
                <span className="text-muted-foreground">{unlocks.join(" · ")}</span>
              </div>
            </div>
          )}
          {children}
        </div>
      )}
    </Card>
  );
}
