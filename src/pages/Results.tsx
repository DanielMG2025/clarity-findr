import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, MapPin, Star, TrendingUp, Sparkles, Lock, Info, Activity, CheckCircle2, Globe2, Brain, RefreshCw, Database, FileText, Users } from "lucide-react";
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
  runMatching,
  storage,
} from "@/lib/fertility";
import QuoteForm from "@/components/QuoteForm";

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

const DataSourceBadge = ({
  source,
  sampleSize,
}: {
  source: MatchResult["price_source"];
  sampleSize: number;
}) =>
  source === "crowd" ? (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold bg-primary/10 text-primary border border-primary/30"
      title={`Normalized from ${sampleSize} community-submitted quote${sampleSize === 1 ? "" : "s"}`}
    >
      <Database className="size-3" /> Real market data
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold bg-muted text-muted-foreground border border-border"
      title="Estimated from clinic-published price lists. No community quotes yet."
    >
      <FileText className="size-3" /> Listed estimate
    </span>
  );

const ResultCard = ({
  m,
  unlocked,
  assessment,
  rank,
}: {
  m: MatchResult;
  unlocked: boolean;
  assessment: AssessmentData;
  rank: number;
}) => {
  const isTop = rank === 1;
  const c = m.clinic;
  const showRange = unlocked && m.sample_size > 0;
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
            <h3 className="text-xl font-bold">{c.name}</h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${TIER_STYLE[c.tier]}`}
            >
              {c.tier}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" /> {c.city}, {c.country}
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
            {m.match_score}%
          </div>
          <div className="text-xs text-muted-foreground font-semibold">match</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-primary-soft p-4 space-y-1.5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Estimated total
          </div>
          <div className="text-2xl font-bold text-primary tabular-nums leading-none">
            €{m.estimated_price.toLocaleString()}
          </div>
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
  const [insights, setInsights] = useState<ClinicInsight[]>([]);
  const [unlocked, setUnlocked] = useState(storage.isUnlocked());
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [aiInsightsLoading, setAiInsightsLoading] = useState(false);
  const [aiInsightsError, setAiInsightsError] = useState<string | null>(null);

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
      const [{ data: cs }, { data: ag }, { data: ins }] = await Promise.all([
        supabase.from("clinics").select("*"),
        supabase.from("aggregated_pricing").select("*"),
        supabase.from("clinic_insights").select("*"),
      ]);
      setClinics((cs ?? []) as Clinic[]);
      setAggregated((ag ?? []) as AggregatedRow[]);
      setInsights((ins ?? []) as ClinicInsight[]);
      setLoading(false);
      loadAiInsights();
    })();
  }, [navigate]);

  const matches = useMemo(() => {
    if (!assessment || !clinics.length) return [];
    return runMatching(assessment, clinics, aggregated, insights);
  }, [assessment, clinics, aggregated, insights]);

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
                <h1 className="text-3xl md:text-4xl font-bold">Your top matches</h1>
                <p className="text-muted-foreground mt-1">
                  Ranked by price fit, treatment match, geography and quality.
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
              <div className="rounded-2xl border-2 border-accent/40 bg-accent-soft p-4 mb-6 flex items-center gap-3">
                <Sparkles className="size-5 text-accent" />
                <div className="text-sm">
                  <span className="font-semibold">You contributed — here's your reward:</span>{" "}
                  exact community price ranges are now visible.
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="container py-10">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Calculating matches…</div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 md:[&>*:first-child]:md:col-span-2">
                {matches.map((m, i) => (
                  <ResultCard
                    key={m.clinic.id}
                    m={m}
                    unlocked={unlocked}
                    assessment={assessment!}
                    rank={i + 1}
                  />
                ))}
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
