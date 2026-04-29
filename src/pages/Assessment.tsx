import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  AssessmentData,
  COUNTRIES,
  DEFAULT_ASSESSMENT,
  DIAGNOSES,
  PREVIOUS_TREATMENTS,
  storage,
} from "@/lib/fertility";

type StepProps = {
  data: AssessmentData;
  set: (patch: Partial<AssessmentData>) => void;
};

const OptionPill = ({
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
    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-smooth text-left ${
      active
        ? "border-primary bg-primary-soft text-primary shadow-card"
        : "border-border bg-card hover:border-primary/40"
    }`}
  >
    {children}
  </button>
);

const ageHint = (age: number) => {
  if (age < 30) return "At your age, success rates per cycle are typically the highest in our dataset.";
  if (age < 35) return "Most clinics report stable success rates in this range.";
  if (age < 38) return "Time matters — clinics with strong protocols tend to outperform here.";
  if (age < 41) return "Egg quality declines noticeably; donor egg options may also be worth comparing.";
  return "Many clinics in our network specialize in this stage, often with donor egg programs.";
};

const StepAge = ({ data, set }: StepProps) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="text-7xl font-bold text-primary tabular-nums">{data.age}</div>
      <div className="text-sm text-muted-foreground mt-2">years old</div>
    </div>
    <Slider
      min={18}
      max={55}
      step={1}
      value={[data.age]}
      onValueChange={(v) => set({ age: v[0] })}
    />
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>18</span>
      <span>55</span>
    </div>
    <div className="text-sm rounded-xl bg-primary-soft text-primary p-4 border border-primary/20">
      💡 {ageHint(data.age)}
    </div>
  </div>
);

const StepGender = ({ data, set }: StepProps) => (
  <div className="grid grid-cols-2 gap-3">
    {(["female", "male", "couple", "other"] as const).map((g) => (
      <OptionPill key={g} active={data.gender === g} onClick={() => set({ gender: g })}>
        {g === "female" ? "Female" : g === "male" ? "Male" : g === "couple" ? "Couple" : "Other"}
      </OptionPill>
    ))}
  </div>
);

const StepTrying = ({ data, set }: StepProps) => (
  <div className="space-y-2">
    {(["<6 months", "6-12 months", "1-2 years", ">2 years", "not trying"] as const).map((t) => (
      <OptionPill key={t} active={data.trying_duration === t} onClick={() => set({ trying_duration: t })}>
        {t === "not trying" ? "Not actively trying" : t}
      </OptionPill>
    ))}
  </div>
);

const MultiPills = ({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) => (
  <div className="grid grid-cols-2 gap-2">
    {options.map((o) => (
      <OptionPill key={o} active={selected.includes(o)} onClick={() => onToggle(o)}>
        <div className="flex items-center justify-between">
          <span>{o}</span>
          {selected.includes(o) && <Check className="size-4" />}
        </div>
      </OptionPill>
    ))}
  </div>
);

const StepPrev = ({ data, set }: StepProps) => (
  <MultiPills
    options={PREVIOUS_TREATMENTS}
    selected={data.previous_treatments}
    onToggle={(v) =>
      set({
        previous_treatments: data.previous_treatments.includes(v)
          ? data.previous_treatments.filter((x) => x !== v)
          : [...data.previous_treatments, v],
      })
    }
  />
);

const StepDiag = ({ data, set }: StepProps) => (
  <MultiPills
    options={DIAGNOSES}
    selected={data.diagnosis}
    onToggle={(v) =>
      set({
        diagnosis: data.diagnosis.includes(v)
          ? data.diagnosis.filter((x) => x !== v)
          : [...data.diagnosis, v],
      })
    }
  />
);

const StepTreatment = ({ data, set }: StepProps) => (
  <div className="grid grid-cols-1 gap-2">
    {(["IVF", "Egg Donation", "Social Freezing", "ICSI", "Other"] as const).map((t) => (
      <OptionPill
        key={t}
        active={data.treatment_interest === t}
        onClick={() => set({ treatment_interest: t })}
      >
        {t === "Other" ? "Not sure yet" : t}
      </OptionPill>
    ))}
  </div>
);

const BUDGET_HINTS: Record<string, string> = {
  "<5k": "Tight budget — Spain, Czech Republic and Greece tend to fit best.",
  "5k-8k": "This range covers most public-private hybrids and mid-tier clinics in EU.",
  "8k-12k": "Premium EU clinics and basic UK programs fall here.",
  ">12k": "High-end clinics, complex cases or US/UK private programs.",
  unsure: "We'll show you the full price spectrum so you can calibrate.",
};

const StepBudget = ({ data, set }: StepProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 gap-2">
      {(
        [
          ["<5k", "Under €5,000"],
          ["5k-8k", "€5,000 – €8,000"],
          ["8k-12k", "€8,000 – €12,000"],
          [">12k", "Above €12,000"],
          ["unsure", "Not sure yet"],
        ] as const
      ).map(([k, label]) => (
        <OptionPill
          key={k}
          active={data.budget_range === k}
          onClick={() => set({ budget_range: k })}
        >
          {label}
        </OptionPill>
      ))}
    </div>
    {data.budget_range && (
      <div className="text-sm rounded-xl bg-accent-soft text-accent-foreground p-4 border border-accent/20">
        💡 {BUDGET_HINTS[data.budget_range]}
      </div>
    )}
  </div>
);

const StepCountry = ({ data, set }: StepProps) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2">
      {COUNTRIES.map((c) => (
        <OptionPill
          key={c}
          active={data.country_preference === c}
          onClick={() => set({ country_preference: c })}
        >
          {c}
        </OptionPill>
      ))}
    </div>
    <Input
      placeholder="Or type a city / region"
      onChange={(e) =>
        e.target.value.length > 1 && set({ country_preference: e.target.value })
      }
    />
  </div>
);

const StepPregnancies = ({ data, set }: StepProps) => (
  <div className="grid grid-cols-1 gap-2">
    {(
      [
        ["none", "No previous pregnancies"],
        ["miscarriage", "Pregnancy loss / miscarriage"],
        ["live_birth", "At least one live birth"],
        ["both", "Both — loss and live birth"],
      ] as const
    ).map(([k, label]) => (
      <OptionPill
        key={k}
        active={data.previous_pregnancies === k}
        onClick={() => set({ previous_pregnancies: k })}
      >
        {label}
      </OptionPill>
    ))}
    <p className="text-xs text-muted-foreground mt-2">
      No judgment here — this just helps calibrate your match, never to categorize you.
    </p>
  </div>
);

const StepPriority = ({ data, set }: StepProps) => (
  <div className="grid grid-cols-1 gap-2">
    {(
      [
        ["cost", "💶 Lowest possible cost"],
        ["success", "🎯 Highest success probability"],
        ["speed", "⚡ Start treatment as soon as possible"],
        ["balanced", "⚖️ A balance of all three"],
      ] as const
    ).map(([k, label]) => (
      <OptionPill key={k} active={data.priority === k} onClick={() => set({ priority: k })}>
        {label}
      </OptionPill>
    ))}
  </div>
);

const STEPS = [
  { title: "How old are you?", subtitle: "Age helps us tailor recommendations.", Comp: StepAge },
  { title: "Tell us about yourself", subtitle: "Who is the treatment for?", Comp: StepGender },
  { title: "How long have you been trying?", subtitle: "Optional context.", Comp: StepTrying },
  { title: "Any previous pregnancies?", subtitle: "Helps us understand your history.", Comp: StepPregnancies },
  { title: "Previous treatments", subtitle: "Select all that apply.", Comp: StepPrev },
  { title: "Any diagnoses?", subtitle: "Select all that apply — or skip.", Comp: StepDiag },
  { title: "Treatment of interest", subtitle: "We'll match clinics that specialize.", Comp: StepTreatment },
  { title: "What's your budget?", subtitle: "Total expected cost per cycle.", Comp: StepBudget },
  { title: "Where would you treat?", subtitle: "Country preference.", Comp: StepCountry },
  { title: "What matters most to you?", subtitle: "We'll re-rank clinics around your priority.", Comp: StepPriority },
];

const isStepValid = (i: number, d: AssessmentData) => {
  switch (i) {
    case 1:
      return !!d.gender;
    case 2:
      return !!d.trying_duration;
    case 6:
      return !!d.treatment_interest;
    case 7:
      return !!d.budget_range;
    case 9:
      return !!d.priority;
    default:
      return true;
  }
};

const Assessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<AssessmentData>(() => storage.loadAssessment() ?? DEFAULT_ASSESSMENT);

  const set = (patch: Partial<AssessmentData>) => setData((d) => ({ ...d, ...patch }));
  const Step = STEPS[step].Comp;
  const progress = ((step + 1) / STEPS.length) * 100;

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else {
      storage.saveAssessment(data);
      navigate("/results");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-gradient-hero">
        <div className="container max-w-2xl py-12">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
              <span>
                Step {step + 1} of {STEPS.length}
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
              {step < 2
                ? "We're tailoring your results based on your profile…"
                : step < 5
                  ? "Cross-referencing real patient data and clinic outcomes…"
                  : "Almost there — preparing your personalized matches."}
            </div>
          </div>

          <Card className="p-8 md:p-10 shadow-elegant bg-gradient-card">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{STEPS[step].title}</h1>
            <p className="text-muted-foreground mb-8">{STEPS[step].subtitle}</p>

            <Step data={data} set={set} />

            <div className="flex justify-between mt-10 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button variant="hero" onClick={next} disabled={!isStepValid(step, data)}>
                {step === STEPS.length - 1 ? "See my matches" : "Continue"}{" "}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Assessment;
