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
import { Calculator, Building2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/patient/PageHeader";

const BLOCK_RENDERERS = {
  basic: <BasicInfoBlock />,
  medical: <MedicalContextBlock />,
  history: <TreatmentHistoryBlock />,
  preferences: <PreferencesBlock />,
  documents: <DocumentsBlock />,
  quotes: <SharedQuotesBlock />,
};

const PatientProfile = () => {
  const mpr = useMasterRecord();
  const completion = overallCompletionMPR(mpr);
  const confidence = profileConfidence(completion);
  const unlockedCount = FEATURES.filter((f) => completion >= f.threshold).length;

  const canPrice = completion >= 15;
  const canMatch = completion >= 25;

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <PageHeader
        eyebrow="My situation"
        title="Your fertility story, all in one place"
        subtitle="Fill in the blocks that feel useful, at your own pace. Each one improves the orientation on costs, success factors and clinics that may fit you."
        note="Your data is yours. We use it to explain your options — it doesn't replace a medical consultation."
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <ProfileCompletion
            completion={completion}
            confidence={confidence}
            unlockedCount={unlockedCount}
            totalFeatures={FEATURES.length}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <Card className={`p-4 rounded-2xl flex items-center gap-3 ${canPrice ? "" : "opacity-60"}`}>
              <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <Calculator className="size-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Cost orientation</div>
                <div className="text-xs text-muted-foreground">{canPrice ? "Ready" : "Share the basics to unlock"}</div>
              </div>
              <Button asChild size="sm" disabled={!canPrice} variant={canPrice ? "default" : "outline"}>
                <Link to="/costes">Open <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            </Card>
            <Card className={`p-4 rounded-2xl flex items-center gap-3 ${canMatch ? "" : "opacity-60"}`}>
              <div className="size-10 rounded-xl bg-accent-soft text-accent grid place-items-center">
                <Building2 className="size-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Clinics that may fit</div>
                <div className="text-xs text-muted-foreground">{canMatch ? "Ready" : "Share the basics to unlock"}</div>
              </div>
              <Button asChild size="sm" disabled={!canMatch} variant={canMatch ? "default" : "outline"}>
                <Link to="/clinicas">Open <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            </Card>
          </div>

          <div className="space-y-3">
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

        <aside className="space-y-5 lg:sticky lg:top-20 self-start">
          <UnlockedFeatures completion={completion} />
        </aside>
      </div>
    </div>
  );
};

export default PatientProfile;
