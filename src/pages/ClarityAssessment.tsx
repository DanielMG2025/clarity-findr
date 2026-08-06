import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Wallet, Building2, Stethoscope, Heart, Info } from "lucide-react";
import { PageHeader } from "@/components/patient/PageHeader";
import { useMasterRecord, usePatientJourney } from "@/modules/master-record";
import { BLOCKS, blockProgressMPR, overallCompletionMPR } from "@/modules/patient-profile";
import { byCode } from "@/modules/regulatory";
import { SuccessOrientationCard } from "@/components/patient/SuccessOrientationCard";
import { RegulatoryFrameworkPanel } from "@/components/patient/RegulatoryFrameworkPanel";
import { EvidenceBasePanel } from "@/components/patient/EvidenceBasePanel";

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
    <details className="text-xs text-muted-foreground mt-3">
      <summary className="cursor-pointer font-semibold text-foreground inline-flex items-center gap-1">
        <Info className="size-3.5" /> Why we see this
      </summary>
      <div className="mt-2 space-y-1.5 leading-relaxed">
        <p><strong>Why:</strong> {why}</p>
        <p><strong>Data influencing this:</strong> {influences}</p>
        <p><strong>Missing to refine:</strong> {missing}</p>
        <p><strong>What to confirm with a doctor:</strong> {doctor}</p>
      </div>
    </details>
  );
}

export default function ClarityAssessment() {
  const mpr = useMasterRecord();
  const patchDerived = useMasterRecord((s) => s.patchDerived);
  const journey = usePatientJourney();
  const completion = overallCompletionMPR(mpr);

  const { identity, intent } = mpr;
  const countryLabel = identity.country_of_residence ? byCode(identity.country_of_residence)?.label : undefined;

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
    <div className="container max-w-6xl py-10 space-y-8">
      <PageHeader
        eyebrow="My orientation"
        title="From uncertainty to clarity"
        subtitle="One explainable, confidential view of your situation — the clinical factors and the legal framework where you live."
        note="Every block tells you why you see what you see, and what data influences it."
      />

      {/* Profile summary + completion */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your situation summary</div>
            <div className="text-lg font-bold">
              {identity.age ? `${identity.age} years old` : "Age not shared"} · {countryLabel || "Country not shared"} · {intent.treatment_interest ? intent.treatment_interest.replace(/_/g, " ").toUpperCase() : "No treatment selected"}
            </div>
          </div>
          <Link to="/situacion" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
            Edit my story <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Progress value={completion} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{completion}% complete · the more you share, the sharper the orientation.</p>

        {nudges.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-3 gap-2">
            {nudges.map(({ b }) => (
              <Link key={b.key} to="/situacion" className="rounded-lg border p-3 hover:border-primary/50 transition-smooth bg-background/60">
                <div className="text-xs font-semibold">Add: {b.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{b.subtitle}</div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Two equal halves: clinical success factors + legal framework */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <SuccessOrientationCard />
        <RegulatoryFrameworkPanel orientation={regulatory} />
      </div>

      {/* Supporting routes: costs, clinics, expert */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Cost estimate card */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center size-9 rounded-xl bg-accent-soft text-accent"><Wallet className="size-5" /></span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approximate cost</div>
              <h3 className="font-bold text-lg">Investment range</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ranges for <strong>basic</strong>, <strong>premium</strong> and <strong>guarantee</strong>
            scenarios, based on the factors you've shared — and limited to the countries your legal
            framework allows.
          </p>
          <ExplainBlock
            why="So you know the order of magnitude before requesting clinic quotes."
            influences="Country, treatment, age, need for ICSI, PGT-A or donor."
            missing={completion < 60 ? "More medical data and preferences would refine the range." : "Sufficient data coverage."}
            doctor="The actual treatment suitability and recommended add-ons for your case."
          />
          <Button asChild size="sm" className="mt-4 gap-1"><Link to="/costes">Open configurator <ArrowRight className="size-3.5" /></Link></Button>
        </Card>

        {/* Clinic fit */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center size-9 rounded-xl bg-primary-soft text-primary"><Building2 className="size-5" /></span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clinic fit</div>
              <h3 className="font-bold text-lg">Clinics that may fit</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Clinics with normalized prices and a transparent <em>why</em> — only in countries that are
            legally viable for your situation. You decide whether to reach out.
          </p>
          <ExplainBlock
            why="To compare apples to apples: prices, experience and comparable treatments."
            influences="Legal framework, country, budget, priorities and treatment."
            missing="Your priorities and openness to travel refine the order."
            doctor="Any specific clinical criteria (protocol, medical team, techniques)."
          />
          <Button asChild size="sm" variant="outline" className="mt-4 gap-1"><Link to="/clinicas">See clinics <ArrowRight className="size-3.5" /></Link></Button>
        </Card>

        {/* Expert guidance */}
        <Card className="p-6 bg-primary-soft/30 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground"><Stethoscope className="size-5" /></span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Expert guidance</div>
              <h3 className="font-bold text-lg">When to talk to an expert</h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If your case has complex factors, contradictory data, or you simply want a second opinion
            before starting, talking to an independent professional can help.
          </p>
          <ExplainBlock
            why="A conversation with an expert can clarify doubts that orientation alone cannot."
            influences="The complexity of your factors and the confidence you need to decide."
            missing="Not applicable — this is always optional and voluntary."
            doctor="Any diagnosis, treatment plan or medication."
          />
          <Button asChild size="sm" className="mt-4 gap-1"><Link to="/asesoramiento"><Heart className="size-3.5" /> Find guidance <ArrowRight className="size-3.5" /></Link></Button>
        </Card>
      </div>

      {/* Evidence base — cited, orientative statistics and typical routes */}
      <EvidenceBasePanel />

      {/* Disclaimer */}
      <Card className="p-6 bg-muted/30 border-dashed">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Important notice:</strong> Fertility Compass provides
          orientation based on public data, statistical models and information you choose to share.
          It does not replace a medical consultation, diagnosis or treatment recommendation. Any
          clinical decision should be made with a healthcare professional.
        </p>
      </Card>
    </div>
  );
}
