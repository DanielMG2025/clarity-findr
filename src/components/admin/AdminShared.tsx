import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";

export const KpiCard = ({
  label,
  value,
  hint,
  icon,
  accent = "primary",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  accent?: "primary" | "accent" | "warning" | "muted";
}) => {
  const ring =
    accent === "accent"
      ? "text-accent"
      : accent === "warning"
        ? "text-warning"
        : accent === "muted"
          ? "text-muted-foreground"
          : "text-primary";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-extrabold tabular-nums mt-1 truncate">{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
        </div>
        <div className={`shrink-0 ${ring}`}>{icon}</div>
      </div>
    </Card>
  );
};

export const SectionHeader = ({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
}) => (
  <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>}
    </div>
    {right}
  </div>
);
