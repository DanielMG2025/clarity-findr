import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { ScenarioBundle } from "../logic/types";

export function PersonalizedExplanation({ bundle }: { bundle: ScenarioBundle }) {
  const { profile, notes } = bundle;
  const lines: string[] = [];

  lines.push(
    `En tu caso, hemos partido de los precios típicos de ${profile.country} para un tratamiento de tipo ${profile.treatment.toUpperCase()}, ajustando el rango según tu edad (${profile.age}).`
  );
  if (profile.needs_pgt) lines.push("Como has marcado interés en pruebas genéticas (PGT-A), las hemos incluido en el escenario premium.");
  if (profile.needs_icsi) lines.push("Hemos sumado ICSI a los escenarios donde aplica.");
  lines.push(...notes);
  lines.push("Estas estimaciones son orientativas y no sustituyen el presupuesto oficial de una clínica. Tampoco son consejo médico.");

  return (
    <Card className="p-6 bg-gradient-to-br from-primary-soft/40 to-accent-soft/30 border-primary/20">
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Sparkles className="size-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Explicación personalizada</span>
      </div>
      <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
        {lines.map((l, i) => <p key={i}>{l}</p>)}
      </div>
    </Card>
  );
}
