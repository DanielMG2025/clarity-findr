import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { useMasterRecord } from "@/modules/master-record";
import {
  BLOCKS,
  blockProgressMPR,
  overallCompletionMPR,
  profileConfidence,
  FEATURES,
  ProfileCompletion,
  UnlockedFeatures,
  ProfileBlock,
  BasicInfoBlock,
  MedicalContextBlock,
  TreatmentHistoryBlock,
  PreferencesBlock,
  DocumentsBlock,
  SharedQuotesBlock,
} from "@/modules/patient-profile";
import { Calculator, Building2, ArrowRight, FileText, HeartHandshake } from "lucide-react";
import { PageHeader } from "@/components/patient/PageHeader";
import { cn } from "@/lib/utils";
import { GoalStep, GoalBar, ExampleCasesLink } from "@/components/patient/GoalStep";
import { useLanguage } from "@/i18n/LanguageContext";

const BLOCK_RENDERERS = {
  basic: <BasicInfoBlock />,
  medical: <MedicalContextBlock />,
  history: <TreatmentHistoryBlock />,
  preferences: <PreferencesBlock />,
  documents: <DocumentsBlock />,
  quotes: <SharedQuotesBlock />,
};

/* Editorial treatment: soften the module cards into magazine sections
   (hairline rules, no hard boxes) without touching the shared components. */
const FLAT_TOP_SECTION = "[&>div]:rounded-none [&>div]:border-0 [&>div]:border-b [&>div]:border-border/70 [&>div]:bg-transparent [&>div]:p-0 [&>div]:pb-8 [&>div]:shadow-none";
const FLAT_BLOCK = "[&>div]:rounded-none [&>div]:border-x-0 [&>div]:border-t-0 [&>div]:bg-transparent [&>div]:shadow-none [&>div]:border-b [&>div]:border-border/70";
const FLAT_ASIDE = "[&>div]:rounded-none [&>div]:border-0 [&>div]:border-t [&>div]:border-border/70 [&>div]:bg-transparent [&>div]:p-0 [&>div]:pt-6 [&>div]:shadow-none";

const PatientProfile = () => {
  const mpr = useMasterRecord();
  const completion = overallCompletionMPR(mpr);
  const confidence = profileConfidence(completion);
  const unlockedCount = FEATURES.filter((f) => completion >= f.threshold).length;

  const canPrice = completion >= 15;
  const canMatch = completion >= 25;
  const { language } = useLanguage();
  const goal = mpr.intent.goal;
  const preserve = goal === "preserve";
  const es = language === "es";

  return (
    <div className="container max-w-6xl py-10 space-y-10">
      <div className="space-y-6">
        <PageHeader
          eyebrow="My situation"
          title={preserve ? (es ? "Tu plan para congelar óvulos, en un solo lugar" : "Your egg-freezing plan, all in one place") : "Your fertility story, all in one place"}
          subtitle={preserve
            ? (es ? "Rellena los bloques que te sirvan, a tu ritmo. Cada uno mejora la orientación sobre costes de congelación, qué influye en el resultado y clínicas que pueden encajar." : "Fill in the blocks that feel useful, at your own pace. Each one improves the orientation on egg-freezing costs, what affects the outcome and clinics that may fit you.")
            : "Fill in the blocks that feel useful, at your own pace. Each one improves the orientation on costs, success factors and clinics that may fit you."}
          note="Your data is yours. We use it to explain your options — it doesn't replace a medical consultation."
        />

        {/* CTA row lives in the normal page flow (not inside the header's shrink-0 slot)
            so it wraps cleanly on small screens — fixes the pre-existing mobile overflow. */}
        <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
          <Button asChild className="gap-2 rounded-full">
            <Link to="/summary"><HeartHandshake className="size-4" /> Get my orientation summary <ArrowRight className="size-3.5" /></Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 rounded-full border-primary/20 bg-primary-soft text-primary hover:bg-primary-soft/70 hover:text-primary">
            <Link to="/report"><FileText className="size-4" /> Generate my report</Link>
          </Button>
        </div>

        <div className="h-px bg-border" aria-hidden="true" />
        {goal && <GoalBar />}
        <ExampleCasesLink />
      </div>

      {!goal ? <GoalStep /> : (

      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="space-y-10 min-w-0">
          <div className={FLAT_TOP_SECTION}>
            <ProfileCompletion
              completion={completion}
              confidence={confidence}
              unlockedCount={unlockedCount}
              totalFeatures={FEATURES.length}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Card className={cn(
              "rounded-none border-0 border-b border-border/70 bg-transparent p-4 shadow-none flex items-center gap-3",
              !canPrice && "opacity-60",
            )}>
              <div className="size-10 shrink-0 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <Calculator className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Cost orientation</div>
                <div className="text-xs text-muted-foreground">{canPrice ? "Ready" : "Share the basics to unlock"}</div>
              </div>
              <Button asChild size="sm" disabled={!canPrice} variant={canPrice ? "default" : "outline"} className="shrink-0">
                <Link to="/costes">Open <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            </Card>
            <Card className={cn(
              "rounded-none border-0 border-b border-border/70 bg-transparent p-4 shadow-none flex items-center gap-3",
              !canMatch && "opacity-60",
            )}>
              <div className="size-10 shrink-0 rounded-xl bg-accent-soft text-accent grid place-items-center">
                <Building2 className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Clinics that may fit</div>
                <div className="text-xs text-muted-foreground">{canMatch ? "Ready" : "Share the basics to unlock"}</div>
              </div>
              <Button asChild size="sm" disabled={!canMatch} variant={canMatch ? "default" : "outline"} className="shrink-0">
                <Link to="/clinicas">Open <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            </Card>
          </div>

          <div className={cn("space-y-4", FLAT_BLOCK)}>
            {BLOCKS.map((b) => (
              <ProfileBlock
                key={b.key}
                icon={b.icon}
                title={b.title}
                subtitle={b.subtitle}
                required={b.required}
                progress={blockProgressMPR(b.key, mpr)}
                unlocks={b.unlocks}
                defaultOpen={b.key === "basic" && blockProgressMPR("basic", mpr) < 80}
              >
                {BLOCK_RENDERERS[b.key]}
              </ProfileBlock>
            ))}
          </div>

          <TransparencyBlock variant="method">
            Your information is stored locally on your device. We use it to compute estimates and
            explain why each clinic appears on your list. You can delete it any time from your
            space. It does not replace a medical consultation.
          </TransparencyBlock>
        </div>

        <aside className={cn("space-y-5 lg:sticky lg:top-20 self-start min-w-0", FLAT_ASIDE)}>
          <UnlockedFeatures completion={completion} />
        </aside>
      </div>
      )}
    </div>
  );
};

export default PatientProfile;
