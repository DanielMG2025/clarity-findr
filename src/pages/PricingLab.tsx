import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingConfigurator } from "@/modules/pricing-configurator";
import { usePatientJourney } from "@/modules/master-record";
import { RegulatoryGateNotice } from "@/components/patient/RegulatoryGateNotice";
import { PageHeader } from "@/components/patient/PageHeader";

const PricingLab = () => {
  const orientation = usePatientJourney().step0_regulatory;

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
      <Button asChild variant="ghost" size="sm" className="-mt-5 h-auto gap-1.5 px-0 text-primary hover:bg-transparent hover:text-primary/80">
        <Link to="/sources">See where these prices come from <ArrowRight className="size-3.5" /></Link>
      </Button>
      <RegulatoryGateNotice orientation={orientation} />
      <PricingConfigurator />
    </div>
  );
};

export default PricingLab;
