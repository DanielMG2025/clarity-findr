import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Info, AlertTriangle, Stethoscope } from "lucide-react";
import { useProfileStore } from "@/modules/profile/store";
import { usePatientProfileStore } from "@/modules/patient-profile/store";
import { overallCompletion, profileConfidence } from "@/modules/patient-profile/blocks";

type Band = "favorable" | "mixed" | "complex" | "insufficient";

interface FactorRow {
  key: string;
  label: string;
  status: "favorable" | "mixed" | "complex" | "missing";
  note: string;
}

function evaluate(): { band: Band; factors: FactorRow[]; missing: string[] } {
  const p = useProfileStore.getState();
  const pp = usePatientProfileStore.getState();
  const factors: FactorRow[] = [];
  const missing: string[] = [];

  // Age
  if (!p.age) {
    factors.push({ key: "age", label: "Age", status: "missing", note: "Not shared yet." });
    missing.push("Age");
  } else if (p.age < 35) factors.push({ key: "age", label: "Age", status: "favorable", note: `${p.age} years — typically a favorable range.` });
  else if (p.age < 40) factors.push({ key: "age", label: "Age", status: "mixed", note: `${p.age} years — factors start to weigh more.` });
  else factors.push({ key: "age", label: "Age", status: "complex", note: `${p.age} years — usually requires more clinical nuance.` });

  // AMH
  const amh = pp.medical.amh;
  if (amh === undefined) {
    factors.push({ key: "amh", label: "Ovarian reserve (AMH)", status: "missing", note: "No AMH value shared." });
    missing.push("AMH (ovarian reserve)");
  } else if (amh >= 1.5) factors.push({ key: "amh", label: "Ovarian reserve (AMH)", status: "favorable", note: `AMH ${amh} — typically favorable.` });
  else if (amh >= 0.7) factors.push({ key: "amh", label: "Ovarian reserve (AMH)", status: "mixed", note: `AMH ${amh} — intermediate range.` });
  else factors.push({ key: "amh", label: "Ovarian reserve (AMH)", status: "complex", note: `AMH ${amh} — usually associated with more complexity.` });

  // Previous attempts
  const prior = p.priorFailedCycles ?? pp.history.length;
  if (prior === 0) factors.push({ key: "prior", label: "Previous attempts", status: "favorable", note: "No prior unsuccessful cycles recorded." });
  else if (prior <= 2) factors.push({ key: "prior", label: "Previous attempts", status: "mixed", note: `${prior} prior unsuccessful cycles.` });
  else factors.push({ key: "prior", label: "Previous attempts", status: "complex", note: `${prior}+ prior cycles — more complex case.` });

  // Diagnosis
  const dx = pp.medical.diagnosis ?? [];
  if (dx.length === 0) {
    factors.push({ key: "dx", label: "Diagnosis", status: "missing", note: "No diagnosis shared." });
    missing.push("Diagnosis");
  } else factors.push({ key: "dx", label: "Diagnosis", status: "mixed", note: `Considered: ${dx.slice(0, 2).join(", ")}` });

  // Sperm factor
  const sp = pp.medical.partner_sperm_quality;
  if (!sp || sp === "unknown") {
    factors.push({ key: "sperm", label: "Male factor", status: "missing", note: "Information not shared." });
    missing.push("Male factor");
  } else if (sp === "normal") factors.push({ key: "sperm", label: "Male factor", status: "favorable", note: "Reported as normal." });
  else if (sp === "mild") factors.push({ key: "sperm", label: "Male factor", status: "mixed", note: "Mild alteration reported." });
  else factors.push({ key: "sperm", label: "Male factor", status: "complex", note: "Significant alteration reported." });

  // Treatment path
  if (p.treatment) factors.push({ key: "tx", label: "Treatment of interest", status: "mixed", note: `Current interest: ${p.treatment.toUpperCase()}.` });
  else {
    factors.push({ key: "tx", label: "Treatment of interest", status: "missing", note: "Not defined yet." });
    missing.push("Treatment of interest");
  }

  // Determine band
  const counts = factors.reduce(
    (acc, f) => ((acc[f.status] = (acc[f.status] || 0) + 1), acc),
    {} as Record<string, number>,
  );
  const known = factors.length - (counts.missing || 0);
  let band: Band;
  if (known < 3) band = "insufficient";
  else if ((counts.complex || 0) >= 2) band = "complex";
  else if ((counts.mixed || 0) + (counts.complex || 0) >= 3) band = "mixed";
  else band = "favorable";

  return { band, factors, missing };
}

const BAND_META: Record<Band, { label: string; tone: string; desc: string }> = {
  favorable:    { label: "Favorable factors",       tone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", desc: "Most known factors tend to align with more favorable scenarios in people with similar profiles." },
  mixed:        { label: "Mixed factors",           tone: "bg-amber-500/15 text-amber-700 border-amber-500/30",       desc: "Some favorable factors and others that may weigh negatively. Worth discussing with a professional." },
  complex:      { label: "More complex factors",    tone: "bg-rose-500/15 text-rose-700 border-rose-500/30",          desc: "Some known factors are usually associated with more complex cases. A personalized medical review is especially important." },
  insufficient: { label: "Not enough information",  tone: "bg-muted text-foreground border-border",                   desc: "We don't have enough data yet for an orientation. Share more information to refine it." },
};

export function SuccessOrientationCard() {
  const profile = useProfileStore();
  const pp = usePatientProfileStore();
  const completion = overallCompletion(profile, pp);
  const confidence = profileConfidence(completion);
  const { band, factors, missing } = evaluate();
  const meta = BAND_META[band];

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
        <Badge variant="outline" className="text-xs">
          Confidence: {confidence === "high" ? "High" : confidence === "medium" ? "Medium" : "Low"}
        </Badge>
      </div>

      <div className={`rounded-xl border p-4 ${meta.tone}`}>
        <div className="font-semibold mb-1">{meta.label}</div>
        <p className="text-sm leading-relaxed opacity-90">{meta.desc}</p>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        This orientation is based on publicly known factors such as age, ovarian reserve, prior
        history, diagnosis and treatment type. <strong>It is not a medical prediction.</strong>
      </p>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Factor by factor</div>
        <ul className="divide-y border rounded-lg overflow-hidden">
          {factors.map((f) => (
            <li key={f.key} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="font-medium">{f.label}</span>
              <span className="text-xs text-muted-foreground text-right">{f.note}</span>
            </li>
          ))}
        </ul>
      </div>

      {missing.length > 0 && (
        <div className="rounded-lg bg-muted/50 border p-3 text-xs">
          <div className="flex items-center gap-2 font-semibold mb-1"><AlertTriangle className="size-3.5" /> Data missing to refine this</div>
          <p className="text-muted-foreground">{missing.join(" · ")}</p>
        </div>
      )}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-foreground inline-flex items-center gap-1">
          <Info className="size-3.5" /> Why we see this
        </summary>
        <div className="mt-2 space-y-2 leading-relaxed">
          <p><strong>Data influencing this:</strong> age, AMH, prior attempts, diagnosis and treatment of interest.</p>
          <p><strong>Missing to refine:</strong> {missing.length ? missing.join(", ") : "you have good data coverage."}</p>
          <p><strong>What to confirm with a doctor:</strong> any clinical interpretation of your specific values and the suitability of a specific treatment.</p>
        </div>
      </details>

      <div className="space-y-2">
        <Progress value={completion} className="h-2" />
        <p className="text-[11px] text-muted-foreground">{completion}% of your profile completed.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><Link to="/profile">Add more data</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to="/pricing-lab">See cost estimates</Link></Button>
        <Button asChild size="sm" className="gap-1"><Link to="/partners"><Stethoscope className="size-3.5" /> Talk to an expert <ArrowRight className="size-3.5" /></Link></Button>
      </div>
    </Card>
  );
}
