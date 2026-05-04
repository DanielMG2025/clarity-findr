// Pricing module — re-exports the existing configurator under the new module path
// so the rest of the app can `import { PricingConfigurator } from "@/modules/pricing"`.
export { PricingConfigurator, usePricingConfigurator, buildScenarios } from "@/modules/pricing-configurator";
export type { PricingProfile, Scenario, ScenarioBundle, ScenarioKey, TreatmentKey } from "@/modules/pricing-configurator";
export { usePricingStore, type PricingState } from "./store";
