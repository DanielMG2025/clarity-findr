import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Info, AlertTriangle, Stethoscope, Check, TriangleAlert, HelpCircle } from "lucide-react";
import { usePatientJourney } from "@/modules/master-record";
import type { FactorKind } from "@/modules/master-record";
import { ConfidenceBadge } from "@/components/patient/ConfidenceBadge";

const KIND_META: Record<FactorKind, { icon: typeof Check; tone: string; label: string }> = {
  favorable: { icon: Check,        tone: "text-emerald-600", label: "In your favour" },
  attention: { icon: TriangleAlert, tone: "text-amber-600",  label: "To keep in mind" },
  missing:   { icon: HelpCircle,   tone: "text-muted-foreground", label: "Missing" },
};

/**
 * Success factors — rendered from the SHARED journey engine (step2_orientation),
 * the same one the demo uses. No diagnosis, no personalised percentages: honest
 * favourable / to-keep-in-mind / missing factors, each with its "why".
 */
export function SuccessOrientationCard() {
  const journey = usePatientJourney();
  const o = journey.step2_orientation;
  const missing = o.factors.filter((f) => f.kind === "missing");

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center size-9 rounded-xl bg-primary-soft text-primary">
            <Compass className="size-5" />
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approximate orientation</div>
            <h3 className="font-bold text-lg">Success factors</h3>
          </div>
        </div>
        <ConfidenceBadge level={o.confidence} />
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Based on publicly known factors such as age, ovarian reserve, prior history, diagnosis and
        treatment type. <strong>It is not a medical prediction.</strong>
      </p>

      <ul className="divide-y border rounded-lg overflow-hidden">
        {o.factors.map((f, i) => {
          const meta = KIND_META[f.kind];
          const Icon = meta.icon;
          return (
            <li key={`${f.title}-${i}`} className="flex items-start gap-2.5 px-3 py-2.5 text-sm">
              <Icon className={`size-4 mt-0.5 shrink-0 ${meta.tone}`} />
              <div className="min-w-0">
                <div className="font-medium">{f.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{f.why}</div>
              </div>
            </li>
          );
        })}
      </ul>

      {missing.length > 0 && (
        <div className="rounded-lg bg-muted/50 border p-3 text-xs">
          <div className="flex items-center gap-2 font-semibold mb-1"><AlertTriangle className="size-3.5" /> Data missing to refine this</div>
          <p className="text-muted-foreground">{missing.map((m) => m.title).join(" · ")}</p>
        </div>
      )}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-foreground inline-flex items-center gap-1">
          <Info className="size-3.5" /> Why we see this
        </summary>
        <div className="mt-2 space-y-2 leading-relaxed">
          <p><strong>How confident:</strong> {o.confidence_reason}</p>
          <p><strong>What to confirm with a doctor:</strong> any clinical interpretation of your specific values and the suitability of a specific treatment.</p>
          <p className="text-[11px]">{o.disclaimer}</p>
        </div>
      </details>

      <div className="space-y-2">
        <Progress value={o.completeness} className="h-2" />
        <p className="text-[11px] text-muted-foreground">{o.completeness}% of your profile completed.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><Link to="/situacion">Add more data</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to="/costes">See cost estimates</Link></Button>
        <Button asChild size="sm" className="gap-1"><Link to="/asesoramiento"><Stethoscope className="size-3.5" /> Talk to an expert <ArrowRight className="size-3.5" /></Link></Button>
      </div>
    </Card>
  );
}
