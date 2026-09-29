import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Check, CircleAlert, FileText, HelpCircle, Printer, Scale, TriangleAlert, UserRound, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfidenceBadge } from "@/components/patient/ConfidenceBadge";
import { SourceChip } from "@/components/patient/SourceChip";
import { useMasterRecord, usePatientJourney, type FactorKind, type TreatmentInterest } from "@/modules/master-record";
import { citation, ownEggCitationForAge, type Citation, type Source } from "@/modules/evidence/citations";
import { seedEstimateForProfile, type PriceEstimate } from "@/modules/provenance";
import { usePricingConfigurator } from "@/modules/pricing-configurator";
import { byCode, type FamilyStructure, type Verdict } from "@/modules/regulatory";

const OWN_EGG_BAND_IDS = ["pr_own_18_34", "pr_own_35_37", "pr_own_38_39", "pr_own_40_42", "pr_own_43_44"];
const OTHER_FIGURE_IDS = ["pr_donor", "pr_fet", "pr_blastocyst", "cumulative_3_cycles"];

type CitedRow = Citation & { source: Source };

const FAMILY_LABEL: Record<FamilyStructure, string> = {
  hetero_couple: "Heterosexual couple",
  female_couple: "Female couple",
  single_woman: "Single woman",
  male_couple: "Male couple",
  single_man: "Single man",
};

const TREATMENT_LABEL: Record<TreatmentInterest, string> = {
  ivf: "IVF",
  icsi: "ICSI",
  egg_donation: "Egg donation",
  social_freezing: "Egg freezing",
  iui: "IUI",
  unsure: "Not sure yet",
};

const FACTOR_META: Record<FactorKind, { label: string; className: string; Icon: typeof Check }> = {
  favorable: { label: "In your favour", className: "border-primary/25 bg-primary-soft/55 text-primary", Icon: Check },
  attention: { label: "To keep in mind", className: "border-warning/30 bg-warning/15 text-warning-foreground", Icon: TriangleAlert },
  missing: { label: "Missing", className: "border-border bg-muted/45 text-muted-foreground", Icon: HelpCircle },
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

function citedRows(ids: string[]): CitedRow[] {
  return ids.map((id) => citation(id)).filter((row): row is CitedRow => row !== undefined);
}

function ageBandLabel(claim: string) {
  return claim.match(/ages\s+(.+)$/i)?.[1] ?? claim;
}

function formatEuro(value: number) {
  return `€${Math.round(value).toLocaleString()}`;
}

function sourceDateFromEstimate(estimate: PriceEstimate) {
  const dates = estimate.citations.map((item) => item.observed_at).filter(Boolean);
  return [...new Set(dates)].join(", ") || "not dated";
}

function SectionHeading({ icon: Icon, eyebrow, title }: { icon: typeof UserRound; eyebrow: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
    </div>
  );
}

function SourceLines({ rows }: { rows: CitedRow[] }) {
  const sources = new Map<string, Source>();
  rows.forEach((row) => sources.set(row.source.id, row.source));
  return (
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
      {[...sources.values()].map((source) => (
        <span key={source.id}>{source.publisher} · {source.year}</span>
      ))}
    </div>
  );
}

export default function PatientReport() {
  const mpr = useMasterRecord();
  const journey = usePatientJourney();
  const { profile, bundle } = usePricingConfigurator();
  const orientation = journey.step0_regulatory;
  const patientAge = mpr.identity.age;
  const hasProfile = Boolean(
    patientAge ||
    mpr.identity.country_of_residence ||
    mpr.identity.family_structure ||
    mpr.intent.treatment_interest,
  );

  const ownEggRows = useMemo(() => citedRows(OWN_EGG_BAND_IDS), []);
  const otherFigureRows = useMemo(() => citedRows(OTHER_FIGURE_IDS), []);
  const yourBandId = patientAge != null ? ownEggCitationForAge(patientAge) : undefined;
  const combinedEvidenceCaveat = [
    ownEggRows[0]?.caveat,
    otherFigureRows.find((row) => row.id === "cumulative_3_cycles")?.caveat,
  ].filter(Boolean).join(" ");
  const priceEstimate = useMemo(
    () => bundle.estimate ?? seedEstimateForProfile(profile.treatment, profile.country),
    [bundle.estimate, profile.country, profile.treatment],
  );
  const hasPriceEstimate = Boolean(priceEstimate && !priceEstimate.empty);
  const reportDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const country = mpr.identity.country_of_residence ? byCode(mpr.identity.country_of_residence)?.label : undefined;

  const situationFields = [
    { label: "Age", value: patientAge?.toString() },
    { label: "Country of residence", value: country },
    { label: "Family situation", value: mpr.identity.family_structure ? FAMILY_LABEL[mpr.identity.family_structure] : undefined },
    { label: "Treatment of interest", value: mpr.intent.treatment_interest ? TREATMENT_LABEL[mpr.intent.treatment_interest] : undefined },
    { label: "Indicative budget", value: mpr.intent.budget_eur ? formatEuro(mpr.intent.budget_eur) : undefined },
  ];

  const sourceFooter = useMemo(() => {
    const sources = new Map<string, { label: string; date: string }>();
    [...ownEggRows, ...otherFigureRows].forEach((row) => {
      sources.set(row.source.id, { label: row.source.publisher, date: row.source.year });
    });
    priceEstimate?.citations.forEach((item) => {
      sources.set(`price-${item.source_id}`, { label: item.label ?? item.source_id, date: item.observed_at });
    });
    if (orientation) {
      sources.set("regulatory", { label: orientation.source.label, date: orientation.source.as_of });
    }
    return [...sources.values()];
  }, [orientation, otherFigureRows, ownEggRows, priceEstimate]);

  return (
    <div className="report-page mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <div className="no-print flex justify-end">
        <Button onClick={() => window.print()} className="gap-2 rounded-full">
          <Printer className="size-4" /> Download / Print PDF
        </Button>
      </div>

      <header className="report-document-header border-b border-primary/20 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Fertility Compass</div>
            <h1 className="text-3xl font-bold md:text-4xl">Personalized orientation report</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Orientation based on public data — not a diagnosis or a personalized prediction.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="text-[11px] font-medium uppercase tracking-wider">Prepared</div>
            <div className="mt-1 font-semibold text-foreground">{reportDate}</div>
          </div>
        </div>
      </header>

      {!hasProfile ? (
        <Card className="report-card rounded-2xl border-primary/20 bg-primary-soft/25 p-8 text-center">
          <AlertCircle className="mx-auto size-8 text-primary" />
          <h2 className="mt-3 text-xl font-semibold">Complete your situation to generate the full report</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Add the basics that feel comfortable. Your report will then bring your situation, factors, costs and regulatory context together.
          </p>
          <Button asChild className="no-print mt-5">
            <Link to="/situacion">Complete my situation</Link>
          </Button>
        </Card>
      ) : (
        <>
          <Card className="report-card space-y-5 rounded-2xl p-6">
            <SectionHeading icon={UserRound} eyebrow="Your situation" title="The details used for this orientation" />
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {situationFields.map((field) => (
                <div key={field.label} className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{field.label}</dt>
                  <dd className="mt-1 text-sm font-semibold">{field.value ?? "Not provided"}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="report-card space-y-5 rounded-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionHeading icon={Check} eyebrow="Your factors" title="What may influence your orientation" />
              <ConfidenceBadge level={journey.step2_orientation.confidence} />
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {journey.step2_orientation.factors.map((factor, index) => {
                const meta = FACTOR_META[factor.kind];
                const Icon = meta.Icon;
                return (
                  <li key={`${factor.title}-${index}`} className="rounded-xl border border-border/70 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.className}`}>
                        <Icon className="size-3" /> {meta.label}
                      </span>
                      <span className="text-sm font-semibold">{factor.title}</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{factor.why}</p>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs leading-relaxed text-muted-foreground">{journey.step2_orientation.confidence_reason}</p>
          </Card>

          <Card className="report-card space-y-6 rounded-2xl p-6">
            <SectionHeading icon={FileText} eyebrow="Evidence" title="The published figures behind your orientation" />

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">IVF pregnancy rate with own eggs, by age (HFEA)</h3>
              <div className="report-table overflow-x-auto rounded-xl border border-border/70">
                <Table className="min-w-[760px]">
                  <TableHeader><TableRow>
                    <TableHead className="w-[135px] text-xs">Age band</TableHead><TableHead className="w-[75px] text-xs">Rate</TableHead><TableHead className="text-xs">Cohort</TableHead><TableHead className="text-xs">Where in the source</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>{ownEggRows.map((row) => {
                    const yours = row.id === yourBandId;
                    return <TableRow key={row.id} className={yours ? "bg-primary-soft/70 hover:bg-primary-soft/70" : undefined}>
                      <TableCell className="whitespace-nowrap text-sm font-medium">{ageBandLabel(row.claim)}{yours && <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">your band</span>}</TableCell>
                      <TableCell className="text-sm font-semibold tabular-nums">{row.value}%</TableCell>
                      <TableCell className="text-xs leading-relaxed text-muted-foreground">{row.cohort}</TableCell>
                      <TableCell className="text-xs leading-relaxed text-muted-foreground">{row.locator}</TableCell>
                    </TableRow>;
                  })}</TableBody>
                </Table>
              </div>
              <SourceLines rows={ownEggRows} />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Other published figures (HFEA · ESHRE)</h3>
              <div className="report-table overflow-x-auto rounded-xl border border-border/70">
                <Table className="min-w-[800px]">
                  <TableHeader><TableRow>
                    <TableHead className="text-xs">Measure</TableHead><TableHead className="w-[75px] text-xs">Rate</TableHead><TableHead className="text-xs">Cohort</TableHead><TableHead className="text-xs">Where</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>{otherFigureRows.map((row) => <TableRow key={row.id}>
                    <TableCell className="text-sm font-medium">{row.claim}</TableCell>
                    <TableCell className="text-sm font-semibold tabular-nums">{row.value}%</TableCell>
                    <TableCell className="text-xs leading-relaxed text-muted-foreground">{row.cohort}</TableCell>
                    <TableCell className="text-xs leading-relaxed text-muted-foreground">{row.locator}</TableCell>
                  </TableRow>)}</TableBody>
                </Table>
              </div>
              <SourceLines rows={otherFigureRows} />
            </div>

            {combinedEvidenceCaveat && <div className="flex gap-2 rounded-xl border border-warning/30 bg-warning/15 p-4 text-xs leading-relaxed">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-muted-foreground"><span className="font-medium text-foreground">What these tables don't tell you:</span> {combinedEvidenceCaveat}</p>
            </div>}
          </Card>

          <Card className="report-card space-y-5 rounded-2xl p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SectionHeading icon={Wallet} eyebrow="Your costs" title="Published price orientation" />
              {hasPriceEstimate && priceEstimate && <ConfidenceBadge level={priceEstimate.confidence} />}
            </div>
            {hasPriceEstimate && priceEstimate ? <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-primary/15 bg-primary-soft/25 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Published range</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{formatEuro(priceEstimate.range_min)}–{formatEuro(priceEstimate.range_max)}</div>
                </div>
                <div className="rounded-xl border border-border/70 p-4">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Central estimate</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">{formatEuro(priceEstimate.expected)}</div>
                </div>
              </div>
              <SourceChip source="Public market guides" date={sourceDateFromEstimate(priceEstimate)} confidence={priceEstimate.confidence} detail="The same published estimate used on the Costs and Sources pages." />
            </> : <p className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">There is not enough published price data for this exact profile, so no number is shown.</p>}
            <div className="flex gap-2 rounded-xl border border-warning/30 bg-warning/15 p-4 text-xs leading-relaxed">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
              <p className="text-muted-foreground"><span className="font-medium text-foreground">What this price doesn't tell you:</span> Published prices are usually per cycle, usually excluding medication, storage, travel and case-specific add-ons. Only a clinic quote can confirm your total.</p>
            </div>
          </Card>

          <Card className="report-card space-y-5 rounded-2xl p-6">
            <SectionHeading icon={Scale} eyebrow="Regulatory framework" title="Legal context for your situation" />
            {orientation ? <>
              <div className="rounded-xl border border-border/70 p-4">
                <SourceChip source="European Atlas of Fertility Treatment Policies" date={orientation.source.as_of} confidence="medium" detail={orientation.source.note} />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{orientation.headline}</p>
              </div>
              <ul className="space-y-2">{orientation.results.map((result) => <li key={result.need} className="rounded-xl border border-border/70 p-3">
                <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{result.label}</span><Badge variant="outline" className={VERDICT_CLASS[result.verdict]}>{VERDICT_LABEL[result.verdict]}</Badge></div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{result.why}</p>
              </li>)}</ul>
              {orientation.home.verify && <p className="rounded-xl border border-warning/30 bg-warning/15 p-3 text-xs leading-relaxed text-muted-foreground"><span className="font-medium text-foreground">Confirm locally:</span> {orientation.home.verify}</p>}
              <p className="rounded-xl border border-border/70 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground"><span className="font-medium text-foreground">Subject to change:</span> {orientation.disclaimer}</p>
            </> : <p className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">Add your country of residence and family situation to include the regulatory framework.</p>}
          </Card>

          <footer className="report-card space-y-4 border-t border-primary/20 pt-6">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Sources</div>
              <h2 className="mt-1 text-lg font-semibold">Sources carried in this report</h2>
            </div>
            <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {sourceFooter.map((source) => <li key={`${source.label}-${source.date}`} className="text-xs leading-relaxed"><span className="font-medium text-foreground">{source.label}</span><span className="text-muted-foreground"> · {source.date}</span></li>)}
            </ul>
            <p className="rounded-xl border border-primary/15 bg-primary-soft/25 p-4 text-sm leading-relaxed text-muted-foreground">Every figure in this report carries its source. You don't need to leave this document to see the evidence.</p>
          </footer>
        </>
      )}
    </div>
  );
}
