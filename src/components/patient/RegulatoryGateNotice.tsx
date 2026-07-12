import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, ArrowRight } from "lucide-react";
import { byCode, type RegulatoryOrientation } from "@/modules/regulatory";

/**
 * The regulatory GATE, surfaced on Costs and Clinics. When the patient's home
 * country doesn't allow something they need, we say so plainly and point to the
 * countries that are legally viable — the same `viable_countries` that filters
 * the clinic list below.
 */
export function RegulatoryGateNotice({ orientation }: { orientation: RegulatoryOrientation | null }) {
  if (!orientation || !orientation.needs_to_travel) return null;

  const viable = orientation.viable_countries.map((c) => byCode(c)?.label ?? c);

  return (
    <Card className="p-5 bg-rose-500/10 border-rose-500/25">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center size-9 rounded-xl bg-rose-500/15 text-rose-600 shrink-0"><Plane className="size-5" /></span>
        <div className="space-y-2">
          <div className="font-semibold">{orientation.headline}</div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The costs and clinics shown here are limited to countries where your situation is legally
            viable{viable.length ? <>: <strong className="text-foreground">{viable.join(", ")}</strong></> : "."}
          </p>
          <Button asChild size="sm" variant="outline" className="gap-1">
            <Link to="/orientacion">See your full legal framework <ArrowRight className="size-3.5" /></Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
