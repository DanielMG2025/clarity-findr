import { Link } from "react-router-dom";
import { ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingConfigurator } from "@/modules/pricing-configurator";
import { useMasterRecord, usePatientJourney } from "@/modules/master-record";
import { overallCompletionMPR } from "@/modules/patient-profile";
import { RegulatoryGateNotice } from "@/components/patient/RegulatoryGateNotice";
import { PageHeader } from "@/components/patient/PageHeader";

const PricingLab = () => {
  const orientation = usePatientJourney().step0_regulatory;
  const mpr = useMasterRecord();
  const completion = overallCompletionMPR(mpr);
  const canPrice = completion >= 15;

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <div className="[&_h1]:font-display [&_h1]:font-medium [&_h1]:tracking-normal [&_h1]:text-4xl md:[&_h1]:text-5xl [&_.tracking-wider]:tracking-[0.18em]">
        <PageHeader
          eyebrow="My costs"
          title="What you could really expect to pay"
          subtitle="Normalized ranges per scenario, with what's typically included — and what isn't."
          note="Every figure carries its source, its date and how confident we are about it."
        />
      </div>
      {!canPrice ? (
        <Card className="rounded-2xl border-primary/20 bg-primary-soft/25 p-8 text-center">
          <Calculator className="mx-auto size-8 text-primary" />
          <h2 className="mt-3 text-xl font-semibold">Complete your situation to see cost ranges</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Cost ranges are personalized with your profile — the treatment you're considering, where you are and what's already in your situation. Add the basics that feel comfortable and this page will fill in.
          </p>
          <Button asChild className="no-print mt-5">
            <Link to="/situacion">Complete my situation</Link>
          </Button>
        </Card>
      ) : (
        <>
          <Button asChild variant="ghost" size="sm" className="-mt-5 h-auto gap-1.5 px-0 text-primary hover:bg-transparent hover:text-primary/80">
            <Link to="/sources">See where these prices come from <ArrowRight className="size-3.5" /></Link>
          </Button>
          <RegulatoryGateNotice orientation={orientation} />
          <PricingConfigurator />
        </>
      )}
    </div>
  );
};

export default PricingLab;
