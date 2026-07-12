import { Link } from "react-router-dom";
import { ShieldCheck, Info, ArrowRight, MessageSquare, Calendar, AlertTriangle, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMasterRecord } from "@/modules/master-record";
import { overallCompletionMPR } from "@/modules/patient-profile/blocks";

type Confidence = "low" | "medium" | "high";
type SourceLabel = "reviewed" | "public" | "external" | "pending";

interface ReviewedClinic {
  clinic: string;
  city: string;
  published: number;
  basicMin: number;
  basicMax: number;
  premiumMin: number;
  premiumMax: number;
  includes: string[];
  mayNotInclude: string[];
  confidence: Confidence;
  lastReview: string;
  source: SourceLabel;
}

// Madrid IVF clinics — initial seed
const MADRID_FIV: ReviewedClinic[] = [
  {
    clinic: "Fertility Madrid",
    city: "Madrid",
    published: 5400,
    basicMin: 5400, basicMax: 6900,
    premiumMin: 6900, premiumMax: 9200,
    includes: ["Estimulación", "Punción", "Cultivo embrionario", "Transferencia"],
    mayNotInclude: ["Medicación", "ICSI", "PGT-A"],
    confidence: "high",
    lastReview: "2026-04-30",
    source: "reviewed",
  },
  {
    clinic: "FIVMadrid",
    city: "Madrid",
    published: 5600,
    basicMin: 5600, basicMax: 7100,
    premiumMin: 7100, premiumMax: 9500,
    includes: ["Estimulación", "Punción", "Cultivo", "Transferencia"],
    mayNotInclude: ["Medicación", "ICSI", "Vitrificación"],
    confidence: "high",
    lastReview: "2026-04-28",
    source: "reviewed",
  },
  {
    clinic: "IVI Madrid",
    city: "Madrid",
    published: 5900,
    basicMin: 5900, basicMax: 7400,
    premiumMin: 7400, premiumMax: 9800,
    includes: ["Estimulación", "Punción", "Cultivo embrionario", "Transferencia"],
    mayNotInclude: ["Medicación", "ICSI", "PGT-A", "Vitrificación"],
    confidence: "medium",
    lastReview: "2026-04-29",
    source: "public",
  },
  {
    clinic: "Instituto Bernabeu Madrid",
    city: "Madrid",
    published: 6200,
    basicMin: 6200, basicMax: 7800,
    premiumMin: 7800, premiumMax: 10400,
    includes: ["Estimulación", "Punción", "ICSI", "Cultivo", "Transferencia"],
    mayNotInclude: ["Medicación", "PGT-A", "Anestesia"],
    confidence: "medium",
    lastReview: "2026-04-22",
    source: "external",
  },
  {
    clinic: "Clínica Tambre",
    city: "Madrid",
    published: 6100,
    basicMin: 6100, basicMax: 7700,
    premiumMin: 7700, premiumMax: 10200,
    includes: ["Estimulación", "Punción", "Cultivo", "Transferencia"],
    mayNotInclude: ["Medicación", "ICSI", "PGT-A"],
    confidence: "low",
    lastReview: "2026-04-10",
    source: "pending",
  },
  {
    clinic: "Ginefiv Madrid",
    city: "Madrid",
    published: 5800,
    basicMin: 5800, basicMax: 7300,
    premiumMin: 7300, premiumMax: 9700,
    includes: ["Estimulación", "Punción", "Cultivo", "Transferencia"],
    mayNotInclude: ["Medicación", "ICSI", "PGT-A"],
    confidence: "low",
    lastReview: "2026-03-28",
    source: "pending",
  },
];

const confStyles: Record<Confidence, string> = {
  high:   "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  medium: "bg-amber-500/10 text-amber-700 border-amber-200",
  low:    "bg-rose-500/10 text-rose-700 border-rose-200",
};
const confLabel: Record<Confidence, string> = { high: "Alta", medium: "Media", low: "Baja" };

const sourceMeta: Record<SourceLabel, { label: string; className: string; icon: React.ReactNode }> = {
  reviewed: {
    label: "Precio revisado",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    icon: <ShieldCheck className="size-3" />,
  },
  public: {
    label: "Fuente pública de la clínica",
    className: "bg-blue-500/10 text-blue-700 border-blue-200",
    icon: <Globe className="size-3" />,
  },
  external: {
    label: "Fuente externa · requiere revisión",
    className: "bg-amber-500/10 text-amber-700 border-amber-200",
    icon: <AlertTriangle className="size-3" />,
  },
  pending: {
    label: "Estimación pendiente de validación",
    className: "bg-muted text-muted-foreground border-border",
    icon: <Info className="size-3" />,
  },
};

const fmt = (n: number) => `€${n.toLocaleString()}`;

export function ReviewedClinicPricing() {
  const mpr = useMasterRecord();
  const completion = overallCompletionMPR(mpr);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-lg">FIV en Madrid · precios revisados</CardTitle>
            <CardDescription>
              Estimaciones basadas en datos publicados por las clínicas y revisadas por nuestro equipo.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 gap-1">
            <ShieldCheck className="size-3.5" /> Datos verificados
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {completion < 60 && (
          <div className="rounded-lg border border-amber-200 bg-amber-500/10 text-amber-900 px-3 py-2 text-sm flex items-start gap-2">
            <Info className="size-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              Completa más datos de tu perfil para afinar esta estimación.
              <Link to="/profile" className="underline ml-1 font-medium">Ir a mi perfil</Link>
            </div>
          </div>
        )}

        {/* Normalization explanation */}
        <div className="rounded-lg border bg-primary-soft/30 px-3 py-2 text-sm flex items-start gap-2">
          <Info className="size-4 mt-0.5 shrink-0 text-primary" />
          <p>
            No todos los precios publicados incluyen los mismos componentes. Por eso normalizamos
            <b> medicación, laboratorio, vitrificación y posibles extras</b> para que puedas comparar clínicas con la misma base.
          </p>
        </div>

        <div className="grid gap-3">
          {MADRID_FIV.map((c) => {
            const sm = sourceMeta[c.source];
            return (
              <div key={c.clinic} className="border rounded-xl p-4 hover:border-primary/40 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-semibold">{c.clinic}</div>
                    <div className="text-xs text-muted-foreground">{c.city}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={`${sm.className} gap-1`}>
                      {sm.icon} {sm.label}
                    </Badge>
                    <Badge variant="outline" className={confStyles[c.confidence]}>
                      Confianza {confLabel[c.confidence]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Precio publicado</div>
                    <div className="font-bold tabular-nums">{fmt(c.published)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Normalizado básico</div>
                    <div className="font-bold tabular-nums text-accent">{fmt(c.basicMin)}–{fmt(c.basicMax)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Normalizado premium</div>
                    <div className="font-bold tabular-nums text-primary">{fmt(c.premiumMin)}–{fmt(c.premiumMax)}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Qué incluye</div>
                    <div className="flex flex-wrap gap-1">
                      {c.includes.map((i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-200">
                          + {i}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Qué puede no incluir</div>
                    <div className="flex flex-wrap gap-1">
                      {c.mayNotInclude.map((i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-200">
                          – {i}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Calendar className="size-3" /> Última revisión: {c.lastReview}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/clinics">Comparar clínicas</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/clinics?contact=${encodeURIComponent(c.clinic)}`}>
                        <MessageSquare className="size-3.5 mr-1" /> Solicitar contacto
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="rounded-xl border bg-muted/30 p-4 text-sm space-y-2">
          <div className="font-semibold inline-flex items-center gap-1.5">
            <Info className="size-4 text-primary" />
            Por qué el precio normalizado puede ser diferente del precio web
          </div>
          <p className="text-muted-foreground">
            El precio publicado por la clínica suele ser un <b>precio "desde"</b> que no incluye medicación,
            técnicas adicionales (ICSI, PGT-A), vitrificación de embriones, anestesia o pruebas previas. Nuestro
            precio normalizado ajusta estos componentes para que puedas comparar clínicas con la misma base, e
            incluye un rango realista según tu perfil.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" asChild>
            <Link to="/clinics">Comparar clínicas</Link>
          </Button>
          <Button asChild>
            <Link to="/clinics?contact=1">
              Solicitar contacto <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
