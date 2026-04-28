import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, MapPin, Star, TrendingUp, Sparkles, Lock, Info, Activity } from "lucide-react";
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

const ResultCard = ({
  m,
  unlocked,
  assessment,
}: {
  m: MatchResult;
  unlocked: boolean;
  assessment: AssessmentData;
}) => {
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
    <Card className="p-6 shadow-card hover:shadow-elegant transition-smooth bg-gradient-card border-2">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
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
        <div className="rounded-xl bg-primary-soft p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Estimated total
          </div>
          <div className="text-xl font-bold text-primary tabular-nums">
            {showRange ? (
              <>
                €{m.price_low.toLocaleString()} – €{m.price_high.toLocaleString()}
              </>
            ) : (
              <>€{m.estimated_price.toLocaleString()}</>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <ConfidencePill confidence={m.confidence} />
            {m.sample_size > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {m.sample_size} quote{m.sample_size === 1 ? "" : "s"}
              </span>
            )}
          </div>
          {priceLabel && (
            <div className="text-[11px] text-muted-foreground mt-1.5">{priceLabel}</div>
          )}
        </div>
        <div className="rounded-xl bg-accent-soft p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Clinic score
          </div>
          <div className="text-xl font-bold text-accent tabular-nums">{m.composite_score}/100</div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
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

      <ul className="space-y-1.5 text-sm text-muted-foreground mb-5">
        {m.explanations.slice(0, 3).map((e, i) => (
          <li key={i} className="flex gap-2">
            <Sparkles className="size-3.5 text-primary mt-0.5 shrink-0" />
            <span>{e}</span>
          </li>
        ))}
      </ul>

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
    })();
  }, [navigate]);

  const matches = useMemo(() => {
    if (!assessment || !clinics.length) return [];
    return runMatching(assessment, clinics, aggregated, insights);
  }, [assessment, clinics, aggregated, insights]);

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
              <div className="grid md:grid-cols-2 gap-6">
                {matches.map((m) => (
                  <ResultCard key={m.clinic.id} m={m} unlocked={unlocked} assessment={assessment!} />
                ))}
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

        <section className="container pb-10">
          <QuoteForm onSubmitted={refreshAggregated} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Results;
