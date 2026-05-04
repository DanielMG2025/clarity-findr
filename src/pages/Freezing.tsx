import { Link } from "react-router-dom";
import { ArrowRight, Snowflake, CalendarClock, Calculator } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JourneyHeader } from "@/components/shared/JourneyHeader";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { WhatIsThis } from "@/components/shared/WhatIsThis";

const Freezing = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <SiteHeader />
    <JourneyHeader
      module="Egg freezing"
      title="Freeze eggs on your timeline"
      subtitle="Understand timing, costs and outcomes — without medical pressure."
      steps={[{ label: "Why & when" }, { label: "Costs" }, { label: "Find a clinic" }]}
      current={0}
    />
    <main className="container max-w-3xl pb-20 space-y-6">
      <Card className="p-8 space-y-4">
        <Snowflake className="size-10 text-primary" />
        <h2 className="text-xl font-bold">When freezing makes sense</h2>
        <p className="text-sm text-muted-foreground">
          Egg quality declines with age. Freezing in your late 20s or early 30s preserves more options for later.{" "}
          <WhatIsThis title="Success rates">
            ~10–15 frozen eggs at age 32 give roughly a 70% chance of one live birth later. The number drops
            sharply after 38. We show realistic projections — never inflated marketing.
          </WhatIsThis>
        </p>
      </Card>

      <Card className="p-8 space-y-4">
        <div className="flex items-center gap-2"><CalendarClock className="size-5 text-primary" /> <h2 className="font-semibold">Typical timeline</h2></div>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3"><span className="font-bold text-primary">1.</span> Initial consultation & hormone tests (1 week)</li>
          <li className="flex gap-3"><span className="font-bold text-primary">2.</span> Stimulation phase (10–14 days)</li>
          <li className="flex gap-3"><span className="font-bold text-primary">3.</span> Retrieval procedure (~30 min)</li>
          <li className="flex gap-3"><span className="font-bold text-primary">4.</span> Annual storage</li>
        </ol>
      </Card>

      <Card className="p-8 space-y-3">
        <div className="flex items-center gap-2"><Calculator className="size-5 text-primary" /><h2 className="font-semibold">Typical costs</h2></div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Cycle</div><div className="font-bold tabular-nums">€3,500–5,000</div></div>
          <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Medication</div><div className="font-bold tabular-nums">€1,000–2,000</div></div>
          <div className="rounded-lg bg-muted p-3"><div className="text-xs text-muted-foreground">Storage / yr</div><div className="font-bold tabular-nums">€300–600</div></div>
        </div>
      </Card>

      <TransparencyBlock variant="calculation">
        Numbers are based on real patient reports across Spain, Portugal and Czech Republic. Your actual quote
        will depend on the clinic and your specific protocol.
      </TransparencyBlock>

      <Card className="p-6 flex items-center justify-between">
        <div>
          <div className="font-semibold">See clinics that specialize in freezing</div>
          <div className="text-sm text-muted-foreground">Ranked for your age and location.</div>
        </div>
        <Button asChild><Link to="/results">See clinics <ArrowRight className="size-4" /></Link></Button>
      </Card>
    </main>
    <SiteFooter />
  </div>
);

export default Freezing;
