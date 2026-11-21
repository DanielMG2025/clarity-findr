import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { restoreOwnCase } from "@/modules/master-record";
import { logBetaClick } from "@/modules/beta-analytics/logger";
import { safeReturnPath } from "@/modules/access/policy";
import { AGE_BANDS_V2, REASONS, WHO_OPTIONS, pickReason, useBasics } from "@/modules/journey-v2/basics";
import { basicsComplete, clearAllAnswers, firstMissingStep, hasAnyAnswer, syncBasicsToCase } from "@/modules/journey-v2/answers";
import { countryOption, suggestCountry } from "@/modules/journey-v2/countries";
import { PICKER_TREATMENTS } from "@/modules/journey-v2/treatments";
import { BASICS_PATH, LIBRARY_PATH, NEEDS_PATH, START_PATH } from "@/modules/journey-v2/paths";
import { AnswersSummary, CountryPicker } from "./answersUi";
import { Eyebrow, SMALL_CAPS, Tile, Why, useL } from "./ui";

export { syncBasicsToCase } from "@/modules/journey-v2/answers";

function Question({ title, help, children }: { title: string; help: string; children: ReactNode }) {
  return (
    <section className="space-y-4" aria-labelledby="basics-q">
      <h2 id="basics-q" className="font-display text-3xl font-medium leading-snug md:text-4xl">{title}</h2>
      <Why>{help}</Why>
      {children}
    </section>
  );
}

export const BASICS_STEPS = ["who", "age", "reason", "country", "treatment"] as const;
export type BasicsStep = (typeof BASICS_STEPS)[number];

/** "Empezar de cero": a discreet two-tap control that clears every answer (here and in the case). */
function StartOver({ onDone }: { onDone: () => void }) {
  const { es } = useL();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return <button type="button" onClick={() => setConfirming(true)} className="self-start text-xs text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground" data-testid="basics-start-over">{es ? "Empezar de cero" : "Start from scratch"}</button>;
  }
  return (
    <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground" role="group" aria-label={es ? "Empezar de cero" : "Start from scratch"}>
      <span>{es ? "Se borra cada respuesta que has dado, en este navegador (y en tu cuenta, si has iniciado sesión)." : "All your answers are deleted in this browser (and in your account, if you're signed in)."}</span>
      <button type="button" onClick={() => { clearAllAnswers(); setConfirming(false); onDone(); }} className="font-semibold text-destructive underline underline-offset-4" data-testid="basics-start-over-confirm">{es ? "Borrar todo" : "Delete everything"}</button>
      <button type="button" onClick={() => setConfirming(false)} className="underline underline-offset-4">{es ? "Cancelar" : "Cancel"}</button>
    </p>
  );
}

/**
 * Journey v2 · screen 2: one question per step (who it is for first), saved in the browser as they are tapped.
 *  - Already answered → a confirmable summary instead of the five screens again.
 *  - Partly answered → straight to the first missing question.
 *  - `?paso=N&solo=1&volver=…` → only that question, then back to where the person was.
 */
export default function Basics() {
  const { L, es } = useL();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const back = safeReturnPath(params.get("volver"));
  const solo = params.get("solo") === "1";
  const b = useBasics();
  useLayoutEffect(() => { restoreOwnCase(); }, []);

  const raw = Number(params.get("paso"));
  const hasStep = Number.isInteger(raw) && raw >= 1 && raw <= BASICS_STEPS.length;
  // Decided once on arrival, so answering the last core question doesn't flip the screen into the summary.
  const [arrival] = useState(() => {
    const now = useBasics.getState();
    if (hasStep) return "steps" as const;
    if (basicsComplete(now)) return "summary" as const;
    return (firstMissingStep(now) ?? 1) - 1;
  });
  const index = hasStep ? raw - 1 : typeof arrival === "number" ? arrival : 0;
  const showSummary = !hasStep && arrival === "summary";
  const step = BASICS_STEPS[index];
  const goTo = (i: number) => {
    const next = new URLSearchParams(params);
    next.set("paso", String(i + 1));
    next.delete("solo");
    setParams(next);
    window.scrollTo?.({ top: 0 });
  };

  const suggested = useMemo(() => (b.residence ? undefined : suggestCountry(typeof navigator === "undefined" ? [] : navigator.languages ?? [navigator.language])), [b.residence]);
  const residence = b.residence ?? suggested;
  const destination = b.destination ?? "same";
  const [pickOther, setPickOther] = useState(() => !!b.destination && b.destination !== "same" && b.destination !== "unsure");

  const save = () => {
    if (step === "country" || index === BASICS_STEPS.length - 1) b.patch({ residence, destination });
    syncBasicsToCase({ ...b, residence, destination });
  };
  const proceed = () => {
    save();
    logBetaClick("start_case", { from: "basics" });
    navigate(back ?? NEEDS_PATH);
  };
  const saveAndReturn = () => { save(); navigate(back ?? BASICS_PATH); };
  const startOver = () => { setPickOther(false); navigate(`${BASICS_PATH}?paso=1`, { replace: true }); };
  const last = index === BASICS_STEPS.length - 1;

  if (showSummary) {
    return (
      <div className="container flex max-w-3xl flex-col gap-6 px-6 py-8 md:py-12" data-testid="basics" data-step="summary">
        <Eyebrow>{es ? "Lo básico" : "The basics"}</Eyebrow>
        <AnswersSummary back={`${location.pathname}${location.search}`} onConfirm={proceed} />
        <StartOver onDone={startOver} />
      </div>
    );
  }

  return (
    <div className="container flex max-w-3xl flex-col gap-6 px-6 py-8 md:py-12" data-testid="basics" data-step={step} data-solo={solo ? "1" : undefined}>
      <header className="space-y-3">
        {solo
          ? <Eyebrow>{es ? "Lo básico · cambiar una respuesta" : "The basics · change one answer"}</Eyebrow>
          : <>
            <Eyebrow>{es ? "Lo básico" : "The basics"} · {index + 1}/{BASICS_STEPS.length}</Eyebrow>
            <Progress value={((index + 1) / BASICS_STEPS.length) * 100} aria-label={es ? "Progreso" : "Progress"} className="h-1.5" />
          </>}
        {index === 0 && !solo && <Why>{es ? "Cinco respuestas y te enseñamos precios, reglas y guías de tu país, con lo que cambia a tu edad. Puedes cambiarlas cuando quieras." : "Five answers and we show you prices, rules and guides for your country, with what changes at your age. You can change them whenever you like."}</Why>}
      </header>
      {step === "who" && (
        <Question title={es ? "¿Para quién buscas información?" : "Who are you looking for information for?"} help={es ? "Nos sirve para enseñarte lo que aplica a tu situación; en fertilidad no es lo mismo según quién se trata." : "We use it to show you what applies to your situation; in fertility it isn't the same depending on who is being treated."}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {WHO_OPTIONS.map((w) => <Tile key={w.id} selected={b.who === w.id} onClick={() => b.patch({ who: w.id })} testId={`who-${w.id}`}>{L(w.label)}</Tile>)}
          </div>
        </Question>
      )}

      {step === "age" && (
        <Question title={es ? "¿Qué edad tiene la persona que se trataría?" : "How old is the person who would be treated?"} help={es ? "En fertilidad la edad cambia las probabilidades y las recomendaciones. Te lo enseñamos con su fuente. No la guardamos fuera de tu navegador." : "In fertility, age changes the odds and the recommendations. We show it to you with its source. We don't keep it outside your browser."}>
          {b.who === "pareja" && <p className="text-sm font-medium" data-testid="age-couple">{es ? "Indica la edad de la mujer: es la que más cambia las probabilidades." : "Give the woman's age: it's the one that changes the odds the most."}</p>}
          {b.who === "hombre" && <p className="text-sm text-muted-foreground" data-testid="age-man">{es ? "Las cifras por edad que tenemos se refieren a la edad de la mujer, así que no las aplicamos en esta situación." : "The age figures we have refer to the woman's age, so we don't apply them in this situation."}</p>}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {AGE_BANDS_V2.map((a) => <Tile key={a.id} selected={b.age === a.id} onClick={() => b.patch({ age: a.id })} testId={`age-${a.id}`}>{L(a.label)}</Tile>)}
          </div>
        </Question>
      )}

      {step === "reason" && (
        <Question title={es ? "¿Qué te trae aquí?" : "What brings you here?"} help={es ? "Según lo que te trae, lo que necesitas saber es distinto." : "Depending on what brings you here, what you need to know is different."}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {REASONS.map((r) => <Tile key={r.id} selected={b.reason === r.id} onClick={() => b.patch(pickReason(b, r.id))} testId={`reason-${r.id}`}>{L(r.label)}</Tile>)}
          </div>
        </Question>
      )}

      {step === "country" && (
        <Question title={es ? "¿Dónde vives?" : "Where do you live?"} help={es ? "Nos sirve para enseñarte los precios y las reglas que te aplican, y las diferencias si te lo planteas fuera." : "We use it to show you the prices and rules that apply to you, and the differences if you're thinking of going abroad."}>
          {suggested && !b.residence && <p className={`${SMALL_CAPS} text-accent`} data-testid="country-suggested">{es ? `Propuesto por tu navegador: ${L(countryOption(suggested)!.name)}` : `Suggested by your browser: ${L(countryOption(suggested)!.name)}`}</p>}
          <CountryPicker value={residence} onPick={(code) => b.patch({ residence: code })} testPrefix="residence" label={es ? "Busca el país donde vives" : "Search the country where you live"} />
          <h3 className="pt-4 font-display text-xl font-medium">{es ? "¿Dónde te planteas tratarte?" : "Where are you thinking of having treatment?"}</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Tile selected={destination === "same" && !pickOther} onClick={() => { setPickOther(false); b.patch({ destination: "same" }); }} testId="destination-same">{es ? "En el mismo país" : "In the same country"}</Tile>
            <Tile selected={pickOther} onClick={() => setPickOther(true)} testId="destination-other">{es ? "En otro país" : "In another country"}</Tile>
            <Tile selected={destination === "unsure" && !pickOther} onClick={() => { setPickOther(false); b.patch({ destination: "unsure" }); }} testId="destination-unsure">{es ? "Aún no lo sé" : "I don't know yet"}</Tile>
          </div>
          {pickOther && <CountryPicker value={destination} exclude={residence} onPick={(code) => b.patch({ destination: code })} testPrefix="destination" label={es ? "Busca el país donde te tratarías" : "Search the country for treatment"} />}
        </Question>
      )}

      {step === "treatment" && (
        <Question title={es ? "¿Sabes qué tratamiento te interesa?" : "Do you know which treatment interests you?"} help={es ? "Es opcional. Si lo eliges, te llevamos directamente a su guía." : "Optional. If you choose one, we take you straight to its guide."}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PICKER_TREATMENTS.map((t) => <Tile key={t.id} selected={b.treatment === t.id} onClick={() => b.patch({ treatment: t.id, treatmentFromReason: false })} testId={`treatment-${t.id}`}>{L(t.label)}</Tile>)}
            <Tile selected={b.treatment === "unsure"} onClick={() => b.patch({ treatment: "unsure", treatmentFromReason: false })} testId="treatment-unsure">{es ? "Aún no lo sé" : "Not sure yet"}</Tile>
          </div>
        </Question>
      )}

      {solo ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
          <Button asChild variant="ghost" className="gap-1 px-0"><Link to={back ?? BASICS_PATH} data-testid="basics-cancel"><ArrowLeft aria-hidden className="size-4" />{es ? "Volver sin cambiar" : "Back without changing"}</Link></Button>
          <Button size="lg" className="rounded-full" onClick={saveAndReturn} data-testid="basics-save-return">{es ? "Guardar y volver" : "Save and go back"} <ArrowRight aria-hidden className="ml-1 size-4" /></Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
          {index > 0
            ? <Button variant="ghost" onClick={() => goTo(index - 1)} className="gap-1 px-0" data-testid="basics-prev"><ArrowLeft aria-hidden className="size-4" />{es ? "Anterior" : "Previous"}</Button>
            : <Button asChild variant="ghost" className="gap-1 px-0"><Link to={START_PATH} data-testid="basics-prev"><ArrowLeft aria-hidden className="size-4" />{es ? "Anterior" : "Previous"}</Link></Button>}
          {last
            ? <Button size="lg" className="rounded-full" onClick={proceed} data-testid="basics-continue">{es ? "Continuar" : "Continue"} <ArrowRight aria-hidden className="ml-1 size-4" /></Button>
            : <Button size="lg" className="rounded-full" onClick={() => goTo(index + 1)} data-testid="basics-next">{es ? "Siguiente" : "Next"} <ArrowRight aria-hidden className="ml-1 size-4" /></Button>}
        </div>
      )}
      {!solo && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={LIBRARY_PATH} className="text-sm text-muted-foreground underline decoration-accent/50 underline-offset-4 hover:text-foreground" data-testid="basics-skip">
            {es ? "Ver sin personalizar" : "View without personalising"}
          </Link>
          {hasAnyAnswer(b) && <StartOver onDone={startOver} />}
        </div>
      )}
    </div>
  );
}
