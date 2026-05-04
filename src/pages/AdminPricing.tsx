import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Link as LinkIcon,
  Plus,
  ShieldCheck,
  Upload,
  Wand2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

/* ----------------------------- Mock data ----------------------------- */

type SourceStatus = "pending" | "extracted" | "in_review" | "approved" | "rejected";
type Confidence = "low" | "medium" | "high";
type SourceType = "official" | "benchmark" | "inferred" | "pending_dossier";

interface PricingSource {
  id: string;
  clinic: string;
  treatment: string;
  type: "Clinic website" | "PDF brochure" | "Patient quote" | "Email" | "Phone";
  sourceType: SourceType;
  confidenceScore: number; // 0-100
  normalizationRule: string;
  url?: string;
  status: SourceStatus;
  confidence: Confidence;
  updatedAt: string;
  rawText?: string;
  extracted?: {
    treatment: string;
    publishedPrice: number;
    components: { label: string; price: number; included: boolean }[];
    minPrice: number;
    maxPrice: number;
    notes: string;
  };
}

interface PatientQuote {
  id: string;
  clinic: string;
  treatment: string;
  totalPrice: number;
  breakdown: { label: string; price: number }[];
  consent: boolean;
  verified: boolean;
  submittedAt: string;
}

interface GuaranteeProgram {
  id: string;
  clinic: string;
  cycles: number;
  priceMin: number;
  priceMax: number;
  refundPolicy: string;
  eligibility: string;
  medicationIncluded: boolean;
}

const initialSources: PricingSource[] = [
  {
    id: "src_01",
    clinic: "IVI Madrid",
    treatment: "IVF",
    type: "Clinic website",
    sourceType: "official",
    confidenceScore: 88,
    normalizationRule: "base + medicación + ICSI (obligatorio si edad>35)",
    url: "https://ivi.es/precios",
    status: "extracted",
    confidence: "high",
    updatedAt: "2026-04-29",
    rawText:
      "IVF cycle from €5,900 including ovarian stimulation monitoring, egg retrieval, ICSI when needed, embryo culture and single embryo transfer. Medication not included (estimated €1,200–€1,800).",
    extracted: {
      treatment: "IVF",
      publishedPrice: 5900,
      components: [
        { label: "Stimulation monitoring", price: 800, included: true },
        { label: "Egg retrieval", price: 1800, included: true },
        { label: "ICSI", price: 900, included: true },
        { label: "Embryo culture", price: 700, included: true },
        { label: "Embryo transfer", price: 1700, included: true },
        { label: "Medication", price: 1500, included: false },
        { label: "PGT-A", price: 2400, included: false },
      ],
      minPrice: 5900,
      maxPrice: 8200,
      notes: "Medication explicitly excluded. PGT-A optional add-on.",
    },
  },
  {
    id: "src_02",
    clinic: "Clínica Eugin",
    treatment: "Egg donation",
    type: "PDF brochure",
    sourceType: "pending_dossier",
    confidenceScore: 35,
    normalizationRule: "pendiente — falta dossier 2026",
    url: "eugin-prices-2026.pdf",
    status: "pending",
    confidence: "low",
    updatedAt: "2026-05-01",
    rawText: "Pendiente de recepción del dossier oficial 2026.",
  },
  {
    id: "src_03",
    clinic: "Vida Fertility",
    treatment: "ICSI",
    type: "Patient quote",
    sourceType: "inferred",
    confidenceScore: 58,
    normalizationRule: "media de 3 presupuestos pacientes + ajuste medicación",
    status: "in_review",
    confidence: "medium",
    updatedAt: "2026-05-02",
    rawText: "Inferido a partir de 3 presupuestos de pacientes (rango €6.800–€8.200).",
  },
  {
    id: "src_04",
    clinic: "Instituto Bernabeu",
    treatment: "IVF",
    type: "Clinic website",
    sourceType: "benchmark",
    confidenceScore: 72,
    normalizationRule: "benchmark sector Madrid + componentes declarados",
    url: "https://institutobernabeu.com",
    status: "approved",
    confidence: "high",
    updatedAt: "2026-04-22",
    rawText: "Comparado con benchmark sector privado Madrid (n=8 clínicas).",
  },
];

const initialQuotes: PatientQuote[] = [
  {
    id: "q_01",
    clinic: "IVI Barcelona",
    treatment: "IVF",
    totalPrice: 7400,
    breakdown: [
      { label: "Base cycle", price: 5500 },
      { label: "Medication", price: 1500 },
      { label: "Anesthesia", price: 400 },
    ],
    consent: true,
    verified: false,
    submittedAt: "2026-05-03",
  },
  {
    id: "q_02",
    clinic: "Eugin Madrid",
    treatment: "Egg donation",
    totalPrice: 9200,
    breakdown: [
      { label: "Donor program", price: 7800 },
      { label: "Medication", price: 1400 },
    ],
    consent: true,
    verified: true,
    submittedAt: "2026-05-01",
  },
];

const initialGuarantees: GuaranteeProgram[] = [
  {
    id: "g_01",
    clinic: "IVI",
    cycles: 3,
    priceMin: 14500,
    priceMax: 18000,
    refundPolicy: "70% refund if no live birth after 3 cycles",
    eligibility: "Women under 38 with AMH > 1.2",
    medicationIncluded: false,
  },
  {
    id: "g_02",
    clinic: "Vida Fertility",
    cycles: 2,
    priceMin: 12000,
    priceMax: 15000,
    refundPolicy: "100% refund if no euploid embryo",
    eligibility: "PGT-A required, age < 40",
    medicationIncluded: true,
  },
];

/* ----------------------------- Helpers ----------------------------- */

const statusVariant: Record<SourceStatus, { label: string; className: string }> = {
  pending:   { label: "Pending",     className: "bg-amber-500/10 text-amber-700 border-amber-200" },
  extracted: { label: "Extracted",   className: "bg-blue-500/10 text-blue-700 border-blue-200" },
  in_review: { label: "In review",   className: "bg-violet-500/10 text-violet-700 border-violet-200" },
  approved:  { label: "Published",   className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  rejected:  { label: "Rejected",    className: "bg-rose-500/10 text-rose-700 border-rose-200" },
};

const confidenceVariant: Record<Confidence, string> = {
  low:    "bg-rose-500/10 text-rose-700 border-rose-200",
  medium: "bg-amber-500/10 text-amber-700 border-amber-200",
  high:   "bg-emerald-500/10 text-emerald-700 border-emerald-200",
};

function StatusBadge({ status }: { status: SourceStatus }) {
  const v = statusVariant[status];
  return <Badge variant="outline" className={v.className}>{v.label}</Badge>;
}

function ConfidenceBadge({ value }: { value: Confidence }) {
  return (
    <Badge variant="outline" className={confidenceVariant[value]}>
      {value} confidence
    </Badge>
  );
}

const sourceTypeMeta: Record<SourceType, { label: string; className: string }> = {
  official:        { label: "Fuente oficial",   className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  benchmark:       { label: "Benchmark externo", className: "bg-blue-500/10 text-blue-700 border-blue-200" },
  inferred:        { label: "Inferido",          className: "bg-violet-500/10 text-violet-700 border-violet-200" },
  pending_dossier: { label: "Pendiente dossier", className: "bg-amber-500/10 text-amber-700 border-amber-200" },
};

function SourceTypeBadge({ value }: { value: SourceType }) {
  const m = sourceTypeMeta[value];
  return <Badge variant="outline" className={m.className}>{m.label}</Badge>;
}

function ConfidenceScore({ value }: { value: number }) {
  const tone = value >= 75 ? "text-emerald-700" : value >= 50 ? "text-amber-700" : "text-rose-700";
  const bar = value >= 75 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${bar}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${tone}`}>{value}%</span>
    </div>
  );
}

/* ----------------------------- Page ----------------------------- */

export default function AdminPricing() {
  const [sources, setSources] = useState<PricingSource[]>(initialSources);
  const [quotes, setQuotes] = useState<PatientQuote[]>(initialQuotes);
  const [guarantees, setGuarantees] = useState<GuaranteeProgram[]>(initialGuarantees);
  const [selectedId, setSelectedId] = useState<string>(initialSources[0].id);
  const selected = useMemo(
    () => sources.find((s) => s.id === selectedId) ?? sources[0],
    [sources, selectedId],
  );

  const stats = useMemo(() => {
    const pendingSources = sources.filter((s) => s.status === "pending").length;
    const pendingQuotes = quotes.filter((q) => !q.verified).length;
    const inReview = sources.filter((s) => s.status === "in_review" || s.status === "extracted").length;
    const published = sources.filter((s) => s.status === "approved").length;
    const conf = { low: 0, medium: 0, high: 0 };
    sources.forEach((s) => { conf[s.confidence]++; });
    return { pendingSources, pendingQuotes, inReview, published, conf };
  }, [sources, quotes]);

  function updateSource(id: string, patch: Partial<PricingSource>) {
    setSources((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function updateExtracted(id: string, patch: Partial<NonNullable<PricingSource["extracted"]>>) {
    setSources((arr) =>
      arr.map((s) =>
        s.id === id && s.extracted ? { ...s, extracted: { ...s.extracted, ...patch } } : s,
      ),
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
            <ShieldCheck className="size-3.5" />
            Internal · Admin
          </div>
          <h1 className="text-2xl font-bold mt-1">Pricing Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Human-in-the-loop workflow. No price reaches patients without review and approval.
          </p>
        </div>
      </header>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="add">Add source</TabsTrigger>
          <TabsTrigger value="review">Extraction review</TabsTrigger>
          <TabsTrigger value="normalized">Normalized preview</TabsTrigger>
          <TabsTrigger value="quotes">Patient quotes</TabsTrigger>
          <TabsTrigger value="guarantees">Guarantee programs</TabsTrigger>
        </TabsList>

        {/* 1. DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Clock className="size-4" />} label="Pending sources" value={stats.pendingSources} />
            <StatCard icon={<FileText className="size-4" />} label="Pending quotes" value={stats.pendingQuotes} />
            <StatCard icon={<AlertTriangle className="size-4" />} label="Needs review" value={stats.inReview} />
            <StatCard icon={<CheckCircle2 className="size-4" />} label="Published prices" value={stats.published} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confidence distribution</CardTitle>
                <CardDescription>Across all current pricing sources.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(["high","medium","low"] as Confidence[]).map((c) => {
                  const total = sources.length || 1;
                  const pct = Math.round((stats.conf[c] / total) * 100);
                  return (
                    <div key={c}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize">{c}</span>
                        <span className="text-muted-foreground">{stats.conf[c]} · {pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={
                            c === "high" ? "h-full bg-emerald-500"
                            : c === "medium" ? "h-full bg-amber-500"
                            : "h-full bg-rose-500"
                          }
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recently updated clinics</CardTitle>
                <CardDescription>Latest pricing changes in the system.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {[...sources].sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0,5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.clinic}</div>
                      <div className="text-xs text-muted-foreground">{s.treatment} · {s.updatedAt}</div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. SOURCES */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All pricing sources</CardTitle>
              <CardDescription>Origin, status and confidence for every captured price.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.clinic}</TableCell>
                      <TableCell>{s.treatment}</TableCell>
                      <TableCell>{s.type}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                        {s.url ? (
                          <span className="inline-flex items-center gap-1"><LinkIcon className="size-3" />{s.url}</span>
                        ) : "—"}
                      </TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell><ConfidenceBadge value={s.confidence} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.updatedAt}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedId(s.id)}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. ADD SOURCE */}
        <TabsContent value="add">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base">Add a new pricing source</CardTitle>
              <CardDescription>Capture raw inputs. Extraction runs after submit.</CardDescription>
            </CardHeader>
            <CardContent>
              <AddSourceForm
                onCreate={(s) => {
                  setSources((arr) => [s, ...arr]);
                  setSelectedId(s.id);
                  toast({ title: "Source added", description: "Run extraction from the review tab." });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. EXTRACTION REVIEW */}
        <TabsContent value="review" className="space-y-3">
          <div className="flex items-center gap-3">
            <Label className="text-xs text-muted-foreground">Reviewing:</Label>
            <Select value={selected.id} onValueChange={setSelectedId}>
              <SelectTrigger className="w-[320px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.clinic} — {s.treatment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <StatusBadge status={selected.status} />
            <ConfidenceBadge value={selected.confidence} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="size-4" />Original source</CardTitle>
                <CardDescription>{selected.type}{selected.url ? ` · ${selected.url}` : ""}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm bg-muted/40 border rounded-md p-3 min-h-[260px] whitespace-pre-wrap">
                  {selected.rawText ?? "No raw text captured. Upload a file or paste content from the source."}
                </div>
                {!selected.extracted && (
                  <Button
                    className="mt-3 w-full"
                    onClick={() => {
                      updateSource(selected.id, {
                        status: "extracted",
                        confidence: "medium",
                        extracted: {
                          treatment: selected.treatment,
                          publishedPrice: 5500,
                          components: [
                            { label: "Base cycle", price: 4000, included: true },
                            { label: "Anesthesia", price: 400, included: true },
                            { label: "Medication", price: 1500, included: false },
                          ],
                          minPrice: 5500,
                          maxPrice: 7800,
                          notes: "Auto-extracted draft. Review before publishing.",
                        },
                      });
                      toast({ title: "Extraction complete" });
                    }}
                  >
                    <Wand2 className="size-4 mr-1" /> Extract pricing data
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Database className="size-4" />Extracted data</CardTitle>
                <CardDescription>Editable structured output.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected.extracted ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Treatment">
                        <Input
                          value={selected.extracted.treatment}
                          onChange={(e) => updateExtracted(selected.id, { treatment: e.target.value })}
                        />
                      </Field>
                      <Field label="Published price (€)">
                        <Input
                          type="number"
                          value={selected.extracted.publishedPrice}
                          onChange={(e) => updateExtracted(selected.id, { publishedPrice: Number(e.target.value) })}
                        />
                      </Field>
                      <Field label="Min price (€)">
                        <Input
                          type="number"
                          value={selected.extracted.minPrice}
                          onChange={(e) => updateExtracted(selected.id, { minPrice: Number(e.target.value) })}
                        />
                      </Field>
                      <Field label="Max price (€)">
                        <Input
                          type="number"
                          value={selected.extracted.maxPrice}
                          onChange={(e) => updateExtracted(selected.id, { maxPrice: Number(e.target.value) })}
                        />
                      </Field>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Components</Label>
                      <div className="border rounded-md divide-y mt-1">
                        {selected.extracted.components.map((c, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 text-sm">
                            <Input
                              className="col-span-6"
                              value={c.label}
                              onChange={(e) => {
                                const next = [...selected.extracted!.components];
                                next[i] = { ...c, label: e.target.value };
                                updateExtracted(selected.id, { components: next });
                              }}
                            />
                            <Input
                              className="col-span-3"
                              type="number"
                              value={c.price}
                              onChange={(e) => {
                                const next = [...selected.extracted!.components];
                                next[i] = { ...c, price: Number(e.target.value) };
                                updateExtracted(selected.id, { components: next });
                              }}
                            />
                            <Button
                              variant={c.included ? "default" : "outline"}
                              size="sm"
                              className="col-span-3"
                              onClick={() => {
                                const next = [...selected.extracted!.components];
                                next[i] = { ...c, included: !c.included };
                                updateExtracted(selected.id, { components: next });
                              }}
                            >
                              {c.included ? "Included" : "Excluded"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Field label="Notes">
                      <Textarea
                        value={selected.extracted.notes}
                        onChange={(e) => updateExtracted(selected.id, { notes: e.target.value })}
                      />
                    </Field>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Run extraction first to view structured data.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 5. NORMALIZED PREVIEW */}
        <TabsContent value="normalized">
          {selected.extracted ? (
            <NormalizedPreview
              source={selected}
              onApprove={() => {
                updateSource(selected.id, { status: "approved", confidence: "high" });
                toast({ title: "Published", description: `${selected.clinic} — ${selected.treatment}` });
              }}
              onDraft={() => {
                updateSource(selected.id, { status: "in_review" });
                toast({ title: "Saved as draft" });
              }}
              onReject={() => {
                updateSource(selected.id, { status: "rejected" });
                toast({ title: "Rejected", variant: "destructive" });
              }}
            />
          ) : (
            <Card><CardContent className="py-8 text-sm text-muted-foreground text-center">
              Select a source with extracted data to preview the normalization.
            </CardContent></Card>
          )}
        </TabsContent>

        {/* 6. PATIENT QUOTES */}
        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient-submitted quotes</CardTitle>
              <CardDescription>Verify breakdowns before they feed pricing intelligence.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clinic</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead>Total (€)</TableHead>
                    <TableHead>Breakdown</TableHead>
                    <TableHead>Consent</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.clinic}</TableCell>
                      <TableCell>{q.treatment}</TableCell>
                      <TableCell>{q.totalPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {q.breakdown.map((b) => `${b.label}: €${b.price}`).join(" · ")}
                      </TableCell>
                      <TableCell>
                        {q.consent
                          ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Given</Badge>
                          : <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-200">Missing</Badge>}
                      </TableCell>
                      <TableCell>
                        {q.verified
                          ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Verified</Badge>
                          : <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200">Pending</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        {!q.verified && (
                          <Button size="sm" variant="outline"
                            onClick={() => {
                              setQuotes((arr) => arr.map((x) => x.id === q.id ? { ...x, verified: true } : x));
                              toast({ title: "Quote verified" });
                            }}>
                            <CheckCircle2 className="size-3.5 mr-1" /> Verify
                          </Button>
                        )}
                        <Button size="sm" variant="ghost"
                          onClick={() => {
                            setQuotes((arr) => arr.filter((x) => x.id !== q.id));
                            toast({ title: "Quote rejected" });
                          }}>
                          <XCircle className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. GUARANTEE PROGRAMS */}
        <TabsContent value="guarantees">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">Guarantee programs</CardTitle>
                <CardDescription>Manage refund-based multi-cycle packages.</CardDescription>
              </div>
              <Button size="sm" variant="outline"
                onClick={() => {
                  const id = `g_${Date.now()}`;
                  setGuarantees((arr) => [
                    { id, clinic: "New clinic", cycles: 2, priceMin: 0, priceMax: 0, refundPolicy: "", eligibility: "", medicationIncluded: false },
                    ...arr,
                  ]);
                }}>
                <Plus className="size-4 mr-1" /> Add program
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {guarantees.map((g) => (
                <div key={g.id} className="border rounded-md p-3 grid md:grid-cols-12 gap-2 items-start">
                  <Input className="md:col-span-3" value={g.clinic}
                    onChange={(e) => setGuarantees((arr) => arr.map((x) => x.id === g.id ? { ...x, clinic: e.target.value } : x))} />
                  <Input className="md:col-span-1" type="number" value={g.cycles}
                    onChange={(e) => setGuarantees((arr) => arr.map((x) => x.id === g.id ? { ...x, cycles: Number(e.target.value) } : x))} />
                  <Input className="md:col-span-2" type="number" value={g.priceMin} placeholder="Min €"
                    onChange={(e) => setGuarantees((arr) => arr.map((x) => x.id === g.id ? { ...x, priceMin: Number(e.target.value) } : x))} />
                  <Input className="md:col-span-2" type="number" value={g.priceMax} placeholder="Max €"
                    onChange={(e) => setGuarantees((arr) => arr.map((x) => x.id === g.id ? { ...x, priceMax: Number(e.target.value) } : x))} />
                  <Textarea className="md:col-span-2" placeholder="Refund policy" value={g.refundPolicy}
                    onChange={(e) => setGuarantees((arr) => arr.map((x) => x.id === g.id ? { ...x, refundPolicy: e.target.value } : x))} />
                  <Textarea className="md:col-span-2" placeholder="Eligibility" value={g.eligibility}
                    onChange={(e) => setGuarantees((arr) => arr.map((x) => x.id === g.id ? { ...x, eligibility: e.target.value } : x))} />
                  <div className="md:col-span-12 flex items-center justify-between">
                    <Button size="sm" variant={g.medicationIncluded ? "default" : "outline"}
                      onClick={() => setGuarantees((arr) => arr.map((x) => x.id === g.id ? { ...x, medicationIncluded: !x.medicationIncluded } : x))}>
                      Medication {g.medicationIncluded ? "included" : "excluded"}
                    </Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => setGuarantees((arr) => arr.filter((x) => x.id !== g.id))}>
                      <XCircle className="size-3.5 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ----------------------------- Subcomponents ----------------------------- */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function AddSourceForm({ onCreate }: { onCreate: (s: PricingSource) => void }) {
  const [clinic, setClinic] = useState("");
  const [treatment, setTreatment] = useState("IVF");
  const [type, setType] = useState<PricingSource["type"]>("Clinic website");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!clinic.trim()) return;
        const id = `src_${Date.now()}`;
        onCreate({
          id, clinic, treatment, type, url, status: "pending", confidence: "low",
          sourceType: "pending_dossier", confidenceScore: 30, normalizationRule: "pendiente",
          updatedAt: new Date().toISOString().slice(0,10),
          rawText: notes || undefined,
        });
        setClinic(""); setUrl(""); setNotes("");
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Clinic"><Input value={clinic} onChange={(e) => setClinic(e.target.value)} required /></Field>
        <Field label="Treatment type">
          <Select value={treatment} onValueChange={setTreatment}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["IVF","ICSI","Egg donation","Egg freezing","IUI"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Source type">
          <Select value={type} onValueChange={(v) => setType(v as PricingSource["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Clinic website","PDF brochure","Patient quote","Email","Phone"].map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Source URL"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></Field>
      </div>
      <Field label="File upload">
        <div className="border border-dashed rounded-md p-4 text-sm text-muted-foreground flex items-center gap-2">
          <Upload className="size-4" /> Drop a PDF or image (mock)
        </div>
      </Field>
      <Field label="Notes / raw text"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <div className="flex justify-end gap-2">
        <Button type="submit"><Wand2 className="size-4 mr-1" /> Add & extract</Button>
      </div>
    </form>
  );
}

function NormalizedPreview({
  source,
  onApprove,
  onDraft,
  onReject,
}: {
  source: PricingSource;
  onApprove: () => void;
  onDraft: () => void;
  onReject: () => void;
}) {
  const ex = source.extracted!;
  const missing = ex.components.filter((c) => !c.included).map((c) => c.label);
  const basic = { min: ex.minPrice, max: ex.maxPrice };
  const premium = { min: Math.round(ex.maxPrice * 1.15), max: Math.round(ex.maxPrice * 1.4) };
  const guarantee = { min: Math.round(ex.publishedPrice * 2.4), max: Math.round(ex.publishedPrice * 3.1) };
  const conf = source.confidence;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Normalized output</CardTitle>
          <CardDescription>{source.clinic} · {ex.treatment}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Published price">€{ex.publishedPrice.toLocaleString()}</Row>
          <Row label="Missing components">{missing.length ? missing.join(", ") : "None"}</Row>
          <Row label="Basic range">€{basic.min.toLocaleString()} – €{basic.max.toLocaleString()}</Row>
          <Row label="Premium range">€{premium.min.toLocaleString()} – €{premium.max.toLocaleString()}</Row>
          <Row label="Guarantee range">€{guarantee.min.toLocaleString()} – €{guarantee.max.toLocaleString()}</Row>
          <Row label="Confidence"><ConfidenceBadge value={conf} /></Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient-facing explanation</CardTitle>
          <CardDescription>Preview of what the patient will read.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/40 border rounded-md p-3 text-sm">
            At <b>{source.clinic}</b>, a {ex.treatment} cycle is published from <b>€{ex.publishedPrice.toLocaleString()}</b>.
            {missing.length > 0 && (
              <> Note that <b>{missing.join(", ")}</b> {missing.length === 1 ? "is" : "are"} not included and may add to the final cost.</>
            )}
            {" "}Realistic full-cost range: <b>€{basic.min.toLocaleString()}–€{premium.max.toLocaleString()}</b>.
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onReject}><XCircle className="size-4 mr-1" /> Reject</Button>
            <Button variant="outline" onClick={onDraft}>Save as draft</Button>
            <Button onClick={onApprove}><CheckCircle2 className="size-4 mr-1" /> Approve & publish</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
