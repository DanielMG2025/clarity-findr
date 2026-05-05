import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Calculator, ArrowRight, Info, Upload } from "lucide-react";
import { ReviewedClinicPricing } from "@/modules/pricing-configurator/components/ReviewedClinicPricing";

/**
 * Embeddable widget — "Calculadora de coste real de FIV en Madrid".
 * Designed to be loaded in an iframe by partner sites.
 *
 * Tracking: posts events to parent window via postMessage.
 *   { source: "fertility-compass", event: "widget_start" | "widget_complete" | "cta_click", payload }
 */

type Scenario = { key: string; label: string; min: number; max: number; tone: string; desc: string };

function buildScenarios(age: number, includeMeds: boolean, includeIcsi: boolean, includePgt: boolean) {
  const ageMult = age < 35 ? 1 : age < 38 ? 1.05 : age < 41 ? 1.12 : 1.18;
  const base: [number, number] = [4800, 6900];
  const meds: [number, number] = includeMeds ? [1300, 2600] : [0, 0];
  const icsi: [number, number] = includeIcsi ? [900, 1500] : [0, 0];
  const pgt: [number, number] = includePgt ? [2200, 4000] : [0, 0];

  const sumMin = (base[0] + meds[0] + icsi[0] + pgt[0]) * ageMult;
  const sumMax = (base[1] + meds[1] + icsi[1] + pgt[1]) * ageMult;
  const r = (n: number) => Math.round(n / 50) * 50;

  return [
    {
      key: "basic",
      label: "Básico",
      min: r(base[0] * ageMult + meds[0] * ageMult),
      max: r(base[1] * ageMult + meds[1] * ageMult),
      tone: "border-emerald-200 bg-emerald-500/5",
      desc: "Ciclo simple sin extras opcionales.",
    },
    {
      key: "premium",
      label: "Premium",
      min: r(sumMin),
      max: r(sumMax),
      tone: "border-blue-200 bg-blue-500/5",
      desc: "Con técnicas avanzadas (ICSI, PGT-A) y vitrificación.",
    },
    {
      key: "guarantee",
      label: "Garantía",
      min: r(sumMin * 1.6),
      max: r(sumMax * 1.85),
      tone: "border-violet-200 bg-violet-500/5",
      desc: "Programa multi-ciclo con reembolso parcial si no hay embarazo.",
    },
  ] satisfies Scenario[];
}

const fmt = (n: number) => `€${n.toLocaleString("es-ES")}`;

function emit(event: string, payload?: Record<string, unknown>) {
  try {
    window.parent?.postMessage(
      { source: "fertility-compass", event, payload: payload ?? {} },
      "*",
    );
  } catch {
    /* noop */
  }
}

export default function WidgetFivMadrid() {
  const [params] = useSearchParams();
  const partner = params.get("partner") ?? "direct";

  const [age, setAge] = useState<number>(35);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeIcsi, setIncludeIcsi] = useState(true);
  const [includePgt, setIncludePgt] = useState(false);
  const [email, setEmail] = useState("");
  const startedRef = useRef(false);

  const scenarios = buildScenarios(age, includeMeds, includeIcsi, includePgt);
  const completion = 30 + (includeMeds ? 15 : 0) + (includeIcsi ? 15 : 0) + (includePgt ? 10 : 0) + 10;

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      emit("widget_start", { partner, widget: "fiv-madrid" });
    }
  }, [partner]);

  // Resize iframe parent
  useEffect(() => {
    const post = () => emit("resize", { height: document.documentElement.scrollHeight });
    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  const handleCta = (cta: string) => {
    emit("cta_click", { partner, cta, age, includeMeds, includeIcsi, includePgt });
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    emit("widget_complete", { partner, email, age, scenarios });
    handleCta("request_contact");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 gap-1">
            <ShieldCheck className="size-3.5" /> Datos revisados
          </Badge>
          <Badge variant="outline">FIV · Madrid</Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Calculadora de coste real de FIV en Madrid
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Estima cuánto puede costar realmente un ciclo de FIV: precio base, medicación, técnicas adicionales
          y programas de garantía. Datos normalizados a partir de fuentes públicas y revisadas.
        </p>
      </header>

      {/* Configurator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base inline-flex items-center gap-2">
            <Calculator className="size-4 text-primary" /> Tu situación
          </CardTitle>
          <CardDescription>Ajusta para personalizar la estimación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs">Edad: <b>{age}</b></Label>
              <Slider min={25} max={45} step={1} value={[age]} onValueChange={([v]) => setAge(v)} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tratamiento</Label>
              <Select defaultValue="ivf">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ivf">FIV / ICSI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-2">
            {[
              { k: "meds", label: "Incluir medicación", v: includeMeds, set: setIncludeMeds },
              { k: "icsi", label: "Incluir ICSI", v: includeIcsi, set: setIncludeIcsi },
              { k: "pgt", label: "Incluir PGT-A", v: includePgt, set: setIncludePgt },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => o.set(!o.v)}
                className={`text-left rounded-lg border p-3 text-sm transition-colors ${
                  o.v ? "border-primary bg-primary-soft/40" : "hover:border-primary/40"
                }`}
              >
                <div className="font-medium">{o.label}</div>
                <div className="text-xs text-muted-foreground">{o.v ? "Incluido" : "Excluido"}</div>
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Profundidad de tu perfil</span>
              <b>{completion}%</b>
            </div>
            <Progress value={completion} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Scenarios */}
      <div className="grid md:grid-cols-3 gap-3">
        {scenarios.map((s) => (
          <Card key={s.key} className={`border-2 ${s.tone}`}>
            <CardContent className="p-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="text-xl font-bold tabular-nums">
                {fmt(s.min)}–{fmt(s.max)}
              </div>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Why normalized differs */}
      <div className="rounded-lg border bg-muted/30 p-4 text-sm flex items-start gap-2">
        <Info className="size-4 mt-0.5 shrink-0 text-primary" />
        <p>
          El precio publicado por la clínica suele ser un <b>"desde"</b> que no incluye medicación, ICSI,
          PGT-A, vitrificación o anestesia. Este rango normaliza esos componentes para que puedas comparar
          con la misma base.
        </p>
      </div>

      {/* Reviewed clinics block (reuses existing component) */}
      <ReviewedClinicPricing />

      {/* Lead CTA */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary-soft/40 to-accent-soft/30">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold text-lg">¿Quieres que te ayudemos a comparar clínicas?</h3>
          <p className="text-sm text-muted-foreground">
            Te enviamos un informe personalizado con clínicas que encajan con tu rango y tu caso. Sin
            compromiso.
          </p>
          <form onSubmit={handleLeadSubmit} className="flex flex-wrap gap-2">
            <Input
              type="email"
              required
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-[220px]"
            />
            <Button type="submit" className="gap-1.5">
              Recibir informe <ArrowRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={() => handleCta("upload_quote")}
            >
              <Upload className="size-4" /> Subir mi presupuesto
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground">
            Al enviar aceptas que Fertility Compass procese tus datos para enviarte el informe. Puedes darte
            de baja en cualquier momento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
