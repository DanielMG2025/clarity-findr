import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Activity,
  Leaf,
  Dna,
  Settings2,
  Sparkles,
  TestTube,
  CheckCircle2,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { storage, DEFAULT_ASSESSMENT } from "@/lib/fertility";
import type { AdvancedAssessment, AssessmentData } from "@/lib/engines/types";
import { toast } from "@/hooks/use-toast";

type Block = {
  key: "history" | "biomarkers" | "lifestyle" | "genetic" | "preferences";
  icon: typeof HeartPulse;
  title: string;
  subtitle: string;
};

const BLOCKS: Block[] = [
  { key: "history", icon: HeartPulse, title: "Reproductive history", subtitle: "Cycles, prior attempts, outcomes." },
  { key: "biomarkers", icon: Activity, title: "Biomarkers", subtitle: "Hormone levels — skip what you don't know." },
  { key: "lifestyle", icon: Leaf, title: "Health & lifestyle", subtitle: "Day-to-day factors that influence outcomes." },
  { key: "genetic", icon: Dna, title: "Genetic considerations", subtitle: "Family history and screening." },
  { key: "preferences", icon: Settings2, title: "Preferences & constraints", subtitle: "What you'd accept or avoid." },
];

const Pill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-smooth text-left ${
      active
        ? "border-primary bg-primary-soft text-primary shadow-card"
        : "border-border bg-card hover:border-primary/40"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <div>
      <div className="text-sm font-semibold">{label}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
    {children}
  </div>
);

const AssessmentAdvanced = () => {
  const navigate = useNavigate();
  const base: AssessmentData = useMemo(
    () => storage.loadAssessment() ?? DEFAULT_ASSESSMENT,
    [],
  );
  const [step, setStep] = useState(0);
  const [adv, setAdv] = useState<AdvancedAssessment>(() => base.advanced ?? {});
  const set = (patch: Partial<AdvancedAssessment>) => setAdv((s) => ({ ...s, ...patch }));

  const block = BLOCKS[step];
  const progress = ((step + 1) / BLOCKS.length) * 100;

  // Partner suggestion: if biomarkers block is active and user has not provided AMH/FSH
  const missingBiomarkers =
    step === 1 && (adv.amh === undefined || adv.fsh === undefined);

  const next = () => {
    if (step < BLOCKS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    storage.saveAssessment({ ...base, advanced: adv });
    toast({
      title: "Advanced profile saved",
      description: "Scoring engine updated. Confidence on your matches just went up.",
    });
    navigate("/results?advanced=1");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-hero">
        <div className="container max-w-2xl py-12">
          <Link to="/patient/advanced" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to advanced modules
          </Link>

          {/* Progress */}
          <div className="mt-6 mb-6">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
              <span>
                Block {step + 1} of {BLOCKS.length} · Level 2
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              Every answer sharpens your match — skip anything that doesn't apply.
            </div>
          </div>

          <Card className="p-7 md:p-9 shadow-elegant bg-gradient-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-11 rounded-xl bg-primary-soft grid place-items-center">
                <block.icon className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{block.title}</h1>
                <p className="text-sm text-muted-foreground">{block.subtitle}</p>
              </div>
            </div>

            {block.key === "history" && (
              <div className="space-y-5">
                <Field label="How regular are your cycles?">
                  <div className="grid grid-cols-3 gap-2">
                    {(["regular", "irregular", "absent"] as const).map((v) => (
                      <Pill key={v} active={adv.cycle_regularity === v} onClick={() => set({ cycle_regularity: v })}>
                        {v === "regular" ? "Regular" : v === "irregular" ? "Irregular" : "Absent"}
                      </Pill>
                    ))}
                  </div>
                </Field>
                <Field label="Prior treatment cycles" hint="Total IUI / IVF / ICSI cycles attempted.">
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    placeholder="e.g. 2"
                    value={adv.prior_cycles_count ?? ""}
                    onChange={(e) =>
                      set({ prior_cycles_count: e.target.value === "" ? undefined : Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Best prior outcome">
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["none", "None yet"],
                        ["chemical", "Chemical pregnancy"],
                        ["miscarriage", "Miscarriage"],
                        ["live_birth", "Live birth"],
                      ] as const
                    ).map(([k, label]) => (
                      <Pill key={k} active={adv.prior_outcome === k} onClick={() => set({ prior_outcome: k })}>
                        {label}
                      </Pill>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {block.key === "biomarkers" && (
              <div className="space-y-5">
                <Field label="AMH" hint="Anti-Müllerian Hormone, ng/mL — leave blank if unknown.">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 1.8"
                    value={adv.amh ?? ""}
                    onChange={(e) => set({ amh: e.target.value === "" ? undefined : Number(e.target.value) })}
                  />
                </Field>
                <Field label="FSH" hint="Follicle Stimulating Hormone, mIU/mL.">
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 7.2"
                    value={adv.fsh ?? ""}
                    onChange={(e) => set({ fsh: e.target.value === "" ? undefined : Number(e.target.value) })}
                  />
                </Field>
                <Field label="Antral follicle count (AFC)" hint="From a recent ultrasound.">
                  <Input
                    type="number"
                    placeholder="e.g. 12"
                    value={adv.antral_follicle_count ?? ""}
                    onChange={(e) =>
                      set({
                        antral_follicle_count: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </Field>
                <Field label="Partner sperm quality (if applicable)">
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["normal", "Normal"],
                        ["mild", "Mild factor"],
                        ["severe", "Severe factor"],
                        ["unknown", "Unknown / N/A"],
                      ] as const
                    ).map(([k, label]) => (
                      <Pill
                        key={k}
                        active={adv.partner_sperm_quality === k}
                        onClick={() => set({ partner_sperm_quality: k })}
                      >
                        {label}
                      </Pill>
                    ))}
                  </div>
                </Field>

                {missingBiomarkers && (
                  <Card className="p-4 bg-accent-soft/40 border-2 border-accent/30">
                    <div className="flex items-start gap-3 text-sm">
                      <TestTube className="size-5 text-accent mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold">Improve your results with additional data.</span>
                        <p className="text-muted-foreground mt-1">
                          Don't know your AMH or FSH? A partner home fertility kit measures both —
                          covered by the partner when you order through us.
                        </p>
                        <Button asChild size="sm" variant="outline" className="mt-3">
                          <Link to="/partners">See partner kits</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {block.key === "lifestyle" && (
              <div className="space-y-5">
                <Field label="BMI band">
                  <div className="grid grid-cols-4 gap-2">
                    {(["under", "normal", "over", "obese"] as const).map((v) => (
                      <Pill key={v} active={adv.bmi_band === v} onClick={() => set({ bmi_band: v })}>
                        {v[0].toUpperCase() + v.slice(1)}
                      </Pill>
                    ))}
                  </div>
                </Field>
                <Field label="Do you smoke?">
                  <div className="grid grid-cols-2 gap-2">
                    <Pill active={adv.smoker === false} onClick={() => set({ smoker: false })}>
                      No
                    </Pill>
                    <Pill active={adv.smoker === true} onClick={() => set({ smoker: true })}>
                      Yes
                    </Pill>
                  </div>
                </Field>
                <Field label="Alcohol intake">
                  <div className="grid grid-cols-4 gap-2">
                    {(["none", "light", "moderate", "heavy"] as const).map((v) => (
                      <Pill key={v} active={adv.alcohol === v} onClick={() => set({ alcohol: v })}>
                        {v[0].toUpperCase() + v.slice(1)}
                      </Pill>
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {block.key === "genetic" && (
              <div className="space-y-5">
                <Field label="Family history of fertility or genetic conditions?">
                  <div className="grid grid-cols-2 gap-2">
                    <Pill active={adv.family_history === false} onClick={() => set({ family_history: false })}>
                      No / unknown
                    </Pill>
                    <Pill active={adv.family_history === true} onClick={() => set({ family_history: true })}>
                      Yes
                    </Pill>
                  </div>
                </Field>
                <Field label="Carrier screening already completed?">
                  <div className="grid grid-cols-2 gap-2">
                    <Pill
                      active={adv.carrier_screening_done === false}
                      onClick={() => set({ carrier_screening_done: false })}
                    >
                      Not yet
                    </Pill>
                    <Pill
                      active={adv.carrier_screening_done === true}
                      onClick={() => set({ carrier_screening_done: true })}
                    >
                      Done
                    </Pill>
                  </div>
                </Field>

                {adv.carrier_screening_done === false && (
                  <Card className="p-4 bg-accent-soft/40 border-2 border-accent/30">
                    <div className="flex items-start gap-3 text-sm">
                      <Dna className="size-5 text-accent mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold">Improve your results with additional data.</span>
                        <p className="text-muted-foreground mt-1">
                          Carrier screening sharpens clinic matching by ~15%. Partner labs cover the cost.
                        </p>
                        <Button asChild size="sm" variant="outline" className="mt-3">
                          <Link to="/partners">See genetic partners</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {block.key === "preferences" && (
              <div className="space-y-5">
                <Field label="Open to donor egg / sperm if recommended?">
                  <div className="grid grid-cols-3 gap-2">
                    {(["no", "maybe", "yes"] as const).map((v) => (
                      <Pill key={v} active={adv.donor_openness === v} onClick={() => set({ donor_openness: v })}>
                        {v === "no" ? "No" : v === "maybe" ? "Open to discuss" : "Yes"}
                      </Pill>
                    ))}
                  </div>
                </Field>
                <Field label="Interested in PGT (genetic embryo testing)?">
                  <div className="grid grid-cols-2 gap-2">
                    <Pill active={adv.pgt_interest === false} onClick={() => set({ pgt_interest: false })}>
                      Not now
                    </Pill>
                    <Pill active={adv.pgt_interest === true} onClick={() => set({ pgt_interest: true })}>
                      Yes
                    </Pill>
                  </div>
                </Field>
                <Field label="Preferred clinic language" hint="Optional.">
                  <Input
                    placeholder="e.g. English, Spanish"
                    value={adv.language_pref ?? ""}
                    onChange={(e) => set({ language_pref: e.target.value || undefined })}
                  />
                </Field>
              </div>
            )}

            <div className="flex justify-between mt-10 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button variant="hero" onClick={next}>
                {step === BLOCKS.length - 1 ? (
                  <>
                    Update my matches <CheckCircle2 className="size-4" />
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="mt-6 p-5 bg-card border-2 border-dashed">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Sparkles className="size-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-foreground">Why this matters: </span>
                Each block feeds the scoring engine — patient score, clinic fit and value all
                recalibrate live. <Badge variant="outline" className="ml-1 text-[10px]">Privacy-first</Badge>{" "}
                no medical records leave your device unannounced.
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default AssessmentAdvanced;
