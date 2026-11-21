import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { restoreOwnCase, useMasterRecord } from "@/modules/master-record";
import { logBetaClick } from "@/modules/beta-analytics/logger";
import { safeReturnPath } from "@/modules/access/policy";
import { AGE_BANDS_V2, REASONS, WHO_OPTIONS, pickReason, reasonById, useBasics, type Basics as BasicsAnswers } from "@/modules/journey-v2/basics";
import { FEATURED_COUNTRIES, countryOption, isCaseCountry, searchCountries, suggestCountry } from "@/modules/journey-v2/countries";
import { PICKER_TREATMENTS, TREATMENTS_V2 } from "@/modules/journey-v2/treatments";
import { LIBRARY_PATH, NEEDS_PATH, START_PATH } from "@/modules/journey-v2/paths";
import { Eyebrow, SMALL_CAPS, Tile, Why, useL } from "./ui";

/** Copy the answers the case already asks for into the case, so nothing is asked twice. Age bands are never copied (the case asks for an exact age). */
export function syncBasicsToCase(b: BasicsAnswers) {
  const { patchIdentity, patchIntent } = useMasterRecord.getState();
  if (b.residence && isCaseCountry(b.residence)) patchIdentity({ country_of_residence: b.residence });
  const t = TREATMENTS_V2.find((x) => x.id === b.treatment);
  if (t?.interest) patchIntent({ treatment_interest: t.interest });
  else if (b.treatment === "unsure") patchIntent({ treatment_interest: "unsure" });
  // "What brings you here" is the latest explicit answer, so it sets the case goal.
  const reason = reasonById(b.reason);
  if (reason) patchIntent({ goal: reason.goal });
}

/** Featured countries as tiles, plus a search over the whole list. */
function CountryPicker({ value, onPick, exclude, testPrefix, label }: { value?: string; onPick: (code: string) => void; exclude?: string; testPrefix: string; label: string }) {
  const { L, es } = useL();
  const [query, setQuery] = useState("");
  const list = query.trim()
    ? searchCountries(query, exclude)
    : searchCountries("", exclude).filter((c) => FEATURED_COUNTRIES.includes(c.code) || c.code === value);
  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={es ? "Busca tu país" : "Search for your country"} className="h-11 pl-9" data-testid={`${testPrefix}-search`} />
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {list.map((c) => (
          <Tile key={c.code} selected={value === c.code} onClick={() => onPick(c.code)} testId={`${testPrefix}-${c.code}`}>{L(c.name)}</Tile>
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-sm text-muted-foreground" data-testid={`${testPrefix}-none`}>
          {es ? "Aún no tenemos ese país en la lista. Puedes elegir un país vecino o seguir sin elegir ninguno." : "We don't have that country in the list yet. You can pick a neighbouring country or continue without choosing one."}
        </p>
      )}
    </div>
  );
}

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

/** Journey v2 · screen 2: one question per step (who it is for first), saved in the browser as they are tapped. */
export default function Basics() {
  const { L, es } = useL();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const back = safeReturnPath(params.get("volver"));
  const b = useBasics();
  useLayoutEffect(() => { restoreOwnCase(); }, []);

  const raw = Number(params.get("paso"));
  const index = Number.isInteger(raw) && raw >= 1 && raw <= BASICS_STEPS.length ? raw - 1 : 0;
  const step = BASICS_STEPS[index];
  const goTo = (i: number) => {
    const next = new URLSearchParams(params);
    next.set("paso", String(i + 1));
    setParams(next);
    window.scrollTo?.({ top: 0 });
  };

  const suggested = useMemo(() => (b.residence ? undefined : suggestCountry(typeof navigator === "undefined" ? [] : navigator.languages ?? [navigator.language])), [b.residence]);
  const residence = b.residence ?? suggested;
  const destination = b.destination ?? "same";
  const [pickOther, setPickOther] = useState(() => !!b.destination && b.destination !== "same" && b.destination !== "unsure");

  const proceed = () => {
    const answers = { ...b, residence, destination };
    b.patch({ residence, destination });
    syncBasicsToCase(answers);
    logBetaClick("start_case", { from: "basics" });
    navigate(back ?? NEEDS_PATH);
  };
  const last = index === BASICS_STEPS.length - 1;

  return (
    <div className="container flex max-w-3xl flex-col gap-6 px-6 py-8 md:py-12" data-testid="basics" data-step={step}>
      <header className="space-y-3">
        <Eyebrow>{es ? "Lo básico" : "The basics"} · {index + 1}/{BASICS_STEPS.length}</Eyebrow>
        <Progress value={((index + 1) / BASICS_STEPS.length) * 100} aria-label={es ? "Progreso" : "Progress"} className="h-1.5" />
        {index === 0 && <Why>{es ? "Cinco respuestas y te enseñamos precios, reglas y guías de tu país, con lo que cambia a tu edad. Puedes cambiarlas cuando quieras." : "Five answers and we show you prices, rules and guides for your country, with what changes at your age. You can change them whenever you like."}</Why>}
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

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
        {index > 0
          ? <Button variant="ghost" onClick={() => goTo(index - 1)} className="gap-1 px-0" data-testid="basics-prev"><ArrowLeft aria-hidden className="size-4" />{es ? "Anterior" : "Previous"}</Button>
          : <Button asChild variant="ghost" className="gap-1 px-0"><Link to={START_PATH} data-testid="basics-prev"><ArrowLeft aria-hidden className="size-4" />{es ? "Anterior" : "Previous"}</Link></Button>}
        {last
          ? <Button size="lg" className="rounded-full" onClick={proceed} data-testid="basics-continue">{es ? "Continuar" : "Continue"} <ArrowRight aria-hidden className="ml-1 size-4" /></Button>
          : <Button size="lg" className="rounded-full" onClick={() => goTo(index + 1)} data-testid="basics-next">{es ? "Siguiente" : "Next"} <ArrowRight aria-hidden className="ml-1 size-4" /></Button>}
      </div>
      <Link to={LIBRARY_PATH} className="self-start text-sm text-muted-foreground underline decoration-accent/50 underline-offset-4 hover:text-foreground" data-testid="basics-skip">
        {es ? "Ver sin personalizar" : "View without personalising"}
      </Link>
    </div>
  );
}
