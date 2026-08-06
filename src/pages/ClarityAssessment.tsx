import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Wallet, Building2, Stethoscope, Heart, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/patient/PageHeader";
import { ConfidenceBadge, type ConfidenceLevel } from "@/components/patient/ConfidenceBadge";
import { WhyDisclosure, WhyLine } from "@/components/patient/WhyDisclosure";
import { useMasterRecord, usePatientJourney } from "@/modules/master-record";
import { BLOCKS, blockProgressMPR, overallCompletionMPR } from "@/modules/patient-profile";
import { byCode } from "@/modules/regulatory";
import { SuccessOrientationCard } from "@/components/patient/SuccessOrientationCard";
import { RegulatoryFrameworkPanel } from "@/components/patient/RegulatoryFrameworkPanel";
import { EvidenceBasePanel } from "@/components/patient/EvidenceBasePanel";

/** A single legible segment of the situation summary. */
function SummaryChip({
  icon: Icon,
  label,
  value,
  muted,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/70 px-3.5 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`truncate text-sm ${muted ? "text-muted-foreground" : "font-medium text-foreground"}`}>{value}</div>
      </div>
    </div>
  );
}

function ExplainBlock({
  why,
  influences,
  missing,
  doctor,
}: {
  why: string;
  influences: string;
  missing: string;
  doctor: string;
}) {
  return (
    <WhyDisclosure className="mt-4">
      <WhyLine label="Why">{why}</WhyLine>
      <WhyLine label="Data influencing this">{influences}</WhyLine>
      <WhyLine label="Missing to refine">{missing}</WhyLine>
      <WhyLine label="What to confirm with a doctor">{doctor}</WhyLine>
    </WhyDisclosure>
  );
}

/** One of the three supporting cards — same shell, same rhythm, same button. */
function SupportingCard({
  icon: Icon,
  eyebrow,
  title,
  emphasis,
  body,
  explain,
  cta,
}: {
  icon: typeof Wallet;
  eyebrow: string;
  title: string;
  emphasis?: boolean;
  body: React.ReactNode;
  explain: React.ComponentProps<typeof ExplainBlock>;
  cta: { to: string; label: string; icon?: typeof Heart };
}) {
  const CtaIcon = cta.icon;
  return (
    <Card className={`flex h-full flex-col p-6 ${emphasis ? "ring-1 ring-primary/20" : ""}`}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${emphasis ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</div>
          <h3 className="text-base font-semibold leading-tight">{title}</h3>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-auto">
        <ExplainBlock {...explain} />
        <Button asChild size="sm" variant="outline" className="mt-4 gap-1.5">
          <Link to={cta.to}>
            {CtaIcon && <CtaIcon className="size-3.5" />} {cta.label} <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export default function ClarityAssessment() {
  const mpr = useMasterRecord();
  const patchDerived = useMasterRecord((s) => s.patchDerived);
  const journey = usePatientJourney();
  const completion = overallCompletionMPR(mpr);

  const { identity, intent } = mpr;
  const countryLabel = identity.country_of_residence ? byCode(identity.country_of_residence)?.label : undefined;

  // Presentation-only: how sure we are, derived from how complete the story is.
  const summaryConfidence: ConfidenceLevel = completion > 75 ? "high" : completion >= 40 ? "medium" : "low";

  // Persist the regulatory orientation into the MPR (derived.orientation), so
  // Costs and Clinics can gate on it without recomputing. Keyed on the engine's
  // inputs to avoid a write→recompute loop.
  const regulatory = journey.step0_regulatory;
  useEffect(() => {
    patchDerived({ orientation: regulatory });
  }, [identity.country_of_residence, identity.family_structure, intent.treatment_interest, patchDerived]); // eslint-disable-line react-hooks/exhaustive-deps

  const nudges = BLOCKS
    .map((b) => ({ b, p: blockProgressMPR(b.key, mpr) }))
    .filter((x) => x.p < 60)
    .slice(0, 3);

  return (
    <div className="container max-w-6xl space-y-10 py-10">
      <PageHeader
        eyebrow="My orientation"
        title="From uncertainty to clarity"
        subtitle="One explainable, confidential view of your situation — the clinical factors and the legal framework where you live."
        note="Every block tells you why you see what you see, and what data influences it."
      />

      {/* Profile summary + completion */}
      <Card className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Your situation summary</div>
            <ConfidenceBadge level={summaryConfidence} />
          </div>
          <Link to="/situacion" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Edit my story <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          <SummaryChip
            icon={CalendarDays}
            label="Age"
            value={identity.age ? `${identity.age} years old` : "Not shared yet"}
            muted={!identity.age}
          />
          <SummaryChip
            icon={MapPin}
            label="Country of residence"
            value={countryLabel || "Not shared yet"}
            muted={!countryLabel}
          />
          <SummaryChip
            icon={Sparkles}
            label="Treatment of interest"
            value={intent.treatment_interest ? intent.treatment_interest.replace(/_/g, " ") : "Not selected yet"}
            muted={!intent.treatment_interest}
          />
        </div>

        <div className="mt-5 space-y-2">
          <Progress value={completion} className="h-2" />
          <p className="text-xs text-muted-foreground">{completion}% complete · the more you share, the sharper the orientation.</p>
        </div>

        {nudges.length > 0 && (
          <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
            {nudges.map(({ b }) => (
              <Link
                key={b.key}
                to="/situacion"
                className="rounded-xl border border-border/70 bg-background/60 p-3 transition-smooth hover:border-primary/50"
              >
                <div className="text-xs font-medium">Add: {b.title}</div>
                <div className="line-clamp-2 text-[11px] text-muted-foreground">{b.subtitle}</div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Two equal halves: clinical success factors + legal framework */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <SuccessOrientationCard />
        <RegulatoryFrameworkPanel orientation={regulatory} />
      </div>

      {/* Supporting routes: costs, clinics, expert */}
      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        <SupportingCard
          icon={Wallet}
          eyebrow="Approximate cost"
          title="Investment range"
          body={
            <>
              Ranges for basic, premium and guarantee scenarios, based on the factors you've shared —
              and limited to the countries your legal framework allows.
            </>
          }
          explain={{
            why: "So you know the order of magnitude before requesting clinic quotes.",
            influences: "Country, treatment, age, need for ICSI, PGT-A or donor.",
            missing: completion < 60 ? "More medical data and preferences would refine the range." : "Sufficient data coverage.",
            doctor: "The actual treatment suitability and recommended add-ons for your case.",
          }}
          cta={{ to: "/costes", label: "Open configurator" }}
        />

        <SupportingCard
          icon={Building2}
          eyebrow="Clinic fit"
          title="Clinics that may fit"
          body={
            <>
              Clinics with normalized prices and a transparent <em>why</em> — only in countries that are
              legally viable for your situation. You decide whether to reach out.
            </>
          }
          explain={{
            why: "To compare apples to apples: prices, experience and comparable treatments.",
            influences: "Legal framework, country, budget, priorities and treatment.",
            missing: "Your priorities and openness to travel refine the order.",
            doctor: "Any specific clinical criteria (protocol, medical team, techniques).",
          }}
          cta={{ to: "/clinicas", label: "See clinics" }}
        />

        <SupportingCard
          icon={Stethoscope}
          eyebrow="Expert guidance"
          title="When to talk to an expert"
          emphasis
          body={
            <>
              If your case has complex factors, contradictory data, or you simply want a second opinion
              before starting, talking to an independent professional can help.
            </>
          }
          explain={{
            why: "A conversation with an expert can clarify doubts that orientation alone cannot.",
            influences: "The complexity of your factors and the confidence you need to decide.",
            missing: "Not applicable — this is always optional and voluntary.",
            doctor: "Any diagnosis, treatment plan or medication.",
          }}
          cta={{ to: "/asesoramiento", label: "Find guidance", icon: Heart }}
        />
      </div>

      {/* Evidence base — cited, orientative statistics and typical routes */}
      <EvidenceBasePanel />

      {/* Disclaimer */}
      <Card className="border-dashed bg-muted/30 p-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Important notice:</span> Fertility Compass provides
          orientation based on public data, statistical models and information you choose to share.
          It does not replace a medical consultation, diagnosis or treatment recommendation. Any
          clinical decision should be made with a healthcare professional.
        </p>
      </Card>
    </div>
  );
}
