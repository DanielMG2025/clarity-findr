import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Wallet, Building2, Stethoscope, Heart, Info, Compass } from "lucide-react";
import { useProfileStore } from "@/modules/profile/store";
import { usePatientProfileStore } from "@/modules/patient-profile/store";
import { overallCompletion, BLOCKS, blockProgress } from "@/modules/patient-profile/blocks";
import { SuccessOrientationCard } from "@/components/patient/SuccessOrientationCard";
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
  const profile = useProfileStore();
  const pp = usePatientProfileStore();
  const completion = overallCompletion(profile, pp);

  const nudges = BLOCKS
    .map((b) => ({ b, p: blockProgress(b.key, profile, pp) }))
    .filter((x) => x.p < 60)
    .slice(0, 3);

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      {/* Header */}
      <header className="space-y-3 max-w-3xl">
        <Badge variant="secondary" className="text-[11px]">Your clarity assessment</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
          <Compass className="size-7 text-primary" /> From uncertainty to clarity
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          A single, explainable and confidential view of your situation. Each block tells you
          <em> why</em> you see what you see and what data influences it.
        </p>
      </header>

      {/* Profile summary + completion */}
      <Card className="p-5 bg-gradient-card border-2">
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your situation summary</div>
            <div className="text-lg font-bold">
              {profile.age ? `${profile.age} years old` : "Age not shared"} · {profile.country || "Country not shared"} · {profile.treatment ? profile.treatment.toUpperCase() : "No treatment selected"}
            </div>
          </div>
          <Link to="/profile" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
            Edit my story <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Progress value={completion} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">{completion}% complete · the more you share, the sharper the orientation.</p>

        {nudges.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-3 gap-2">
            {nudges.map(({ b }) => (
              <Link key={b.key} to="/profile" className="rounded-lg border p-3 hover:border-primary/50 transition-smooth bg-background/60">
                <div className="text-xs font-semibold">Add: {b.title}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{b.subtitle}</div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Two-column: success orientation + supporting cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SuccessOrientationCard />

        <div className="space-y-6">
          {/* Cost estimate card */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="grid place-items-center size-9 rounded-xl bg-accent-soft text-accent"><Wallet className="size-5" /></span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approximate cost</div>
                <h3 className="font-bold text-lg">Estimated investment range</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We estimate ranges for <strong>basic</strong>, <strong>premium</strong> and
              <strong> guarantee</strong> scenarios, based on the factors you've shared. We show you
              what's typically included and what isn't.
            </p>
            <ExplainBlock
              why="So you know the order of magnitude before requesting clinic quotes."
              influences="Country, treatment, age, need for ICSI, PGT-A or donor."
              missing={completion < 60 ? "More medical data and preferences would refine the range." : "Sufficient data coverage."}
              doctor="The actual treatment suitability and recommended add-ons for your case."
            />
            <Button asChild size="sm" className="mt-4 gap-1"><Link to="/pricing-lab">Open configurator <ArrowRight className="size-3.5" /></Link></Button>
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
              Once you have orientation and costs, we show you clinics with normalized prices and a
              transparent <em>why</em> for every suggestion. You decide whether to reach out.
            </p>
            <ExplainBlock
              why="To compare apples to apples: prices, experience and comparable treatments."
              influences="Country, budget, priorities (cost, success, distance) and treatment."
              missing="Your priorities and openness to travel refine the order."
              doctor="Any specific clinical criteria (protocol, medical team, techniques)."
            />
            <Button asChild size="sm" variant="outline" className="mt-4 gap-1"><Link to="/clinics">See clinics <ArrowRight className="size-3.5" /></Link></Button>
          </Card>

          {/* Expert guidance */}
          <Card className="p-6 bg-primary-soft/30 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="grid place-items-center size-9 rounded-xl bg-primary text-primary-foreground"><Stethoscope className="size-5" /></span>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Expert guidance</div>
                <h3 className="font-bold text-lg">When it can make sense to talk to an expert</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If your case has complex factors, contradictory data, or you simply want a second
              opinion before starting treatment, talking to an independent professional can help.
            </p>
            <ExplainBlock
              why="A conversation with an expert can clarify doubts that orientation alone cannot."
              influences="The complexity of your factors and the confidence you need to decide."
              missing="Not applicable — this is always optional and voluntary."
              doctor="Any diagnosis, treatment plan or medication."
            />
            <Button asChild size="sm" className="mt-4 gap-1"><Link to="/partners"><Heart className="size-3.5" /> Find guidance <ArrowRight className="size-3.5" /></Link></Button>
          </Card>
        </div>
      </div>

      {/* Evidence base — cited, orientative statistics and typical routes */}
      <EvidenceBasePanel />

      {/* Disclaimer */}
      <Card className="p-5 bg-muted/30 border-dashed">
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
