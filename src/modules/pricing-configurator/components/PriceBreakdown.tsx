import { Card } from "@/components/ui/card";
import { WhatIsThis } from "@/components/shared/WhatIsThis";
import type { Scenario } from "../logic/types";

export function PriceBreakdown({ scenario }: { scenario: Scenario }) {
  const max = Math.max(...scenario.components.map(c => c.max), 1);
  return (
    <Card className="p-6">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="text-lg font-bold">Desglose detallado · {scenario.label}</h3>
        <div className="text-sm font-semibold tabular-nums text-primary">
          €{scenario.total_min.toLocaleString()} – €{scenario.total_max.toLocaleString()}
        </div>
      </div>
      <div className="space-y-4">
        {scenario.components.map((c) => {
          const pctMin = (c.min / max) * 100;
          const pctMax = (c.max / max) * 100;
          return (
            <div key={c.key}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.label}</span>
                  {c.hint && <WhatIsThis title={c.label} size="sm">{c.hint}</WhatIsThis>}
                </div>
                <span className="font-semibold tabular-nums">
                  €{c.min.toLocaleString()} – €{c.max.toLocaleString()}
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                <div className="absolute inset-y-0 bg-primary/25" style={{ left: `${Math.min(pctMin, pctMax - 2)}%`, width: `${Math.max(pctMax - pctMin, 4)}%` }} />
                <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${pctMin}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
        Las barras muestran el rango entre el precio mínimo y máximo observado para cada componente. La parte sólida es el mínimo; la zona difuminada, hasta el máximo.
      </p>
    </Card>
  );
}
