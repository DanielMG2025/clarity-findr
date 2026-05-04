import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Building2, FileSearch, Star, CheckCircle2, AlertTriangle,
  ExternalLink, ArrowLeft, Upload, FilePlus2, Send, EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { KpiCard, SectionHeader } from "@/components/admin/AdminShared";

// ----------------- Types & mock data -----------------

type Status = "discovered" | "review" | "ready" | "imported" | "needs_manual";

type Candidate = {
  id: string;
  name: string;
  country: string;
  city: string;
  pricingDepth: number; // 0-100
  treatments: string[];
  officialPricingUrl: string;
  reviewSignal: "strong" | "medium" | "weak";
  status: Status;
  pricingSummary: { label: string; value: string }[];
  included: string[];
  excluded: string[];
  reviews: { source: string; rating?: number; count?: number; note?: string }[];
  notes: string;
};

const CANDIDATES: Candidate[] = [
  {
    id: "ivi-barcelona",
    name: "IVI Barcelona",
    country: "ES",
    city: "Barcelona",
    pricingDepth: 88,
    treatments: ["FIV", "ICSI", "Ovodonación", "Vitrificación"],
    officialPricingUrl: "https://ivi.es/precios/barcelona",
    reviewSignal: "strong",
    status: "ready",
    pricingSummary: [
      { label: "FIV base", value: "€4.900" },
      { label: "ICSI add-on", value: "€600" },
      { label: "Ovodonación", value: "€8.900" },
    ],
    included: ["Estimulación", "Punción", "Laboratorio", "Transferencia"],
    excluded: ["Medicación", "PGT-A", "Vitrificación de excedentes"],
    reviews: [
      { source: "Google", rating: 4.5, count: 1820 },
      { source: "Trustpilot", rating: 4.1, count: 230 },
      { source: "FindBestClinic", rating: 4.3, count: 88 },
    ],
    notes: "Pricing claro por tratamiento, posible diferencia con clínica física.",
  },
  {
    id: "eugin-madrid",
    name: "Eugin Madrid",
    country: "ES",
    city: "Madrid",
    pricingDepth: 72,
    treatments: ["FIV", "Ovodonación", "IA"],
    officialPricingUrl: "https://eugin.es/precios",
    reviewSignal: "strong",
    status: "review",
    pricingSummary: [
      { label: "FIV", value: "€4.500–5.200" },
      { label: "Ovodonación", value: "€7.900" },
    ],
    included: ["Estimulación", "Laboratorio"],
    excluded: ["Medicación", "ICSI"],
    reviews: [
      { source: "Google", rating: 4.4, count: 980 },
      { source: "Birdeye", rating: 4.2, count: 145 },
    ],
    notes: "Falta detalle sobre PGT-A y criopreservación.",
  },
  {
    id: "gennet-prague",
    name: "GENNET Prague",
    country: "CZ",
    city: "Praga",
    pricingDepth: 81,
    treatments: ["FIV", "ICSI", "PGT-A", "Ovodonación"],
    officialPricingUrl: "https://gennet.cz/en/pricelist",
    reviewSignal: "medium",
    status: "discovered",
    pricingSummary: [
      { label: "FIV", value: "€2.800" },
      { label: "Ovodonación", value: "€5.400" },
    ],
    included: ["Estimulación", "Punción", "Laboratorio", "ICSI opcional"],
    excluded: ["Medicación", "Anestesia"],
    reviews: [
      { source: "Google", rating: 4.6, count: 540 },
      { source: "Trustpilot", count: 0, note: "Sin reseñas" },
    ],
    notes: "Pricelist oficial en EN, muy granular.",
  },
  {
    id: "newlife-tbilisi",
    name: "New Life Georgia",
    country: "GE",
    city: "Tbilisi",
    pricingDepth: 45,
    treatments: ["FIV", "Ovodonación", "Subrogación"],
    officialPricingUrl: "https://newlifegeorgia.com/prices",
    reviewSignal: "weak",
    status: "needs_manual",
    pricingSummary: [
      { label: "FIV paquete", value: "€3.500" },
    ],
    included: ["Paquete cerrado"],
    excluded: ["Detalle de componentes no publicado"],
    reviews: [
      { source: "Google", rating: 4.0, count: 90 },
    ],
    notes: "Precio agregado, requiere dossier para normalización.",
  },
  {
    id: "reprofit-brno",
    name: "ReproFit Brno",
    country: "CZ",
    city: "Brno",
    pricingDepth: 78,
    treatments: ["FIV", "ICSI", "Ovodonación", "PGT-A"],
    officialPricingUrl: "https://reprofit.cz/en/price-list",
    reviewSignal: "strong",
    status: "ready",
    pricingSummary: [
      { label: "FIV", value: "€2.450" },
      { label: "Ovodonación", value: "€5.200" },
    ],
    included: ["Estimulación", "Punción", "Laboratorio"],
    excluded: ["Medicación", "PGT-A"],
    reviews: [
      { source: "Google", rating: 4.7, count: 720 },
      { source: "Trustpilot", rating: 4.5, count: 310 },
    ],
    notes: "Una de las clínicas con mejor señal de reviews en CZ.",
  },
  {
    id: "instituto-bernabeu-alicante",
    name: "Instituto Bernabeu",
    country: "ES",
    city: "Alicante",
    pricingDepth: 60,
    treatments: ["FIV", "ICSI", "Ovodonación"],
    officialPricingUrl: "https://institutobernabeu.com/precios",
    reviewSignal: "medium",
    status: "review",
    pricingSummary: [{ label: "FIV", value: "Bajo solicitud" }],
    included: [],
    excluded: ["Pricing público parcial"],
    reviews: [
      { source: "Google", rating: 4.3, count: 410 },
      { source: "FindBestClinic", rating: 4.0, count: 22 },
    ],
    notes: "Requiere benchmark externo + dossier.",
  },
];

// ----------------- Helpers -----------------

const statusMeta: Record<Status, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  discovered:    { label: "Descubierta",        variant: "outline" },
  review:        { label: "En revisión",        variant: "secondary" },
  ready:         { label: "Lista para importar", variant: "default" },
  imported:      { label: "Importada",          variant: "default" },
  needs_manual:  { label: "Revisión manual",    variant: "destructive" },
};

const signalMeta: Record<Candidate["reviewSignal"], { label: string; cls: string }> = {
  strong: { label: "Señal fuerte",   cls: "text-emerald-600" },
  medium: { label: "Señal media",    cls: "text-amber-600" },
  weak:   { label: "Señal débil",    cls: "text-muted-foreground" },
};

// ----------------- Detail view -----------------

function CandidateDetail({ c, onBack }: { c: Candidate; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Volver al listado
        </Button>
        <Badge variant="outline" className="gap-1.5">
          <EyeOff className="size-3" /> No visible para pacientes hasta aprobación
        </Badge>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">{c.name}</h2>
            <p className="text-sm text-muted-foreground">
              {c.city} · {c.country}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusMeta[c.status].variant}>{statusMeta[c.status].label}</Badge>
            <span className={`text-xs font-medium ${signalMeta[c.reviewSignal].cls}`}>
              {signalMeta[c.reviewSignal].label}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">Fuente oficial de precios</h3>
          <a
            href={c.officialPricingUrl}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
          >
            {c.officialPricingUrl} <ExternalLink className="size-3.5" />
          </a>

          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-2">Resumen de precios</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {c.pricingSummary.map((p) => (
                <div key={p.label} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-semibold tabular-nums">{p.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 text-emerald-700">Incluye</h4>
              {c.included.length ? (
                <ul className="text-sm space-y-1">
                  {c.included.map((i) => <li key={i}>· {i}</li>)}
                </ul>
              ) : <p className="text-xs text-muted-foreground">Sin detalle público.</p>}
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 text-amber-700">Puede no incluir</h4>
              {c.excluded.length ? (
                <ul className="text-sm space-y-1">
                  {c.excluded.map((i) => <li key={i}>· {i}</li>)}
                </ul>
              ) : <p className="text-xs text-muted-foreground">—</p>}
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-2">Tratamientos detectados</h4>
            <div className="flex flex-wrap gap-1.5">
              {c.treatments.map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-3">Señales de reviews</h3>
          <div className="space-y-2">
            {c.reviews.map((r) => (
              <div key={r.source} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span className="text-muted-foreground">{r.source}</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {r.rating ? (
                    <>
                      <Star className="size-3.5 text-amber-500 fill-amber-500" />
                      {r.rating} {r.count ? <span className="text-xs text-muted-foreground">({r.count})</span> : null}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">{r.note ?? "—"}</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-1">Notas internas</h4>
            <p className="text-sm text-muted-foreground">{c.notes}</p>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Workflow de importación</h3>
        <div className="flex flex-wrap gap-2">
          <Button className="gap-2"><Upload className="size-4" /> Importar clínica</Button>
          <Button variant="outline" className="gap-2"><FilePlus2 className="size-4" /> Crear fuente de precios</Button>
          <Button variant="outline" asChild className="gap-2">
            <Link to="/admin/pricing"><Send className="size-4" /> Enviar a extraction review</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Toda clínica importada queda en estado borrador. No será visible para pacientes hasta su aprobación final.
        </p>
      </Card>
    </div>
  );
}

// ----------------- Main page -----------------

export default function AdminClinicDiscovery() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CANDIDATES;
    return CANDIDATES.filter((c) =>
      [c.name, c.country, c.city].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  const stats = useMemo(() => ({
    discovered: CANDIDATES.length,
    highPricing: CANDIDATES.filter((c) => c.pricingDepth >= 75).length,
    strongReview: CANDIDATES.filter((c) => c.reviewSignal === "strong").length,
    ready: CANDIDATES.filter((c) => c.status === "ready").length,
    manual: CANDIDATES.filter((c) => c.status === "needs_manual").length,
  }), []);

  if (selected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <CandidateDetail c={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">European Clinic Discovery</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Pipeline interno para descubrir, revisar e importar clínicas europeas con
            pricing detallado y señales de reseñas verificables.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <EyeOff className="size-3" /> No visible para pacientes hasta aprobación
        </Badge>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Descubiertas"  value={stats.discovered}  icon={<Building2 className="size-5" />} />
        <KpiCard label="Pricing detallado" value={stats.highPricing} icon={<FileSearch className="size-5" />} accent="accent" />
        <KpiCard label="Reviews fuertes"  value={stats.strongReview} icon={<Star className="size-5" />} accent="accent" />
        <KpiCard label="Listas importar"  value={stats.ready}     icon={<CheckCircle2 className="size-5" />} />
        <KpiCard label="Revisión manual"  value={stats.manual}    icon={<AlertTriangle className="size-5" />} accent="warning" />
      </div>

      <Card className="p-5">
        <SectionHeader
          title="Candidatas"
          description="Listado de clínicas detectadas en fuentes públicas europeas. Revisa la profundidad de pricing y la señal de reviews antes de importar."
          right={
            <div className="relative w-72 max-w-full">
              <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por clínica, ciudad o país"
                className="pl-8"
              />
            </div>
          }
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clínica</TableHead>
                <TableHead>País / ciudad</TableHead>
                <TableHead>Pricing depth</TableHead>
                <TableHead>Tratamientos</TableHead>
                <TableHead>Fuente oficial</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.country} · {c.city}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <Progress value={c.pricingDepth} className="h-2" />
                      <span className="text-xs tabular-nums w-8 text-right">{c.pricingDepth}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.treatments.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                      {c.treatments.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{c.treatments.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={c.officialPricingUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Ver <ExternalLink className="size-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${signalMeta[c.reviewSignal].cls}`}>
                      {signalMeta[c.reviewSignal].label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMeta[c.status].variant}>{statusMeta[c.status].label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setSelected(c)}>Review</Button>
                      <Button size="sm" onClick={() => setSelected(c)} className="gap-1.5">
                        <Upload className="size-3.5" /> Import
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
