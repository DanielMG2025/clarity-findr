import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Confidence } from "../logic/types";

const MAP: Record<Confidence, { label: string; cls: string; Icon: typeof Shield; hint: string }> = {
  high:   { label: "Confianza alta",   cls: "bg-accent-soft text-accent border-accent/30",      Icon: ShieldCheck, hint: "Tenemos suficientes datos (precios reales + cotizaciones de pacientes) para esta estimación." },
  medium: { label: "Confianza media",  cls: "bg-primary-soft text-primary border-primary/30",   Icon: Shield,      hint: "Mezclamos datos públicos y estimaciones. Cuanto más completes tu perfil, más precisa será." },
  low:    { label: "Confianza baja",   cls: "bg-warning/15 text-warning-foreground border-warning/30", Icon: ShieldAlert, hint: "Aún tenemos pocos datos. Considera el rango como orientativo." },
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const m = MAP[level];
  const Icon = m.Icon;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`${m.cls} gap-1.5 cursor-help`}>
          <Icon className="size-3.5" /> {m.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{m.hint}</TooltipContent>
    </Tooltip>
  );
}
