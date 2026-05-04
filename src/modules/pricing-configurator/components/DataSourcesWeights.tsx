import { Globe, Users, MessagesSquare, Calculator, UserCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Confidence } from "../logic/types";

interface SourceWeight {
  Icon: typeof Globe;
  title: string;
  weight: number;
  desc: string;
  tone: string;
}

function buildSources(confidence: Confidence): SourceWeight[] {
  const w = {
    low:    { scraped: 35, crowd: 10, community: 10, stats: 35, profile: 10 },
    medium: { scraped: 30, crowd: 25, community: 15, stats: 20, profile: 10 },
    high:   { scraped: 25, crowd: 40, community: 15, stats: 10, profile: 10 },
  }[confidence];

  return [
    { Icon: Globe,          title: "Published prices",            weight: w.scraped,   desc: "Rates pulled from official clinic websites.",                       tone: "bg-primary" },
    { Icon: Users,          title: "Patient quotes",              weight: w.crowd,     desc: "Real quotes shared by other patients.",                             tone: "bg-accent" },
    { Icon: MessagesSquare, title: "Community & forums",          weight: w.community, desc: "Public conversations about real treatment experiences.",           tone: "bg-expert" },
    { Icon: Calculator,     title: "Statistical estimates",       weight: w.stats,     desc: "Models that adjust for medication, lab work and add-ons.",         tone: "bg-primary-glow" },
    { Icon: UserCircle2,    title: "Profile-based adjustments",   weight: w.profile,   desc: "Age, country and your selections fine-tune the ranges.",           tone: "bg-freezing" },
  ];
}

export function DataSourcesWeights({ confidence }: { confidence: Confidence }) {
  const sources = buildSources(confidence);
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-1">How each source weighs in your estimate</h3>
      <p className="text-sm text-muted-foreground mb-5">
        We blend several sources and re-weight them based on the data available for your case. The more data we have, the more the estimate leans on real-world evidence.
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
        These weights are recalculated automatically based on how much data is available for your treatment and country.
      </p>
    </Card>
  );
}
