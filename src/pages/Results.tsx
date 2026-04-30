import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, MapPin, Star, TrendingUp, Sparkles, Lock, Info, Activity, CheckCircle2, Globe2, Brain, RefreshCw, Database, FileText, Users, Globe, ExternalLink, ArrowRight, Dna, User, Building2, Wallet, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  AggregatedRow,
  AssessmentData,
  Clinic,
  ClinicInsight,
  MatchResult,
  ScrapedPricingRow,
  runMatching,
  storage,
} from "@/lib/fertility";
import QuoteForm from "@/components/QuoteForm";
import { PersonalizedReasons } from "@/components/results/PersonalizedReasons";
import { QualitativeInsights } from "@/components/results/QualitativeInsights";
import { PricingBreakdown } from "@/components/results/PricingBreakdown";
import { TreatmentSimulator } from "@/components/results/TreatmentSimulator";

const TIER_STYLE: Record<string, string> = {
  premium: "bg-primary/10 text-primary border-primary/30",
  mid: "bg-muted text-foreground border-border",
  budget: "bg-accent-soft text-accent border-accent/30",
};

const ConfidencePill = ({ confidence }: { confidence: MatchResult["confidence"] }) => {
  const map = {
    high: { c: "bg-accent-soft text-accent", l: "High confidence" },
    medium: { c: "bg-warning/15 text-warning", l: "Medium confidence" },
    low: { c: "bg-destructive/10 text-destructive", l: "Low confidence" },
  } as const;
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${map[confidence].c}`}>
      {map[confidence].l}
    </span>
  );
};

const ScoreBar = ({
  label,
  value,
  icon: Icon,
  tone,
  reasons,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "accent" | "warning";
  reasons: string[];
}) => {
  const toneMap = {
    primary: { bar: "bg-primary", text: "text-primary", soft: "bg-primary-soft" },
    accent: { bar: "bg-accent", text: "text-accent", soft: "bg-accent-soft" },
    warning: { bar: "bg-warning", text: "text-warning", soft: "bg-warning/15" },
  } as const;
  const t = toneMap[tone];
  return (
    <div className={`rounded-lg p-3 ${t.soft}`} title={reasons.slice(0, 2).join(" · ")}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground/80">
          <Icon className={`size-3.5 ${t.text}`} /> {label}
        </div>
        <div className={`text-base font-extrabold tabular-nums ${t.text}`}>{value}</div>
      </div>
      <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
        <div className={`h-full ${t.bar} transition-all`} style={{ width: `${value}%` }} />
      </div>
      {reasons[0] && (
        <div className="text-[10.5px] text-muted-foreground mt-1.5 leading-snug line-clamp-2">
          {reasons[0]}
        </div>
      )}
    </div>
  );
};

const DataSourceBadge = ({
  source,
  sampleSize,
  parseConfidence,
}: {
  source: MatchResult["price_source"];
  sampleSize: number;
  parseConfidence?: number | null;
}) => {
  if (source === "scraped") {
    const pct = parseConfidence ? Math.round(parseConfidence * 100) : null;
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold bg-accent/15 text-accent border border-accent/40"
        title={`Extracted from clinic website${pct ? ` (parser confidence ${pct}%)` : ""}`}
      >
        <Globe className="size-3" /> Real market data · scraped
      </span>
    );
  }
  if (source === "crowd") {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold bg-primary/10 text-primary border border-primary/30"
        title={`Normalized from ${sampleSize} community-submitted quote${sampleSize === 1 ? "" : "s"}`}
      >
        <Database className="size-3" /> Real market data
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold bg-muted text-muted-foreground border border-border"
      title="Estimated from clinic-published price lists. No scraped or community data yet."
    >
      <FileText className="size-3" /> Listed estimate
    </span>
  );
};

const ResultCard = ({
  m,
  unlocked,
  namesUnlocked,
  assessment,
  rank,
  communityAvg,
  communitySamples,
}: {
  m: MatchResult;
  unlocked: boolean;
  namesUnlocked: boolean;
  assessment: AssessmentData;
  rank: number;
  communityAvg: number | null;
  communitySamples: number;
}) => {
  const isTop = rank === 1;
  const c = m.clinic;
  const showRange = unlocked && m.sample_size > 0;
  const displayName = namesUnlocked ? c.name : `Clinic ${String.fromCharCode(64 + rank)}`;
  const displayLocation = namesUnlocked ? `${c.city}, ${c.country}` : c.country;
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchExplanation = async () => {
    if (aiExplanation || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const { data, error } = await supabase.functions.invoke("clinic-explainer", {
        body: {
          assessment: {
            age: assessment.age,
            treatment_interest: assessment.treatment_interest,
            budget_range: assessment.budget_range,
            country_preference: assessment.country_preference,
            diagnosis: assessment.diagnosis,
          },
          match: {
            clinic_name: c.name,
            country: c.country,
            city: c.city,
            tier: c.tier,
            estimated_price: m.estimated_price,
            price_low: m.price_low,
            price_high: m.price_high,
            success_rate: c.success_rate_estimate,
            rating: c.rating_score,
            sample_size: m.sample_size,
            confidence: m.confidence,
            pricing_percentile: m.pricing_percentile,
            vs_country_avg_pct: m.vs_country_avg_pct,
            volatility: m.volatility,
            composite_score: m.composite_score,
            treatments_available: c.treatments_available,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiExplanation(data?.explanation ?? "");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Could not generate explanation");
    } finally {
      setAiLoading(false);
    }
  };

  const priceLabel =
    m.vs_country_avg_pct === null
      ? null
      : m.vs_country_avg_pct < -2
        ? `${Math.abs(m.vs_country_avg_pct)}% below average`
        : m.vs_country_avg_pct > 2
          ? `${m.vs_country_avg_pct}% above average`
          : "in line with average";

  const normalizedDeltaPct =
    m.price_source === "crowd" && m.listed_price > 0
      ? Math.round(((m.estimated_price - m.listed_price) / m.listed_price) * 100)
      : null;

  return (
    <Card
      className={`relative p-6 transition-smooth bg-gradient-card border-2 ${
        isTop
          ? "border-primary/60 shadow-elegant ring-2 ring-primary/20"
          : "shadow-card hover:shadow-elegant"
      }`}
    >
      {isTop && (
        <div className="absolute -top-3 left-6 bg-gradient-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-soft">
          ★ Top match for you
        </div>
      )}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center justify-center size-6 rounded-md bg-foreground/5 text-foreground/70 text-xs font-bold tabular-nums">
              #{rank}
            </span>
            <h3 className="text-xl font-bold">{displayName}</h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${TIER_STYLE[c.tier]}`}
            >
              {c.tier}
            </span>
            {!namesUnlocked && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border inline-flex items-center gap-1">
                <Lock className="size-3" /> Anonymized
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {displayLocation}
            </span>
            {c.rating_score && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-warning text-warning" /> {c.rating_score}
              </span>
            )}
          </div>
        </div>
        <div className="text-center shrink-0">
          <div className="text-3xl font-extrabold bg-gradient-primary bg-clip-text text-transparent tabular-nums">
            {m.match_score}
          </div>
          <div className="text-xs text-muted-foreground font-semibold">/ 100 match</div>
          <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/70" title="Data quality of this decision">
            <ShieldCheck className="size-3" /> {m.scores.decision_confidence}
          </div>
        </div>
      </div>

      {/* Decision breakdown — Patient · Clinic Fit · Value */}
      <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary-soft/30 to-card p-3 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 flex items-center gap-1.5">
            <Brain className="size-3.5 text-primary" /> Decision breakdown
          </div>
          <div className="text-[10px] text-muted-foreground">
            weighted: patient 20% · fit 50% · value 30%
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <ScoreBar
            label="Patient"
            value={m.scores.patient_score}
            icon={User}
            tone="primary"
            reasons={m.scores.reasons.patient}
          />
          <ScoreBar
            label="Clinic fit"
            value={m.scores.clinic_fit_score}
            icon={Building2}
            tone="accent"
            reasons={m.scores.reasons.clinic_fit}
          />
          <ScoreBar
            label="Value"
            value={m.scores.value_score}
            icon={Wallet}
            tone="warning"
            reasons={m.scores.reasons.value}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-primary-soft p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Estimated total
            </div>
            <DataSourceBadge
              source={m.price_source}
              sampleSize={m.sample_size}
              parseConfidence={m.scraped_parse_confidence ?? null}
            />
          </div>
          <div className="text-2xl font-bold text-primary tabular-nums leading-none">
            €{m.estimated_price.toLocaleString()}
          </div>
          {m.price_source === "scraped" && m.scraped_source_url && (
            <a
              href={m.scraped_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-accent hover:underline inline-flex items-center gap-1"
              title="Data extracted from clinic website"
            >
              <ExternalLink className="size-3" />
              Data extracted from {m.scraped_source_domain || "clinic website"}
            </a>
          )}
          {normalizedDeltaPct !== null && Math.abs(normalizedDeltaPct) >= 3 && (
            <div className="text-[11px] text-muted-foreground">
              Normalized from real quotes —{" "}
              <span className="font-semibold text-foreground">
                {normalizedDeltaPct > 0 ? "+" : ""}
                {normalizedDeltaPct}% vs €{m.listed_price.toLocaleString()} listed
              </span>
            </div>
          )}
          {showRange ? (
            <div className="text-[11px] text-muted-foreground">
              Typical range:{" "}
              <span className="font-semibold text-foreground">
                €{m.price_low.toLocaleString()}–€{m.price_high.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-muted-foreground">
              Range hidden — submit a quote to unlock
            </div>
          )}
          {priceLabel && (
            <div
              className={`text-[11px] font-semibold ${
                m.vs_country_avg_pct !== null && m.vs_country_avg_pct < -2
                  ? "text-accent"
                  : m.vs_country_avg_pct !== null && m.vs_country_avg_pct > 2
                    ? "text-warning"
                    : "text-muted-foreground"
              }`}
            >
              {priceLabel}
            </div>
          )}
          <div className="pt-1 flex items-center gap-2 flex-wrap">
            <ConfidencePill confidence={m.confidence} />
            {m.sample_size > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {m.sample_size} quote{m.sample_size === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {communityAvg !== null && communitySamples > 0 && (
            <div className="mt-1.5 text-[11px] text-foreground/80 inline-flex items-center gap-1.5">
              <Users className="size-3 text-primary" />
              <span>
                Community avg:{" "}
                <span className="font-bold text-foreground">
                  €{communityAvg.toLocaleString()}
                </span>{" "}
                <span className="text-muted-foreground">
                  ({communitySamples} stor{communitySamples === 1 ? "y" : "ies"})
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="rounded-xl bg-accent-soft p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Clinic score
          </div>
          <div className="text-2xl font-bold text-accent tabular-nums leading-none mt-1">
            {m.composite_score}/100
          </div>
          <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
            <Activity className="size-3" /> success · price · rating
          </div>
          {c.success_rate_estimate && (
            <div className="text-[11px] text-muted-foreground mt-1">
              <TrendingUp className="size-3 inline" /> {c.success_rate_estimate}% reported success
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {c.treatments_available.slice(0, 4).map((t) => (
          <Badge key={t} variant="secondary" className="rounded-full font-medium">
            {t}
          </Badge>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4 mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-foreground/80 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-accent" /> Why this clinic
        </div>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {m.explanations.slice(0, 3).map((e, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-accent mt-0.5">•</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>

      {!unlocked && m.sample_size > 0 && (
        <div className="text-xs flex items-center gap-2 text-muted-foreground bg-muted/60 rounded-lg p-3 mb-3">
          <Lock className="size-3.5" />
          Submit a quote below to unlock the precise community price range.
        </div>
      )}

      {aiExplanation ? (
        <div className="rounded-xl border-2 border-primary/30 bg-primary-soft/50 p-4 text-sm space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-primary text-xs uppercase tracking-wider">
            <Sparkles className="size-3.5" /> AI explanation
          </div>
          <div className="whitespace-pre-line text-foreground/90 leading-relaxed">
            {aiExplanation}
          </div>
        </div>
      ) : aiError ? (
        <div className="text-xs text-destructive bg-destructive/10 rounded-lg p-3">{aiError}</div>
      ) : (
        <Button variant="outline" className="w-full" onClick={fetchExplanation} disabled={aiLoading}>
          <Sparkles className="size-4" />
          {aiLoading ? "Generating…" : "Why this match? (AI)"}
        </Button>
      )}
    </Card>
  );
};

const Results = () => {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedRow[]>([]);
  const [scraped, setScraped] = useState<ScrapedPricingRow[]>([]);
  const [insights, setInsights] = useState<ClinicInsight[]>([]);
  const [unlocked, setUnlocked] = useState(storage.isUnlocked());
  const [namesUnlocked, setNamesUnlocked] = useState(storage.areNamesUnlocked());
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsightsError, setAiInsightsError] = useState<string | null>(null);
  const [communityStories, setCommunityStories] = useState<
    { clinic_name: string | null; treatment_type: string; estimated_price: number | null }[]
  >([]);

  const loadAiInsights = async () => {
    setAiInsightsLoading(true);
    setAiInsightsError(null);
    try {
      const { data, error } = await supabase.functions.invoke("market-insights", { body: {} });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAiInsights(((data as any)?.insights ?? []) as string[]);
    } catch (e) {
      setAiInsightsError(e instanceof Error ? e.message : "Could not load AI insights");
    } finally {
      setAiInsightsLoading(false);
    }
  };

  useEffect(() => {
    const a = storage.loadAssessment();
    if (!a || !a.treatment_interest) {
      navigate("/assessment");
      return;
    }
    setAssessment(a);
    (async () => {
      const [{ data: cs }, { data: ag }, { data: ins }, { data: sc }, { data: cstories }] =
        await Promise.all([
          supabase.from("clinics").select("*"),
          supabase.from("aggregated_pricing").select("*"),
          supabase.from("clinic_insights").select("*"),
          supabase.from("scraped_pricing").select("*"),
          supabase
            .from("community_stories")
            .select("clinic_name, treatment_type, estimated_price"),
        ]);
      setClinics((cs ?? []) as Clinic[]);
      setAggregated((ag ?? []) as AggregatedRow[]);
      setInsights((ins ?? []) as ClinicInsight[]);
      setScraped((sc ?? []) as ScrapedPricingRow[]);
      setCommunityStories((cstories ?? []) as typeof communityStories);
      setLoading(false);
      loadAiInsights();
    })();
  }, [navigate]);

  const matches = useMemo(() => {
    if (!assessment || !clinics.length) return [];
    return runMatching(assessment, clinics, aggregated, insights, scraped);
  }, [assessment, clinics, aggregated, insights, scraped]);

  // Community price aggregation per clinic for the chosen treatment
  const communityByClinic = useMemo(() => {
    const treatment = assessment?.treatment_interest || "";
    const map = new Map<string, { avg: number; samples: number }>();
    const groups = new Map<string, number[]>();
    communityStories.forEach((s) => {
      if (!s.clinic_name || !s.estimated_price) return;
      if (treatment && s.treatment_type !== treatment) return;
      const arr = groups.get(s.clinic_name) ?? [];
      arr.push(s.estimated_price);
      groups.set(s.clinic_name, arr);
    });
    groups.forEach((arr, name) => {
      map.set(name, {
        avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
        samples: arr.length,
      });
    });
    return map;
  }, [communityStories, assessment]);

  const countryComparison = useMemo(() => {
    if (!clinics.length) return [] as { country: string; avg: number; diff: number | null }[];
    const treatment = assessment?.treatment_interest || "IVF";
    const groups: Record<string, number[]> = {};
    clinics
      .filter((c) => c.treatments_available.includes(treatment) && c.total_estimated_price)
      .forEach((c) => {
        groups[c.country] ||= [];
        groups[c.country].push(c.total_estimated_price as number);
      });
    const rows = Object.entries(groups).map(([country, arr]) => ({
      country,
      avg: Math.round(arr.reduce((s, n) => s + n, 0) / arr.length),
    }));
    if (!rows.length) return [];
    const cheapest = Math.min(...rows.map((r) => r.avg));
    return rows
      .map((r) => ({ ...r, diff: cheapest === r.avg ? null : Math.round(((r.avg - cheapest) / cheapest) * 100) }))
      .sort((a, b) => a.avg - b.avg);
  }, [clinics, assessment]);

  const refreshAggregated = async () => {
    const [{ data: ag }, { data: ins }] = await Promise.all([
      supabase.from("aggregated_pricing").select("*"),
      supabase.from("clinic_insights").select("*"),
    ]);
    setAggregated((ag ?? []) as AggregatedRow[]);
    setInsights((ins ?? []) as ClinicInsight[]);
    setUnlocked(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-hero">
          <div className="container py-12">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
                  <Brain className="size-3" /> Decision engine · 3-score model
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Your top matches</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">
                  Each clinic is scored on <strong>Patient fit</strong>, <strong>Clinic fit</strong> and{" "}
                  <strong>Value</strong> — then blended into a single 0–100 Match Score with a data-quality confidence rating.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/assessment">
                  <Pencil className="size-4" /> Edit assessment
                </Link>
              </Button>
            </div>

            {assessment && (
              <Card className="p-5 bg-card/80 backdrop-blur shadow-soft mb-6">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Age:</span>{" "}
                    <span className="font-semibold">{assessment.age}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Treatment:</span>{" "}
                    <span className="font-semibold">{assessment.treatment_interest}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget:</span>{" "}
                    <span className="font-semibold">{assessment.budget_range}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>{" "}
                    <span className="font-semibold">{assessment.country_preference}</span>
                  </div>
                  {assessment.diagnosis.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Diagnosis:</span>{" "}
                      <span className="font-semibold">{assessment.diagnosis.join(", ")}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {unlocked && (
              <div className="rounded-2xl border-2 border-accent/40 bg-accent-soft p-4 mb-4 flex items-center gap-3">
                <Sparkles className="size-5 text-accent" />
                <div className="text-sm">
                  <span className="font-semibold">You contributed — here's your reward:</span>{" "}
                  exact community price ranges are now visible.
                </div>
              </div>
            )}

            {!loading && matches.length > 0 && (() => {
              const scrapedBacked = matches.filter((m) => m.price_source === "scraped").length;
              const crowdBacked = matches.filter((m) => m.price_source === "crowd").length;
              const realBacked = scrapedBacked + crowdBacked;
              const totalQuotes = matches
                .filter((m) => m.price_source === "crowd")
                .reduce((s, m) => s + m.sample_size, 0);
              const parts: string[] = [];
              if (scrapedBacked) parts.push(`${scrapedBacked} extracted from clinic websites`);
              if (crowdBacked)
                parts.push(
                  `${crowdBacked} from ${totalQuotes} community quote${totalQuotes === 1 ? "" : "s"}`,
                );
              return (
                <div className="rounded-2xl border-2 border-primary/30 bg-card/80 backdrop-blur p-4 mb-2 flex flex-wrap items-center gap-3">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Database className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                      Based on real market data
                    </div>
                    <div className="text-sm text-foreground/90">
                      <span className="font-semibold">
                        {realBacked} of {matches.length}
                      </span>{" "}
                      top matches priced from real sources
                      {parts.length > 0 && (
                        <span className="text-muted-foreground"> — {parts.join(", ")}</span>
                      )}
                      {realBacked < matches.length && (
                        <span className="text-muted-foreground">
                          {parts.length ? "; " : " — "}remaining fall back to clinic-listed estimates.
                        </span>
                      )}
                    </div>
                  </div>
                  {scrapedBacked > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold bg-accent/15 text-accent border border-accent/40">
                      <Globe className="size-3" /> Live scraped data
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        </section>

        <section className="container py-10">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Calculating matches…</div>
          ) : (
            <>
              {!namesUnlocked && (
                <Card className="mb-8 p-6 shadow-elegant bg-gradient-card border-2 border-primary/40">
                  <div className="flex flex-wrap items-center gap-5 justify-between">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="size-11 rounded-xl bg-primary-soft grid place-items-center shrink-0">
                        <Lock className="size-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                          Step 2 · Unlock
                        </div>
                        <h3 className="font-bold text-lg">Reveal clinic names & full pricing</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          €19 self-serve, or get a free intro via our referral team.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="hero">
                        <Link to="/patient/unlock">See unlock options <ArrowRight className="size-4" /></Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-6 md:[&>*:first-child]:md:col-span-2">
                {matches.map((m, i) => {
                  const cb = communityByClinic.get(m.clinic.name);
                  return (
                    <ResultCard
                      key={m.clinic.id}
                      m={m}
                      unlocked={unlocked}
                      namesUnlocked={namesUnlocked}
                      assessment={assessment!}
                      rank={i + 1}
                      communityAvg={cb?.avg ?? null}
                      communitySamples={cb?.samples ?? 0}
                    />
                  );
                })}
              </div>

              <Card className="mt-10 p-6 shadow-card border-2 border-primary/20 bg-gradient-to-br from-primary-soft/40 to-card">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Brain className="size-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
                        Live AI analysis
                      </div>
                      <h2 className="text-xl font-bold leading-tight">What the data is telling us right now</h2>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadAiInsights}
                    disabled={aiInsightsLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`size-3.5 ${aiInsightsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>

                {aiInsightsError ? (
                  <div className="text-sm text-destructive">{aiInsightsError}</div>
                ) : aiInsightsLoading && !aiInsights.length ? (
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${70 + (i * 7) % 25}%` }} />
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {aiInsights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                        <span className="leading-relaxed">{ins}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {countryComparison.length > 1 && (
                <Card className="mt-10 p-6 shadow-card bg-gradient-card border-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe2 className="size-5 text-primary" />
                    <h2 className="text-xl font-bold">Explore treatment abroad</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-5">
                    Same {assessment?.treatment_interest || "IVF"} treatment, different markets — see how much you could save.
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {countryComparison.map((r, i) => (
                      <div
                        key={r.country}
                        className={`rounded-xl p-4 border-2 ${
                          i === 0 ? "border-accent/40 bg-accent-soft" : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{r.country}</div>
                          {i === 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                              Best value
                            </span>
                          )}
                        </div>
                        <div className="text-2xl font-bold tabular-nums mt-1">
                          €{r.avg.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {r.diff === null ? "Reference price" : `+${r.diff}% vs cheapest`}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {!unlocked && (
                <Card className="mt-8 p-5 border-2 border-dashed border-primary/40 bg-primary-soft/40 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                      Help improve pricing accuracy
                    </div>
                    <h3 className="font-bold">Users who share their quote get more accurate results.</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share one anonymous quote → unlock exact community price ranges and improve insights for everyone.
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    onClick={() => document.getElementById("crowdsource")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Share my quote
                  </Button>
                </Card>
              )}

              {/* Step 3 + Step 5 cross-sell */}
              <div className="grid md:grid-cols-2 gap-4 mt-8">
                <Card className="p-6 border-2 border-primary/30 bg-gradient-card shadow-card">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Dna className="size-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step 3 · Advanced</span>
                  </div>
                  <h3 className="font-bold text-lg">Sharper matches with deeper data</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Add the advanced questionnaire (€30), genetic matching or a home fertility kit
                    — free with our partner products.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/patient/advanced">Explore advanced modules <ArrowRight className="size-4" /></Link>
                  </Button>
                </Card>
                <Card className="p-6 border-2 border-accent/30 bg-gradient-card shadow-card">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Users className="size-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Step 5 · Referral</span>
                  </div>
                  <h3 className="font-bold text-lg">Want us to connect you?</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Get a free, hand-picked introduction to your top-matched clinics. No spam, ever.
                  </p>
                  <Button asChild variant="outline" className="border-accent/40 text-accent hover:bg-accent-soft">
                    <Link to="/patient/referral">Request free referral <ArrowRight className="size-4" /></Link>
                  </Button>
                </Card>
              </div>

              <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4 flex items-start gap-3 text-xs text-muted-foreground">
                <Info className="size-4 mt-0.5 shrink-0" />
                <p>
                  This platform provides informational insights and not medical advice. Prices are
                  estimates based on public data and patient-submitted quotes; actual costs may
                  vary. Always consult a licensed fertility specialist before making treatment
                  decisions.
                </p>
              </div>
            </>
          )}
        </section>

        <section id="crowdsource" className="container pb-10 scroll-mt-20">
          <QuoteForm onSubmitted={refreshAggregated} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Results;
