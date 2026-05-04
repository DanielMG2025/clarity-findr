import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Step {
  label: string;
}

interface JourneyHeaderProps {
  module: string;
  title: string;
  subtitle?: string;
  steps: Step[];
  current: number; // 0-indexed
}

export function JourneyHeader({ module, title, subtitle, steps, current }: JourneyHeaderProps) {
  const pct = ((current + 1) / steps.length) * 100;
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-smooth">
        <ArrowLeft className="size-4" /> Back to start
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary" className="bg-primary-soft text-primary border-primary/20">{module}</Badge>
        <span className="text-xs text-muted-foreground">
          Step {current + 1} of {steps.length} · {steps[current]?.label}
        </span>
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}
