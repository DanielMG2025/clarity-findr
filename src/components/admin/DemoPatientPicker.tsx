import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, Wallet, ListChecks } from "lucide-react";
import { DEMO_PATIENTS, completeness, loadDemoPatient, type DemoPatientSeed } from "@/modules/master-record";

const LEVEL_TONE: Record<DemoPatientSeed["data_level"], string> = {
  high: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border",
};

export function DemoPatientPicker() {
  const navigate = useNavigate();

  const loadAndGo = (seed: DemoPatientSeed, to: string) => {
    loadDemoPatient(seed);
    navigate(to);
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-bold">Demo patients</h2>
        <p className="text-sm text-muted-foreground">
          Load a test patient into the live profile and jump straight into the engines. Data
          completeness varies on purpose — use it to show “more data → higher confidence”.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DEMO_PATIENTS.map((p) => (
          <Card key={p.key} className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.label}</div>
              </div>
              <Badge variant="outline" className={`text-[10px] shrink-0 ${LEVEL_TONE[p.data_level]}`}>
                {p.data_level}
              </Badge>
            </div>

            <div className="text-[11px] text-muted-foreground">
              {completeness(p)}% profile complete
            </div>

            <div className="flex flex-wrap gap-2 mt-auto">
              <Button asChild size="sm" variant="secondary" className="gap-1">
                <Link to={`/admin/demo/run/${p.key}`}><ListChecks className="size-3.5" /> Full run</Link>
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => loadAndGo(p, "/orientacion")}>
                <Compass className="size-3.5" /> Orientation
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => loadAndGo(p, "/costes")}>
                <Wallet className="size-3.5" /> Pricing
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
