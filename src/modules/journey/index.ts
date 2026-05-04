// Public surface for the journey module — selector, progress rail, explainer.
export { JourneySelector } from "./components/JourneySelector";
export { JourneyProgress, type JourneyStage } from "./components/JourneyProgress";
export { WhyYouSeeThis } from "./components/WhyYouSeeThis";
// Re-export the proven primitives so all journey UI is reachable from one path.
export { JourneyHeader } from "@/components/shared/JourneyHeader";
export { JourneyResumeBanner } from "@/components/shared/JourneyResumeBanner";
export { TransparencyBlock } from "@/components/shared/TransparencyBlock";
export { WhatIsThis } from "@/components/shared/WhatIsThis";
export { useJourneyState, getActiveJourney, clearActiveJourney } from "@/hooks/useJourneyState";
