import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { useProfileStore } from "@/modules/profile/store";
import {
  usePatientProfileStore,
  BLOCKS,
  blockProgress,
  overallCompletion,
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

const BLOCK_RENDERERS = {
  basic: <BasicInfoBlock />,
  medical: <MedicalContextBlock />,
  history: <TreatmentHistoryBlock />,
  preferences: <PreferencesBlock />,
  documents: <DocumentsBlock />,
  quotes: <SharedQuotesBlock />,
};

const PatientProfile = () => {
  const profile = useProfileStore();
  const pp = usePatientProfileStore();
  const completion = overallCompletion(profile, pp);
  const confidence = profileConfidence(completion);
  const unlockedCount = FEATURES.filter((f) => completion >= f.threshold).length;

  const canPrice = completion >= 15;
  const canMatch = completion >= 25;

  return (
    <div className="min-h-screen flex flex-col">


      <section className="bg-gradient-hero">
        <div className="container py-10 md:py-14 max-w-5xl space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Mi situación</div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Tu historia de fertilidad, en un solo lugar.
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Completa los bloques que te resulten útiles, a tu ritmo. Cada uno mejora la orientación
            sobre costes, factores de éxito y clínicas que pueden encajar contigo.
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl pt-1">
            Tus datos son tuyos. Los usamos para explicarte tus opciones — no sustituyen una
            consulta médica.
          </p>
        </div>
      </section>

      <div className="container max-w-6xl py-8 grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          <ProfileCompletion
            completion={completion}
            confidence={confidence}
            unlockedCount={unlockedCount}
            totalFeatures={FEATURES.length}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <Card className={`p-4 flex items-center gap-3 ${canPrice ? "" : "opacity-60"}`}>
              <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
                <Calculator className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Costes orientativos</div>
                <div className="text-xs text-muted-foreground">{canPrice ? "Listo" : "Comparte lo básico para activar"}</div>
              </div>
              <Button asChild size="sm" disabled={!canPrice} variant={canPrice ? "default" : "outline"}>
                <Link to="/pricing-lab">Abrir <ArrowRight className="size-3.5 ml-1" /></Link>
              </Button>
            </Card>
            <Card className={`p-4 flex items-center gap-3 ${canMatch ? "" : "opacity-60"}`}>
              <div className="size-10 rounded-xl bg-accent-soft text-accent grid place-items-center">
                <Building2 className="size-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Clínicas que pueden encajar</div>
                <div className="text-xs text-muted-foreground">{canMatch ? "Listo" : "Comparte lo básico para activar"}</div>
              </div>
              <Button asChild size="sm" disabled={!canMatch} variant={canMatch ? "default" : "outline"}>
                <Link to="/clinics">Abrir <ArrowRight className="size-3.5 ml-1" /></Link>
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
                progress={blockProgress(b.key, profile, pp)}
                unlocks={b.unlocks}
                defaultOpen={b.key === "basic" && blockProgress("basic", profile, pp) < 80}
              >
                {BLOCK_RENDERERS[b.key]}
              </ProfileBlock>
            ))}
          </div>

          <TransparencyBlock variant="method">
            Tu información se guarda localmente en tu dispositivo. La usamos para calcular
            estimaciones y explicarte por qué cada clínica aparece en tu lista. Puedes borrarla
            cuando quieras desde tu espacio. No sustituye una consulta médica.
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
