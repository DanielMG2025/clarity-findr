import { Link } from "react-router-dom";
import {
  Upload, Database, Sliders, Compass, Eye, Sparkles, ArrowRight, CheckCircle2, Circle, Clock,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CARDS = [
  {
    icon: Upload, to: "/admin/upload", title: "Upload Dataset",
    desc: "Add Excel or CSV files with clinic pricing, review signals or discovery candidates.",
    status: "Staging vacío", tone: "muted" as const,
  },
  {
    icon: Database, to: "/admin/pricing-sources", title: "Pricing Sources",
    desc: "Raw, extracted and reviewed pricing references from official, benchmark or inferred sources.",
    status: "6 fuentes · 2 publicadas", tone: "ok" as const,
  },
  {
    icon: Sliders, to: "/admin/normalize-prices", title: "Normalize Prices",
    desc: "Workbench para extraer componentes, calcular rangos básico/premium y aprobar precios.",
    status: "3 borradores", tone: "warn" as const,
  },
  {
    icon: Compass, to: "/admin/clinic-discovery", title: "Clinic Discovery",
    desc: "Identify, review and import European fertility clinics with public pricing detail.",
    status: "Pipeline activo", tone: "ok" as const,
  },
  {
    icon: Eye, to: "/admin/patient-preview", title: "Patient Preview",
    desc: "Vista exacta de cómo el paciente verá el precio normalizado antes de publicar.",
    status: "FIV Madrid · seed", tone: "ok" as const,
  },
  {
    icon: Sparkles, to: "/admin/demo", title: "Demo Center",
    desc: "Atajos a perfil, configurador, comparador, normalización, widget y vista partner.",
    status: "Listo para demo", tone: "ok" as const,
  },
];

const STEPS = [
  { n: 1, label: "Upload data", state: "done" as const, to: "/admin/upload",
    desc: "Sube un Excel o CSV con precios, fuentes o señales de reseñas." },
  { n: 2, label: "Review source", state: "done" as const, to: "/admin/pricing-sources",
    desc: "Verifica el origen, tipo y URL del dato bruto." },
  { n: 3, label: "Extract components", state: "doing" as const, to: "/admin/normalize-prices",
    desc: "Identifica medicación, ICSI, transferencia, vitrificación, PGT-A." },
  { n: 4, label: "Normalize price", state: "todo" as const, to: "/admin/normalize-prices",
    desc: "Calcula rango básico, premium y garantía con score de confianza." },
  { n: 5, label: "Preview patient view", state: "todo" as const, to: "/admin/patient-preview",
    desc: "Confirma que la explicación al paciente es clara y honesta." },
  { n: 6, label: "Publish", state: "todo" as const, to: "/admin/normalize-prices",
    desc: "Pasa el precio a estado Publicado. Solo entonces lo ven los pacientes." },
];

const toneCls = {
  ok: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  warn: "bg-amber-500/10 text-amber-700 border-amber-200",
  muted: "bg-muted text-muted-foreground border-border",
};

const stateIcon = {
  done: <CheckCircle2 className="size-5 text-emerald-600" />,
  doing: <Clock className="size-5 text-amber-600" />,
  todo: <Circle className="size-5 text-muted-foreground" />,
};

const AdminMvp = () => {
  return (
    <AdminShell
      title="Admin Command Center"
      subtitle="Manage pricing data, clinic sources, normalization and patient-facing publication."
    >
      {/* Workflow stepper */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pricing normalization workflow</CardTitle>
          <CardDescription>De dato bruto a precio publicado al paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="border rounded-lg p-3 flex gap-3 bg-background">
                <div className="shrink-0 flex flex-col items-center">
                  {stateIcon[s.state]}
                  {s.n < STEPS.length && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">Step {s.n}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">{s.state}</Badge>
                  </div>
                  <div className="font-semibold text-sm mt-0.5">{s.label}</div>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                  <Button asChild size="sm" variant="ghost" className="h-7 px-2 mt-1 -ml-2">
                    <Link to={s.to}>Open <ArrowRight className="size-3" /></Link>
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <Card key={c.to} className="hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="size-10 grid place-items-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="size-5" />
                </div>
                <Badge variant="outline" className={toneCls[c.tone]}>{c.status}</Badge>
              </div>
              <CardTitle className="text-base mt-3">{c.title}</CardTitle>
              <CardDescription>{c.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link to={c.to}>Open <ArrowRight className="size-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
};

export default AdminMvp;
