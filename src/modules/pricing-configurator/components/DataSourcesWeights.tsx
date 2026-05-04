import { Globe, Users, MessagesSquare, Calculator, UserCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Confidence } from "../logic/types";

interface SourceWeight {
  Icon: typeof Globe;
  title: string;
  weight: number; // 0-100
  desc: string;
  tone: string;
}

/**
 * Weights are calibrated by current data confidence:
 * - low:    we lean more on listed prices and statistical estimates
 * - medium: balanced
 * - high:   crowd quotes and scraped data dominate
 */
function buildSources(confidence: Confidence): SourceWeight[] {
  const w = {
    low:    { scraped: 35, crowd: 10, community: 10, stats: 35, profile: 10 },
    medium: { scraped: 30, crowd: 25, community: 15, stats: 20, profile: 10 },
    high:   { scraped: 25, crowd: 40, community: 15, stats: 10, profile: 10 },
  }[confidence];

  return [
    { Icon: Globe,          title: "Precios publicados",           weight: w.scraped,   desc: "Tarifas extraídas de webs oficiales de clínicas.", tone: "bg-primary" },
    { Icon: Users,          title: "Cotizaciones de pacientes",    weight: w.crowd,     desc: "Presupuestos reales que usuarios han compartido.", tone: "bg-accent" },
    { Icon: MessagesSquare, title: "Comunidad y foros",            weight: w.community, desc: "Conversaciones públicas sobre experiencias reales.", tone: "bg-expert" },
    { Icon: Calculator,     title: "Estimaciones estadísticas",    weight: w.stats,     desc: "Modelos que ajustan medicación, lab y extras.", tone: "bg-primary-glow" },
    { Icon: UserCircle2,    title: "Ajustes por tu perfil",        weight: w.profile,   desc: "Edad, país y opciones modulan los rangos.", tone: "bg-freezing" },
  ];
}

export function DataSourcesWeights({ confidence }: { confidence: Confidence }) {
  const sources = buildSources(confidence);
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-1">Cómo pesan las fuentes en tu estimación</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Combinamos varias fuentes y ajustamos su peso según los datos disponibles para tu caso. Cuantos más datos, más se apoya el cálculo en evidencia real.
      </p>
      <div className="space-y-3">
        {sources.map(({ Icon, title, weight, desc, tone }) => (
          <div key={title}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md bg-muted grid place-items-center">
                  <Icon className="size-3.5 text-foreground/70" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">{title}</div>
                  <div className="text-[11px] text-muted-foreground">{desc}</div>
                </div>
              </div>
              <div className="text-sm font-bold tabular-nums">{weight}%</div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className={`h-full ${tone} transition-all`} style={{ width: `${weight}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 italic">
        Estos pesos se recalculan automáticamente según la cantidad de datos disponibles para tu tratamiento y país.
      </p>
    </Card>
  );
}
