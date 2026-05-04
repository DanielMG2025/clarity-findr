import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, ShieldCheck, CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JourneyHeader } from "@/components/shared/JourneyHeader";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { WhatIsThis } from "@/components/shared/WhatIsThis";

const Donor = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SiteHeader />
    <JourneyHeader
      module="Donor"
      title="Become an egg donor"
      subtitle="Learn what donation means, eligibility and how to safely connect with verified clinics."
      steps={[{ label: "Understand" }, { label: "Eligibility" }, { label: "Connect" }]}
      current={0}
    />
    <main className="container max-w-3xl pb-20 space-y-6">
      <Card className="p-8 space-y-4">
        <HeartHandshake className="size-10 text-accent" />
        <h2 className="text-xl font-bold">What egg donation involves</h2>
        <p className="text-sm text-muted-foreground">
          You'll undergo a medical screening, hormonal stimulation (10–14 days) and a short retrieval procedure.
          Compensation varies by country.{" "}
          <WhatIsThis title="Compensation by country">
            EU rules require donation to be altruistic, but compensation for time/expenses is allowed.
            Spain: ~€1,000–1,200. Czech Republic: ~€800–1,000. UK: ~£750.
          </WhatIsThis>
        </p>
      </Card>

      <Card className="p-8 space-y-4">
        <h2 className="text-lg font-semibold">Quick eligibility check</h2>
        <ul className="space-y-2 text-sm">
          {[
            "Age between 18 and 35",
            "Good general health",
            "Non-smoker",
            "Healthy BMI (18–28)",
            "No serious genetic family history",
          ].map((c) => (
            <li key={c} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-accent" /> {c}</li>
          ))}
        </ul>
      </Card>

      <TransparencyBlock variant="data">
        We never store medical screening data. We connect you with vetted clinics who run their own
        confidential assessment. You decide if and when to proceed.
      </TransparencyBlock>

      <Card className="p-6 flex items-center justify-between">
        <div>
          <div className="font-semibold">Connect with a verified clinic</div>
          <div className="text-sm text-muted-foreground">Free, anonymous, no commitment.</div>
        </div>
        <Button asChild><Link to="/community">Continue <ArrowRight className="size-4" /></Link></Button>
      </Card>

      <Card className="p-5 flex items-center gap-3">
        <ShieldCheck className="size-5 text-primary" />
        <div className="text-sm text-muted-foreground">All donor information is anonymized end-to-end.</div>
      </Card>
    </main>
    <SiteFooter />
  </div>
);

export default Donor;
