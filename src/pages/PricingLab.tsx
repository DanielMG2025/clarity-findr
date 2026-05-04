import { PricingConfigurator } from "@/modules/pricing-configurator";

const PricingLab = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">

      <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
      <main className="container max-w-6xl py-10 pb-20 space-y-6">
        <PricingConfigurator />
      </main>

    </div>
  );
};

export default PricingLab;
