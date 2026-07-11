import { Globe, Users, MessagesSquare, Calculator, UserCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Citation, SourceKind } from "@/modules/provenance";

const SOURCES = [
  { Icon: Globe,          title: "Public clinic prices",        desc: "Official price lists and fee pages from European clinic websites." },
  { Icon: Users,          title: "Patient quotes",              desc: "Real quotes patients have shared after their first consultation." },
  { Icon: MessagesSquare, title: "Community & forum data",      desc: "Public conversations and shared experiences about similar treatments." },
  { Icon: Calculator,     title: "Statistical estimates",       desc: "Models that adjust medication, lab and extras based on market patterns." },
  { Icon: UserCircle2,    title: "Profile-based adjustments",   desc: "Age, country and the options you've selected fine-tune the ranges so they're more realistic for you." },
];

const KIND_LABEL: Record<SourceKind, string> = {
  scraped_web: "Published clinic price",
  aggregator: "Public price comparator",
  public_report: "Public market report",
  crowd: "Patient-shared price",
  b2b: "Clinic rate card",
};

export function DataSourcesPanel({ citations }: { citations?: Citation[] }) {
  const hasCitations = !!citations && citations.length > 0;
  return (
    <Card className="p-6 bg-primary-soft/30 border-primary/15">
      <h3 className="text-lg font-bold mb-1">How do we calculate this?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        We blend several data sources to give you a realistic range — not one single, unrealistic number.
      </p>
      <ul className="grid sm:grid-cols-2 gap-3">
        {SOURCES.map(({ Icon, title, desc }) => (
          <li key={title} className="flex gap-3 p-3 rounded-lg bg-background/70 border border-border">
            <div className="size-9 rounded-lg bg-primary-soft grid place-items-center shrink-0">
              <Icon className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed mt-0.5">{desc}</div>
            </div>
          </li>
        ))}
      </ul>

      {hasCitations && (
        <div className="mt-4 pt-4 border-t border-primary/15">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Sources behind your range
          </div>
          <ul className="space-y-1.5">
            {citations!.map((c) => (
              <li key={`${c.source_id}-${c.observed_at}`} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground">
                  {KIND_LABEL[c.source_kind]} · {new Date(c.observed_at).toLocaleDateString()}
                </span>
                <span className="tabular-nums font-medium">€{Math.round(c.amount_eur).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
