import { ShieldCheck, Database, Calculator } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TransparencyBlockProps {
  variant?: "calculation" | "data" | "method";
  title?: string;
  children: React.ReactNode;
}

const ICONS = {
  calculation: Calculator,
  data: ShieldCheck,
  method: Database,
};

const DEFAULT_TITLES = {
  calculation: "How we calculate this",
  data: "What we do with your data",
  method: "How this works",
};

export function TransparencyBlock({ variant = "method", title, children }: TransparencyBlockProps) {
  const Icon = ICONS[variant];
  return (
    <Card className="p-5 bg-primary-soft/40 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl bg-background grid place-items-center shrink-0 border border-primary/20">
          <Icon className="size-4 text-primary" />
        </div>
        <div className="space-y-1.5">
          <div className="font-semibold text-sm text-foreground">{title ?? DEFAULT_TITLES[variant]}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </div>
    </Card>
  );
}
