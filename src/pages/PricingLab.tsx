import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { PricingConfigurator } from "@/modules/pricing-configurator";

const PricingLab = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="h-1.5 w-full bg-gradient-to-r from-primary to-accent" />
      <main className="container max-w-6xl py-10 pb-20 space-y-6">
        <PricingConfigurator />
      </main>
      <SiteFooter />
    </div>
  );
};

export default PricingLab;
