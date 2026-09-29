import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CircleAlert, ExternalLink, FileText, Route, Scale, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/patient/PageHeader";
import { EvidencePopover } from "@/components/patient/EvidencePopover";
import { SourceChip } from "@/components/patient/SourceChip";
import { ConfidenceBadge } from "@/components/patient/ConfidenceBadge";
import { WhyDisclosure, WhyLine } from "@/components/patient/WhyDisclosure";
import { useMasterRecord, usePatientJourney } from "@/modules/master-record";
import { EVIDENCE_SOURCE_MAP, type RouteHint } from "@/modules/evidence";
import {
  SOURCES as EVIDENCE_CITATION_SOURCES,
  citation,
  ownEggCitationForAge,
  type Citation,
  type Source,
} from "@/modules/evidence/citations";
import { seedEstimateForProfile, type PriceEstimate, type SourceKind } from "@/modules/provenance";
import { usePricingConfigurator } from "@/modules/pricing-configurator";
import { PRICING_SOURCE_CATEGORIES } from "@/modules/pricing-configurator/components/DataSourcesPanel";
import type { Verdict } from "@/modules/regulatory";

const ROUTE_LABEL: Record<RouteHint["route"], string> = {
  ivf_own: "IVF with your own eggs",
  ivf_donor: "IVF with donor eggs",
  icsi: "ICSI (sperm microinjection)",
  further_testing: "Further diagnostic testing",
};

const PRICE_KIND_LABEL: Record<SourceKind, string> = {
  scraped_web: "Published clinic price",
  aggregator: "Public price comparator",
  public_report: "Public market report",
  crowd: "Patient-shared price",
  b2b: "Clinic rate card",
  scientific: "Reviewed scientific source",
};

const VERDICT_LABEL: Record<Verdict, string> = {
  allowed: "Allowed",
  not_allowed: "Not allowed",
  unknown: "Unknown",
};

const VERDICT_CLASS: Record<Verdict, string> = {
  allowed: "border-primary/30 bg-primary-soft text-primary",
  not_allowed: "border-destructive/30 bg-destructive/10 text-destructive",
  unknown: "border-border bg-muted/40 text-muted-foreground",
};

function formatEuro(value: number) {
  return `€${Math.round(value).toLocaleString()}`;
}

function evidenceConfidence(kind: string): "high" | "medium" | "low" {
  return kind === "registry" ? "high" : "medium";
}

/** Rows of Table 1 — own-egg pregnancy rate by age band, in published order. */
const OWN_EGG_BAND_IDS = ["pr_own_18_34", "pr_own_35_37", "pr_own_38_39", "pr_own_40_42", "pr_own_43_44"];

/** Rows of Table 2 — the other published figures in the evidence file. */
const OTHER_FIGURE_IDS = ["pr_donor", "pr_fet", "pr_blastocyst", "cumulative_3_cycles"];

type CitedRow = Citation & { source: Source };

/** Read-only: pulls the existing citations by id, in the given order. */
function citedRows(ids: string[]): CitedRow[] {
  return ids
    .map((id) => citation(id))
    .filter((row): row is CitedRow => row !== undefined);
}

/** Short band label from the claim text, e.g. "…ages 18–34" → "18–34". */
function ageBandLabel(claim: string) {
  const match = claim.match(/ages\s+(.+)$/i);
  return match ? match[1] : claim;
}

/** Small secondary source line + "verify at source" link, once per distinct source. */
function SourceFootnote({ rows }: { rows: CitedRow[] }) {
  const sources = new Map<string, Source>();
  for (const row of rows) {
    if (!sources.has(row.source.id)) sources.set(row.source.id, row.source);
  }
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      {[...sources.values()].map((source) => (
        <span key={source.id} className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>{source.publisher} · {source.year}</span>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground underline decoration-border underline-offset-2 hover:text-primary"
            >
              Verify at source <ExternalLink className="size-3" />
            </a>
          )}
        </span>
      ))}
    </div>
  );
}

function shortEvidenceSource(label: string) {
  return label.split("—")[0]?.split("·")[0]?.trim() || label;
}

function routeSourceFor(label: string) {
  return [...EVIDENCE_SOURCE_MAP.values()].find((source) => source.label === label);
}

function sourceDateFromEstimate(estimate: PriceEstimate) {
  const dates = estimate.citations.map((item) => item.observed_at).filter(Boolean);
  return [...new Set(dates)].join(", ") || "not dated";
}

export default function SourcesDossier() {
  const journey = usePatientJourney();
  const patientAge = useMasterRecord((state) => state.identity.age);
  const { profile, bundle } = usePricingConfigurator();
  const evidence = journey.step2_orientation.evidence;
  const orientation = journey.step0_regulatory;

  const evidenceFigures = useMemo(() => {
    return [
      {
        label: "With your own eggs (per transfer)",
        citationId: patientAge != null ? ownEggCitationForAge(patientAge) : "br_own_avg",
      },
      { label: "With donor eggs (per transfer)", citationId: "pr_donor" },
      { label: "With a frozen embryo transfer", citationId: "pr_fet" },
      { label: "Across three complete cycles", citationId: "cumulative_3_cycles" },
    ];
  }, [patientAge]);

  const evidenceSources = useMemo(() => {
    const map = new Map<string, { label: string; url?: string; detail?: string; date?: string; confidence: "high" | "medium" | "low" }>();

    for (const figure of evidenceFigures) {
      const item = citation(figure.citationId);
      if (!item) continue;
      map.set(item.source.id, {
        label: item.source.title,
        url: item.source.url,
        detail: item.source.scope,
        date: item.source.year,
        confidence: evidenceConfidence(item.source.kind),
      });
    }

    for (const route of evidence.routes) {
      const source = routeSourceFor(route.citation.label);
      const key = source?.id ?? route.citation.label;
      map.set(key, {
        label: route.citation.label,
        url: route.citation.url,
        detail: source?.usage_note ?? route.citation.locator,
        date: source?.as_of ?? "current",
        confidence: source?.kind === "scientific" ? "medium" : "high",
      });
    }

    for (const source of Object.values(EVIDENCE_CITATION_SOURCES)) {
      if (!map.has(source.id)) continue;
      map.set(source.id, {
        label: source.title,
        url: source.url,
        detail: source.scope,
        date: source.year,
        confidence: evidenceConfidence(source.kind),
      });
    }

    return [...map.values()];
  }, [evidence.routes, evidenceFigures]);

  const priceEstimate = useMemo(
    () => bundle.estimate ?? seedEstimateForProfile(profile.treatment, profile.country),
    [bundle.estimate, profile.country, profile.treatment],
  );
  const priceCitations = bundle.citations ?? priceEstimate?.citations ?? [];
  const hasPriceEstimate = !!priceEstimate && !priceEstimate.empty;

  return (
    <div className="container max-w-6xl space-y-8 py-10">
      <PageHeader
        eyebrow="Full transparency"
        title="Every source behind your orientation"
        subtitle="Every figure here carries its source, its date, how confident we are — and what it does not tell you. This is the whole product: not just the answer, the full file behind it."
      />

      <Card className="space-y-5 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <BookOpen className="size-5" />
            </span>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Evidence</div>
              <h2 className="text-base font-semibold">Published clinical figures and route context</h2>
            </div>
          </div>
          <ConfidenceBadge level="high" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {evidenceFigures.map((figure) => {
            const item = citation(figure.citationId);
            return (
              <div key={figure.citationId} className="rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">{figure.label}</div>
                    {item && (
                      <SourceChip
                        source={shortEvidenceSource(item.source.publisher)}
                        date={item.source.year}
                        confidence={evidenceConfidence(item.source.kind)}
                        detail={item.source.scope}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <EvidencePopover citationId={figure.citationId} />
                    {item?.pending_review && (
                      <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning-foreground">
                        Pending clinical review
                      </Badge>
                    )}
                  </div>
                </div>
                {item && (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">What this figure doesn't tell you:</span> {item.caveat}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <Route className="size-3.5" /> Route citations
          </div>
          {evidence.routes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Share your age and ovarian reserve to see route context.</p>
          ) : (
            <ul className="grid gap-2 md:grid-cols-2">
              {evidence.routes.map((route) => {
                const source = routeSourceFor(route.citation.label);
                return (
                  <li key={route.route} className="rounded-xl border border-border/70 bg-muted/25 p-3">
                    <div className="text-sm font-medium">{ROUTE_LABEL[route.route]}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <SourceChip
                        source={route.citation.label}
                        date={source?.as_of ?? "current"}
                        confidence="medium"
                        detail={source?.usage_note ?? route.citation.locator}
                      />
                      {route.citation.url && (
                        <a href={route.citation.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          Open source <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">Locator:</span> {route.citation.locator}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {evidenceSources.length > 0 && (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <FileText className="size-3.5" /> Distinct sources in this evidence file
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {evidenceSources.map((source) => (
                <li key={`${source.label}-${source.date}`} className="text-xs">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {source.label}
                    </a>
                  ) : (
                    <span className="text-foreground">{source.label}</span>
                  )}
                  <span className="text-muted-foreground"> · {source.date} · {source.confidence} confidence</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <WhyDisclosure label="How to read this evidence">
          <WhyLine label="What it is">Published population evidence mapped to your broad age and reserve segment.</WhyLine>
          <WhyLine label="What it is not">A diagnosis, a personalised probability or a treatment recommendation.</WhyLine>
        </WhyDisclosure>
      </Card>

      <Card className="space-y-5 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Wallet className="size-5" />
            </span>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Costs</div>
              <h2 className="text-base font-semibold">Price sources behind the range</h2>
            </div>
          </div>
          {hasPriceEstimate && <ConfidenceBadge level={priceEstimate.confidence} />}
        </div>

        {hasPriceEstimate ? (
          <div className="rounded-xl border border-primary/15 bg-primary-soft/25 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Published range</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums">
                  {formatEuro(priceEstimate.range_min)}–{formatEuro(priceEstimate.range_max)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Central estimate</div>
                <div className="mt-1 text-lg font-semibold tabular-nums">{formatEuro(priceEstimate.expected)}</div>
              </div>
            </div>
            <div className="mt-3">
              <SourceChip
                source="Public market guides"
                date={sourceDateFromEstimate(priceEstimate)}
                confidence={priceEstimate.confidence}
                detail="The range is assembled from the citations listed below and is orientative, not a clinic quote."
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              We do not have enough published price data for this exact profile yet, so no number is shown here.
            </p>
          </div>
        )}

        {priceCitations.length > 0 ? (
          <ul className="space-y-2">
            {priceCitations.map((source) => (
              <li key={`${source.source_id}-${source.observed_at}-${source.amount_eur}`} className="rounded-xl border border-border/70 bg-background/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{PRICE_KIND_LABEL[source.source_kind]}</div>
                    <SourceChip
                      source={source.label ?? source.source_id}
                      date={source.observed_at}
                      confidence={priceEstimate?.confidence ?? "low"}
                      detail={`This source contributes ${Math.round(source.weight * 100)}% of the cited aggregate weight.`}
                    />
                  </div>
                  <div className="text-sm font-semibold tabular-nums">{formatEuro(source.amount_eur)}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRICING_SOURCE_CATEGORIES.map(({ Icon, title, desc }) => (
              <li key={title} className="flex gap-3 rounded-xl border border-border/70 bg-background/70 p-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">{title}</div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 rounded-xl border border-warning/30 bg-warning/15 p-4 text-xs leading-relaxed">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">What this price doesn't tell you:</span> Published prices are usually per cycle, usually excluding medication, storage, travel and case-specific add-ons. Only a clinic quote can confirm your total.
          </p>
        </div>

        <WhyDisclosure label="How to read this range">
          <WhyLine label="Source path">The dossier uses the same published price estimate and citations consumed by the costs page.</WhyLine>
          <WhyLine label="Limit">It is orientation only: prices change, inclusions vary and clinics decide the final quote.</WhyLine>
        </WhyDisclosure>
      </Card>

      <Card className="space-y-5 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Scale className="size-5" />
            </span>
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Regulatory framework</div>
              <h2 className="text-base font-semibold">Legal context behind your orientation</h2>
            </div>
          </div>
          <ConfidenceBadge level="medium" />
        </div>

        {orientation ? (
          <>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <SourceChip
                source="European Atlas of Fertility Treatment Policies"
                date={orientation.source.as_of}
                confidence="medium"
                detail={orientation.source.note}
              />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{orientation.headline}</p>
            </div>

            <ul className="space-y-2">
              {orientation.results.map((result) => (
                <li key={result.need} className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{result.label}</span>
                    <Badge variant="outline" className={VERDICT_CLASS[result.verdict]}>
                      {VERDICT_LABEL[result.verdict]}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{result.why}</p>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              {orientation.home.verify && (
                <p className="rounded-xl border border-warning/30 bg-warning/15 p-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">What this does not settle:</span> {orientation.home.verify}
                </p>
              )}
              <p className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Subject to change:</span> {orientation.disclaimer}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Add your country of residence and family situation to see the regulatory source file for your orientation.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3 gap-1.5">
              <Link to="/situacion">Complete my situation <ArrowRight className="size-3.5" /></Link>
            </Button>
          </div>
        )}

        <WhyDisclosure label="How to read this framework">
          <WhyLine label="What it is">A public-policy snapshot used as the first gate before cost or clinic orientation.</WhyLine>
          <WhyLine label="What it is not">Legal advice or a guarantee that a clinic will accept a specific case.</WhyLine>
        </WhyDisclosure>
      </Card>

      <Card className="rounded-2xl border-primary/15 bg-primary-soft/25 p-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          A search engine, an AI or a forum will give you a number. We give you the number, where it came from, how old it is, how sure we are, and what it leaves out. That's the difference.
        </p>
      </Card>
    </div>
  );
}