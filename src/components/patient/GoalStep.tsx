import { Link } from "react-router-dom";
import { ArrowRight, Snowflake, Baby, Compass, Info } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useMasterRecord, type Goal } from "@/modules/master-record";

const OPTIONS: { goal: Goal; icon: typeof Snowflake; en: [string, string]; es: [string, string] }[] = [
  { goal: "preserve", icon: Snowflake, en: ["Preserve — freeze my eggs", "Keep options open for later"], es: ["Preservar — congelar óvulos", "Dejar opciones abiertas para más adelante"] },
  { goal: "treatment", icon: Baby, en: ["Trying to conceive now", "IVF, IUI or donor eggs"], es: ["Buscar embarazo ahora", "FIV, IUI u ovodonación"] },
  { goal: "unsure", icon: Compass, en: ["Not sure yet", "We'll help you see the options"], es: ["Aún no lo tengo claro", "Te ayudamos a ver las opciones"] },
];

/** Store the route; "preserve" also points the existing engines at egg freezing when no treatment was chosen yet. */
export function useChooseGoal() {
  const patchIntent = useMasterRecord((s) => s.patchIntent);
  return (goal: Goal) => {
    const interest = useMasterRecord.getState().intent.treatment_interest;
    patchIntent(goal === "preserve" && (!interest || interest === "unsure") ? { goal, treatment_interest: "social_freezing" } : { goal });
  };
}

/** First step of "Check your case": shown while no route is chosen. */
export function GoalStep() {
  const { language } = useLanguage();
  const choose = useChooseGoal();
  const es = language === "es";
  return (
    <section aria-labelledby="goal-step" className="rounded-lg border border-border/70 bg-card/60 p-6 md:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{es ? "Primer paso" : "First step"}</p>
      <h2 id="goal-step" className="mt-2 font-display text-2xl font-medium md:text-3xl">{es ? "¿Qué buscas?" : "What are you looking for?"}</h2>
      <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
        {es ? "Así adaptamos las preguntas y los ejemplos. Puedes cambiarlo cuando quieras." : "This lets us adapt the questions and examples. You can change it at any time."}
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {OPTIONS.map(({ goal, icon: Icon, en, es: esCopy }) => {
          const [title, sub] = es ? esCopy : en;
          return (
            <button key={goal} type="button" onClick={() => choose(goal)}
              className="group flex min-w-0 items-start gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/15 text-primary"><Icon className="size-5" aria-hidden /></span>
              <span className="min-w-0">
                <span className="block font-medium text-foreground">{title}</span>
                <span className="block text-xs text-muted-foreground">{sub}</span>
              </span>
              <ArrowRight className="ml-auto mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** Compact "your route: X · change" control, plus the honest preservation note. */
export function GoalBar() {
  const { language } = useLanguage();
  const es = language === "es";
  const goal = useMasterRecord((s) => s.intent.goal);
  const choose = useChooseGoal();
  if (!goal) return null;
  const label = (g: Goal) => { const o = OPTIONS.find((x) => x.goal === g)!; return (es ? o.es : o.en)[0]; };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{es ? "Tu camino" : "Your route"}</span>
        <div role="radiogroup" aria-label={es ? "Tu camino" : "Your route"} className="inline-flex flex-wrap rounded-md border border-border/80 bg-background p-1">
          {OPTIONS.map((o) => (
            <button key={o.goal} type="button" role="radio" aria-checked={goal === o.goal} onClick={() => choose(o.goal)}
              className={`rounded-[5px] px-3 py-1 text-xs font-medium transition-colors ${goal === o.goal ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {label(o.goal)}
            </button>
          ))}
        </div>
      </div>
      {goal === "preserve" && (
        <p className="flex max-w-[70ch] items-start gap-2 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
          {es
            ? "El camino de preservación está simplificado por ahora: compartimos las preguntas con el de tratamiento, así que puedes saltarte las que no apliquen (tiempo buscando embarazo, tratamientos previos). Costes y clínicas se centran en la congelación de óvulos."
            : "The preservation track is simplified for now: it shares questions with the treatment track, so skip any that don't apply (time trying, previous treatments). Costs and clinics focus on egg freezing."}
        </p>
      )}
    </div>
  );
}

export function ExampleCasesLink({ className = "" }: { className?: string }) {
  const { language } = useLanguage();
  const es = language === "es";
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {es ? "¿Prefieres ver primero un caso parecido al tuyo?" : "Would you rather see a case like yours first?"}{" "}
      <Link to="/demo" className="font-medium text-primary underline-offset-4 hover:underline">{es ? "→ Casos de ejemplo" : "→ Example cases"}</Link>
    </p>
  );
}
