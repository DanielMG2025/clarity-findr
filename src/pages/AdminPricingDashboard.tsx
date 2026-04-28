import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Database,
  ExternalLink,
  Filter,
  Lock,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

// ---- Types --------------------------------------------------------------

type PricingType = "package" | "base" | "range" | "inferred";
type ConfidenceLevel = "high" | "medium" | "low";

interface ScrapedRow {
  id: string;
  clinic_name: string;
  treatment_type: string;
  country: string | null;
  raw_text: string | null;
  raw_price: number | null;
  scraped_price: number;
  base_price: number | null;
  medication_estimate: number | null;
  extras_estimate: number | null;
  pricing_type: PricingType;
  detected_keywords: string[];
  normalization_rule: string | null;
  parse_confidence: number;
  source_url: string;
  source_domain: string | null;
  scraped_at: string;
}

// ---- Country benchmarks (admin reference) -------------------------------

const COUNTRY_BENCHMARK: Record<string, { low: number; high: number }> = {
  Spain: { low: 4000, high: 6700 },
  Portugal: { low: 3500, high: 5800 },
  "Czech Republic": { low: 2500, high: 4200 },
  Greece: { low: 3000, high: 5000 },
};

// ---- Helpers ------------------------------------------------------------

const eur = (n: number | null | undefined) =>
  n == null ? "—" : `€${Math.round(n).toLocaleString()}`;

function confidenceFromParse(p: number, pricingType: PricingType): ConfidenceLevel {
  if (pricingType === "inferred") return "low";
  if (p >= 0.85 || pricingType === "package") return "high";
  if (p >= 0.6) return "medium";
  return "low";
}

function vsBenchmark(country: string | null, total: number): number | null {
  if (!country) return null;
  const b = COUNTRY_BENCHMARK[country];
  if (!b) return null;
  const mid = (b.low + b.high) / 2;
  return Math.round(((total - mid) / mid) * 100);
}

// ---- Admin gate (mock) --------------------------------------------------

const ADMIN_KEY = "fc_admin_unlocked";
const ADMIN_PASSCODE = "admin"; // mock auth — internal only

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full space-y-5">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Admin access required</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          This dashboard is internal-only. Used for QA, debugging, and investor demos of
          the pricing intelligence pipeline.
        </p>
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Enter passcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (code === ADMIN_PASSCODE) {
                  localStorage.setItem(ADMIN_KEY, "1");
                  onUnlock();
                } else setErr(true);
              }
            }}
          />
          {err && (
            <p className="text-xs text-destructive">Incorrect passcode.</p>
          )}
        </div>
        <Button
          className="w-full"
          onClick={() => {
            if (code === ADMIN_PASSCODE) {
              localStorage.setItem(ADMIN_KEY, "1");
              onUnlock();
            } else setErr(true);
          }}
        >
          Unlock dashboard
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Mock auth for demo purposes. Replace with role-based auth in production.
        </p>
      </Card>
    </div>
  );
}

// ---- Sub-components -----------------------------------------------------

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const map = {
    high: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    low: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  } as const;
  return (
    <Badge variant="outline" className={`${map[level]} capitalize text-[11px]`}>
      {level}
    </Badge>
  );
}

function PricingTypeBadge({ type }: { type: PricingType }) {
  return (
    <Badge variant="secondary" className="capitalize text-[11px]">
      {type}
    </Badge>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold leading-tight">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ---- Main page ----------------------------------------------------------

const AdminPricingDashboard = () => {
  const [unlocked, setUnlocked] = useState<boolean>(
    typeof window !== "undefined" && localStorage.getItem(ADMIN_KEY) === "1"
  );
  const [rows, setRows] = useState<ScrapedRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [country, setCountry] = useState<string>("all");
  const [pricingType, setPricingType] = useState<string>("all");
  const [confidence, setConfidence] = useState<string>("all");

  useEffect(() => {
    if (!unlocked) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("scraped_pricing")
        .select(
          "id,clinic_name,treatment_type,country,raw_text,raw_price,scraped_price,base_price,medication_estimate,extras_estimate,pricing_type,detected_keywords,normalization_rule,parse_confidence,source_url,source_domain,scraped_at"
        )
        .order("clinic_name", { ascending: true });
      if (!error && data) setRows(data as ScrapedRow[]);
      setLoading(false);
    })();
  }, [unlocked]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (country !== "all" && r.country !== country) return false;
      if (pricingType !== "all" && r.pricing_type !== pricingType) return false;
      const conf = confidenceFromParse(r.parse_confidence, r.pricing_type);
      if (confidence !== "all" && conf !== confidence) return false;
      return true;
    });
  }, [rows, country, pricingType, confidence]);

  const countries = useMemo(
    () => Array.from(new Set(rows.map((r) => r.country).filter(Boolean))) as string[],
    [rows]
  );

  // Charts data
  const distributionData = useMemo(
    () =>
      filtered.map((r) => ({
        name: r.clinic_name.replace(/\s+/g, "\n"),
        total: r.scraped_price,
        rule: r.pricing_type,
      })),
    [filtered]
  );

  const varianceData = useMemo(() => {
    return filtered.map((r) => {
      const total = r.scraped_price;
      const delta = r.raw_price != null ? total - r.raw_price : 0;
      return {
        name: r.clinic_name.split(" ")[0],
        Raw: r.raw_price ?? total,
        Normalized: total,
        delta,
      };
    });
  }, [filtered]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!filtered.length) return null;
    const totals = filtered.map((r) => r.scraped_price);
    const avg = totals.reduce((s, n) => s + n, 0) / totals.length;
    const min = Math.min(...totals);
    const max = Math.max(...totals);
    const highConf = filtered.filter(
      (r) => confidenceFromParse(r.parse_confidence, r.pricing_type) === "high"
    ).length;
    return { avg, min, max, highConf };
  }, [filtered]);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <AdminGate onUnlock={() => setUnlocked(true)} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/30 text-primary">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Admin · Internal
            </Badge>
            <Badge variant="outline" className="text-[11px]">
              Pricing Intelligence Engine
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Pricing Intelligence Dashboard
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            This dashboard shows how raw clinic pricing is transformed into comparable
            structured data — from web-scraped text, through parsing and normalization,
            to a single benchmark-ready number per clinic.
          </p>
        </div>

        {/* KPI strip */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Sources tracked</p>
              <p className="text-2xl font-semibold mt-1">{filtered.length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Avg normalized</p>
              <p className="text-2xl font-semibold mt-1">{eur(stats.avg)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Range</p>
              <p className="text-2xl font-semibold mt-1">
                {eur(stats.min)}–{eur(stats.max)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">High-confidence rows</p>
              <p className="text-2xl font-semibold mt-1">
                {stats.highConf}/{filtered.length}
              </p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters
            </div>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={pricingType} onValueChange={setPricingType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pricing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pricing types</SelectItem>
                <SelectItem value="package">Package</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="range">Range</SelectItem>
                <SelectItem value="inferred">Inferred</SelectItem>
              </SelectContent>
            </Select>
            <Select value={confidence} onValueChange={setConfidence}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Confidence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All confidence</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground">
              Showing {filtered.length} of {rows.length}
            </div>
          </div>
        </Card>

        {loading && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Loading pipeline data…
          </Card>
        )}

        {/* 2. Raw scraped data */}
        <section>
          <SectionHeader
            icon={Database}
            title="Raw Scraped Data"
            subtitle="Unstructured input pulled directly from clinic websites."
          />
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Raw text</TableHead>
                  <TableHead className="text-right">Raw €</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={`raw-${r.id}`}>
                    <TableCell className="font-medium">{r.clinic_name}</TableCell>
                    <TableCell className="max-w-xl">
                      <span className="text-sm italic text-muted-foreground">
                        “{r.raw_text ?? "—"}”
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {eur(r.raw_price)}
                    </TableCell>
                    <TableCell>
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {r.source_domain ?? "link"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* 3. Parsing view */}
        <section>
          <SectionHeader
            icon={Wand2}
            title="Parsed Data"
            subtitle="How the parser interprets each scraped snippet."
          />
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Pricing type</TableHead>
                  <TableHead className="text-right">Extracted €</TableHead>
                  <TableHead>Detected keywords</TableHead>
                  <TableHead>Parser conf.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={`parse-${r.id}`}>
                    <TableCell className="font-medium">{r.clinic_name}</TableCell>
                    <TableCell>
                      <PricingTypeBadge type={r.pricing_type} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {eur(r.raw_price)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {(r.detected_keywords ?? []).map((k) => (
                          <Badge
                            key={k}
                            variant="outline"
                            className="text-[10px] font-normal"
                          >
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {(r.parse_confidence * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* 4. Normalization view */}
        <section>
          <SectionHeader
            icon={Activity}
            title="Normalized Pricing"
            subtitle="Structured split: base treatment, medication, extras, total."
          />
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Medication</TableHead>
                  <TableHead className="text-right">Extras</TableHead>
                  <TableHead className="text-right">Normalized total</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const conf = confidenceFromParse(r.parse_confidence, r.pricing_type);
                  return (
                    <TableRow key={`norm-${r.id}`}>
                      <TableCell className="font-medium">{r.clinic_name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {eur(r.base_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {eur(r.medication_estimate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {eur(r.extras_estimate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {eur(r.scraped_price)}
                      </TableCell>
                      <TableCell>
                        <ConfidenceBadge level={conf} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* 5. Side-by-side */}
        <section>
          <SectionHeader
            icon={ArrowRight}
            title="Raw → Normalized"
            subtitle="Trace each clinic's transformation, side by side."
          />
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((r) => {
              const conf = confidenceFromParse(r.parse_confidence, r.pricing_type);
              return (
                <Card key={`s2s-${r.id}`} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{r.clinic_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {r.country ?? "—"} · {r.treatment_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PricingTypeBadge type={r.pricing_type} />
                      <ConfidenceBadge level={conf} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                        Raw
                      </p>
                      <p className="text-sm italic mb-2">“{r.raw_text ?? "—"}”</p>
                      <p className="text-sm tabular-nums">
                        Headline: <strong>{eur(r.raw_price)}</strong>
                      </p>
                    </div>
                    <div className="rounded-md border bg-primary/5 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-primary mb-1">
                        Normalized
                      </p>
                      <ul className="text-sm space-y-0.5 tabular-nums">
                        <li>Base: {eur(r.base_price)}</li>
                        <li>Medication: {eur(r.medication_estimate)}</li>
                        <li>Extras: {eur(r.extras_estimate)}</li>
                        <li className="border-t pt-1 mt-1 font-semibold">
                          Total: {eur(r.scraped_price)}
                        </li>
                      </ul>
                    </div>
                  </div>

                  {r.normalization_rule && (
                    <div className="rounded-md border border-dashed p-3">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Normalization logic
                      </p>
                      <p className="text-xs font-mono">{r.normalization_rule}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        {/* 6. Comparison table */}
        <section>
          <SectionHeader
            icon={Database}
            title="Cross-clinic Comparison"
            subtitle="Apples-to-apples view of every normalized clinic."
          />
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">Meds</TableHead>
                  <TableHead className="text-right">Extras</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...filtered]
                  .sort((a, b) => a.scraped_price - b.scraped_price)
                  .map((r) => (
                    <TableRow key={`cmp-${r.id}`}>
                      <TableCell className="font-medium">{r.clinic_name}</TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {eur(r.scraped_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {eur(r.base_price)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {eur(r.medication_estimate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {eur(r.extras_estimate)}
                      </TableCell>
                      <TableCell>
                        <ConfidenceBadge
                          level={confidenceFromParse(r.parse_confidence, r.pricing_type)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* 7. Market benchmark */}
        <section>
          <SectionHeader
            icon={Activity}
            title="Market Benchmark"
            subtitle="Compare each normalized clinic price to its country market band."
          />
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Country band</TableHead>
                  <TableHead className="text-right">Normalized</TableHead>
                  <TableHead>vs market</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const band = r.country ? COUNTRY_BENCHMARK[r.country] : undefined;
                  const delta = vsBenchmark(r.country, r.scraped_price);
                  return (
                    <TableRow key={`bench-${r.id}`}>
                      <TableCell className="font-medium">{r.clinic_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground tabular-nums">
                        {band
                          ? `${r.country}: ${eur(band.low)}–${eur(band.high)}`
                          : "No benchmark"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {eur(r.scraped_price)}
                      </TableCell>
                      <TableCell>
                        {delta == null ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Badge
                            variant="outline"
                            className={
                              delta > 0
                                ? "bg-rose-500/10 text-rose-700 border-rose-500/30"
                                : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                            }
                          >
                            {delta > 0 ? `+${delta}%` : `${delta}%`} vs avg
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* 10. Debug panel */}
        <section>
          <SectionHeader
            icon={AlertTriangle}
            title="Normalization Logic (Debug)"
            subtitle="Which rule was applied and which assumptions were made for each row."
          />
          <Card className="p-0 overflow-hidden">
            <div className="divide-y">
              {filtered.map((r) => (
                <div key={`dbg-${r.id}`} className="p-4 grid md:grid-cols-3 gap-3">
                  <div>
                    <p className="font-medium">{r.clinic_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.treatment_type} · {r.country ?? "—"}
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <p className="text-xs text-muted-foreground">
                      Rule applied:{" "}
                      <span className="font-mono text-foreground">
                        {r.normalization_rule ?? "—"}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assumptions:{" "}
                      <span className="text-foreground">
                        {r.pricing_type === "package"
                          ? "Package detected → split into base / meds / extras using country defaults."
                          : r.pricing_type === "base"
                          ? "Only base shown → meds & extras added from country defaults."
                          : r.pricing_type === "range"
                          ? "Range detected → upper bound used as headline, lower bound as base."
                          : "No explicit price → midpoint of inferred range, low confidence."}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 11. Visualization */}
        <section>
          <SectionHeader
            icon={Activity}
            title="Distribution & Variance"
            subtitle="Where each clinic sits and how raw differs from normalized."
          />
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-sm font-medium mb-3">Normalized price distribution</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => `€${v.toLocaleString()}`}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                      {distributionData.map((d, i) => (
                        <Cell
                          key={i}
                          fill={
                            d.rule === "package"
                              ? "hsl(var(--primary))"
                              : d.rule === "range"
                              ? "hsl(var(--muted-foreground))"
                              : d.rule === "inferred"
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--accent-foreground))"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-sm font-medium mb-3">Raw vs normalized</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={varianceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: number) => `€${v.toLocaleString()}`}
                    />
                    <Bar dataKey="Raw" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Normalized" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </section>

        {/* 12. Source transparency */}
        <section>
          <SectionHeader
            icon={ExternalLink}
            title="Data Source Transparency"
            subtitle="Where every number originated and when it was captured."
          />
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Source URL</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Captured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={`src-${r.id}`}>
                    <TableCell className="font-medium">{r.clinic_name}</TableCell>
                    <TableCell className="max-w-md truncate">
                      <a
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {r.source_url}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm">{r.source_domain ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {new Date(r.scraped_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        <div className="flex justify-between items-center pt-4 text-xs text-muted-foreground">
          <span>Internal admin view · pipeline data is read-only.</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              localStorage.removeItem(ADMIN_KEY);
              setUnlocked(false);
            }}
          >
            <Lock className="h-3 w-3 mr-1" />
            Lock dashboard
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default AdminPricingDashboard;
