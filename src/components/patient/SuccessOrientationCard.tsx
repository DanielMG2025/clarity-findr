import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Compass, ArrowRight, Info, HelpCircle, AlertTriangle, Stethoscope } from "lucide-react";
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
    factors.push({ key: "age", label: "Edad", status: "missing", note: "Aún no compartida." });
    missing.push("Edad");
  } else if (p.age < 35) factors.push({ key: "age", label: "Edad", status: "favorable", note: `${p.age} años — rango habitualmente favorable.` });
  else if (p.age < 40) factors.push({ key: "age", label: "Edad", status: "mixed", note: `${p.age} años — los factores empiezan a influir más.` });
  else factors.push({ key: "age", label: "Edad", status: "complex", note: `${p.age} años — suele requerir más matices clínicos.` });

  // AMH (ovarian reserve)
  const amh = pp.medical.amh;
  if (amh === undefined) {
    factors.push({ key: "amh", label: "Reserva ovárica (AMH)", status: "missing", note: "Sin valor de AMH compartido." });
    missing.push("AMH (reserva ovárica)");
  } else if (amh >= 1.5) factors.push({ key: "amh", label: "Reserva ovárica (AMH)", status: "favorable", note: `AMH ${amh} — habitualmente favorable.` });
  else if (amh >= 0.7) factors.push({ key: "amh", label: "Reserva ovárica (AMH)", status: "mixed", note: `AMH ${amh} — rango intermedio.` });
  else factors.push({ key: "amh", label: "Reserva ovárica (AMH)", status: "complex", note: `AMH ${amh} — suele asociarse a más complejidad.` });

  // Previous attempts
  const prior = p.priorFailedCycles ?? pp.history.length;
  if (prior === 0) factors.push({ key: "prior", label: "Intentos previos", status: "favorable", note: "Sin ciclos previos sin éxito registrados." });
  else if (prior <= 2) factors.push({ key: "prior", label: "Intentos previos", status: "mixed", note: `${prior} ciclos previos sin éxito.` });
  else factors.push({ key: "prior", label: "Intentos previos", status: "complex", note: `${prior}+ ciclos previos — caso más complejo.` });

  // Diagnosis
  const dx = pp.medical.diagnosis ?? [];
  if (dx.length === 0) {
    factors.push({ key: "dx", label: "Diagnóstico", status: "missing", note: "Sin diagnóstico compartido." });
    missing.push("Diagnóstico");
  } else factors.push({ key: "dx", label: "Diagnóstico", status: "mixed", note: `Considerado: ${dx.slice(0, 2).join(", ")}` });

  // Sperm factor
  const sp = pp.medical.partner_sperm_quality;
  if (!sp || sp === "unknown") {
    factors.push({ key: "sperm", label: "Factor masculino", status: "missing", note: "Información no compartida." });
    missing.push("Factor masculino");
  } else if (sp === "normal") factors.push({ key: "sperm", label: "Factor masculino", status: "favorable", note: "Calidad reportada como normal." });
  else if (sp === "mild") factors.push({ key: "sperm", label: "Factor masculino", status: "mixed", note: "Alteración leve reportada." });
  else factors.push({ key: "sperm", label: "Factor masculino", status: "complex", note: "Alteración significativa reportada." });

  // Treatment path
  if (p.treatment) factors.push({ key: "tx", label: "Tipo de tratamiento", status: "mixed", note: `Interés actual: ${p.treatment.toUpperCase()}.` });
  else {
    factors.push({ key: "tx", label: "Tipo de tratamiento", status: "missing", note: "Aún sin definir." });
    missing.push("Tratamiento de interés");
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
  favorable:   { label: "Factores favorables",       tone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", desc: "La mayoría de factores conocidos suelen asociarse a escenarios más favorables en personas con perfiles similares." },
  mixed:       { label: "Factores mixtos",           tone: "bg-amber-500/15 text-amber-700 border-amber-500/30",       desc: "Hay factores favorables y otros que pueden influir negativamente. Conviene comentarlo con un profesional." },
  complex:     { label: "Factores más complejos",    tone: "bg-rose-500/15 text-rose-700 border-rose-500/30",          desc: "Algunos factores conocidos suelen asociarse a casos más complejos. Una valoración médica personalizada es especialmente importante." },
  insufficient:{ label: "Información insuficiente",  tone: "bg-muted text-foreground border-border",                   desc: "Aún no tenemos suficientes datos para una orientación. Completa más información para afinar." },
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
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Orientación aproximada</div>
            <h3 className="font-bold text-lg">Factores de éxito</h3>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          Confianza: {confidence === "high" ? "Alta" : confidence === "medium" ? "Media" : "Baja"}
        </Badge>
      </div>

      <div className={`rounded-xl border p-4 ${meta.tone}`}>
        <div className="font-semibold mb-1">{meta.label}</div>
        <p className="text-sm leading-relaxed opacity-90">{meta.desc}</p>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Esta orientación se basa en factores conocidos públicamente como edad, reserva ovárica,
        historial previo, diagnóstico y tipo de tratamiento. <strong>No es una predicción médica.</strong>
      </p>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Factor por factor</div>
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
          <div className="flex items-center gap-2 font-semibold mb-1"><AlertTriangle className="size-3.5" /> Datos que faltan para afinar</div>
          <p className="text-muted-foreground">{missing.join(" · ")}</p>
        </div>
      )}

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer font-semibold text-foreground inline-flex items-center gap-1">
          <Info className="size-3.5" /> Por qué vemos esto
        </summary>
        <div className="mt-2 space-y-2 leading-relaxed">
          <p><strong>Qué datos influyen:</strong> edad, AMH, intentos previos, diagnóstico y tratamiento de interés.</p>
          <p><strong>Qué falta para afinar:</strong> {missing.length ? missing.join(", ") : "tienes una buena cobertura de datos."}</p>
          <p><strong>Qué deberías confirmar con un médico:</strong> cualquier interpretación clínica concreta de tus valores y la idoneidad de un tratamiento específico.</p>
        </div>
      </details>

      <div className="space-y-2">
        <Progress value={completion} className="h-2" />
        <p className="text-[11px] text-muted-foreground">{completion}% de tu perfil completado.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline"><Link to="/profile">Completar más datos</Link></Button>
        <Button asChild size="sm" variant="outline"><Link to="/pricing-lab">Ver costes estimados</Link></Button>
        <Button asChild size="sm" className="gap-1"><Link to="/partners"><Stethoscope className="size-3.5" /> Hablar con un experto <ArrowRight className="size-3.5" /></Link></Button>
      </div>
    </Card>
  );
}
