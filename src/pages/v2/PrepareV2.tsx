import { useLayoutEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { restoreOwnCase, useMasterRecord } from "@/modules/master-record";
import {
  BLOCKS, blockProgressMPR, ProfileBlock, BasicInfoBlock, MedicalContextBlock, TreatmentHistoryBlock, PreferencesBlock, DocumentsBlock, SharedQuotesBlock,
} from "@/modules/patient-profile";
import type { BlockKey } from "@/modules/patient-profile/blocks";
import { useBasics, abroad, maleFocus, treatmentCountry } from "@/modules/journey-v2/basics";
import { countryOption } from "@/modules/journey-v2/countries";
import { MALE_GUIDE_ID, treatmentById } from "@/modules/journey-v2/treatments";
import { usePublishedPills } from "@/modules/content";
import { PillCard } from "@/modules/content/PillCard";
import { priceLines, regulationFor, regulationLink } from "@/modules/journey-v2/guide";
import { depthSections } from "@/modules/journey-v2/depth";
import { PENDING, PREPARE_STEPS, PREPARE_TITLES, prepareGuide, prepareSections, type PrepareStep } from "@/modules/journey-v2/prepare";
import { ACCOUNT_PATH, BASICS_PATH, PREPARE_PATH } from "@/modules/journey-v2/paths";
import { PARTNERS } from "@/pages/Partners";
import { useLanguage } from "@/i18n/LanguageContext";
import { Eyebrow, Pending, SMALL_CAPS, Why, useL } from "./ui";

const BLOCK_RENDERERS: Record<BlockKey, JSX.Element> = {
  basic: <BasicInfoBlock />, medical: <MedicalContextBlock />, history: <TreatmentHistoryBlock />,
  preferences: <PreferencesBlock />, documents: <DocumentsBlock />, quotes: <SharedQuotesBlock />,
};

/** "Para qué" of each existing question block, in plain words (drawn from what each block unlocks). */
const BLOCK_PURPOSE: Record<BlockKey, { en: string; es: string }> = {
  basic: { en: "With your exact age, country and treatment we adjust the costs and the clinics that may fit.", es: "Con tu edad exacta, tu país y el tratamiento ajustamos los costes y las clínicas que pueden encajar." },
  medical: { en: "With your test results (AMH, FSH, follicle count…) the orientation on costs and odds is more precise.", es: "Con tus análisis (AMH, FSH, recuento de folículos…) la orientación sobre costes y probabilidades es más precisa." },
  history: { en: "If you've already had cycles, we avoid showing you the same and refine which clinics may fit.", es: "Si ya has hecho ciclos, evitamos enseñarte lo mismo y afinamos qué clínicas pueden encajar." },
  preferences: { en: "Your priorities and whether you'd travel order the clinics and explain why each one appears.", es: "Tus prioridades y si viajarías ordenan las clínicas y explican por qué aparece cada una." },
  documents: { en: "With quotes or reports you've received, we can compare what you've been offered.", es: "Con presupuestos o informes que te hayan dado podemos comparar lo que te han ofrecido." },
  quotes: { en: "Real prices you've been given help you compare and, if you want, help other people.", es: "Los precios reales que te han dado te ayudan a comparar y, si quieres, ayudan a otras personas." },
};

function Sections({ step }: { step: "clinica" | "financiacion" | "despues" | "consulta" }) {
  const { es } = useL();
  const treatment = useBasics((s) => s.treatment);
  const list = depthSections(prepareSections(step, treatment));
  return (
    <div className="space-y-5">
      {list.map((s) => (
        <div key={`${s.slug}-${s.heading.en}`} className="space-y-2">
          <h3 className="font-display text-xl font-medium">{es ? s.heading.es : s.heading.en}</h3>
          {(es ? s.paragraphs.es : s.paragraphs.en).map((p, i) => <p key={i} className="max-w-[65ch] leading-relaxed text-foreground/90">{p}</p>)}
        </div>
      ))}
    </div>
  );
}

function QuestionsStep() {
  const { es, L } = useL();
  const mpr = useMasterRecord();
  return (
    <div className="space-y-4">
      <Why>{es ? "Si nos cuentas un poco más, te podemos ofrecer información más enfocada. Cuanto más nos cuentes, más personal." : "If you tell us a little more, we can offer more focused information. The more you tell us, the more personal it gets."}</Why>
      <p className="text-xs text-muted-foreground">{es ? "Todo es opcional y se guarda solo en este navegador." : "Everything is optional and stays in this browser only."}</p>
      <div className="space-y-3 [&>div]:rounded-none [&>div]:border-x-0 [&>div]:border-t-0 [&>div]:bg-transparent [&>div]:shadow-none">
        {BLOCKS.map((b) => (
          <div key={b.key} className="border-b border-border/70 pb-2">
            <ProfileBlock icon={b.icon} title={b.title} subtitle={b.subtitle} required={false} progress={blockProgressMPR(b.key, mpr)} unlocks={b.unlocks}>
              {BLOCK_RENDERERS[b.key]}
            </ProfileBlock>
            <p className="px-1 pt-1 text-xs leading-relaxed text-muted-foreground" data-testid={`purpose-${b.key}`}><strong className="font-semibold text-foreground">{es ? "Para qué" : "What for"}:</strong> {L(BLOCK_PURPOSE[b.key])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TravelStep() {
  const { es, L } = useL();
  const { t } = useLanguage();
  const b = useBasics();
  const travel = PARTNERS.find((p) => p.category === "Travel & accommodation");
  const away = abroad(b);
  const treatment = treatmentById(b.treatment);
  const lines = treatment && away ? priceLines(treatment, b) : [];
  const reg = regulationFor(treatmentCountry(b));
  return (
    <div className="space-y-4">
      {travel && <p className="max-w-[65ch] leading-relaxed">{t(travel.why_matters)}</p>}
      {travel && <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{t(travel.when_to_use)}</p>}
      {away && (
        <div className="space-y-2 border-t border-border/70 pt-4">
          <p className={`${SMALL_CAPS} text-primary`}>{es ? `${L(countryOption(b.residence)!.name)} frente a ${L(countryOption(away)!.name)}` : `${L(countryOption(b.residence)!.name)} vs ${L(countryOption(away)!.name)}`}</p>
          {lines.length > 0 && lines.every((l) => l.price) ? (
            <ul className="space-y-1 text-sm">{lines.map((l) => <li key={l.country}>{L(countryOption(l.country)!.name)}: {l.price!.min.toLocaleString(es ? "es-ES" : "en-GB")}–{l.price!.max.toLocaleString(es ? "es-ES" : "en-GB")} € · {l.price!.as_of}</li>)}</ul>
          ) : <Pending>{es ? "Aún no tenemos precios de referencia con fuente para comparar estos dos países en tu tratamiento." : "We don't yet have sourced reference prices to compare these two countries for your treatment."}</Pending>}
          {reg && <Link to={regulationLink(reg)} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? `Qué permite la ley en ${L(countryOption(away)!.name)}` : `What the law allows in ${L(countryOption(away)!.name)}`} <ArrowRight aria-hidden className="size-3.5" /></Link>}
        </div>
      )}
      {!away && <p className="text-sm text-muted-foreground">{es ? "Si te planteas tratarte en otro país, " : "If you're thinking of treatment in another country, "}<Link to={`${BASICS_PATH}?volver=${encodeURIComponent(`${PREPARE_PATH}?paso=viaje`)}`} className="text-primary hover:underline">{es ? "indícalo aquí" : "say so here"}</Link>{es ? " y te enseñamos las diferencias." : " and we'll show you the differences."}</p>}
    </div>
  );
}

/** Male focus: the existing male pill about the first test goes first; male-specific questions are still pending. */
function MaleConsult() {
  const { es } = useL();
  const pills = usePublishedPills();
  const first = pills.find((p) => p.id === "seminogram");
  return (
    <div className="space-y-3" data-testid="prepare-male">
      <p className={`${SMALL_CAPS} text-primary`}>{es ? "Fertilidad masculina" : "Male fertility"}</p>
      {first && <PillCard pill={first} />}
      <Pending>{es ? "Preguntas para la consulta pensadas para la fertilidad masculina" : "Consultation questions focused on male fertility"}</Pending>
      <Link to={`/guia/${MALE_GUIDE_ID}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Ver todo lo que tenemos sobre fertilidad masculina" : "See everything we have on male fertility"} <ArrowRight aria-hidden className="size-3.5" /></Link>
    </div>
  );
}

/** Journey v2 · screen 4b: skippable modules with progress, ending in the report. */
export default function PrepareV2() {
  const { es, L } = useL();
  const [params, setParams] = useSearchParams();
  const raw = params.get("paso") as PrepareStep | null;
  const step: PrepareStep = raw && PREPARE_STEPS.includes(raw) ? raw : "preguntas";
  const index = PREPARE_STEPS.indexOf(step);
  const treatment = useBasics((s) => s.treatment);
  const male = useBasics((s) => maleFocus(s));
  useLayoutEffect(() => { restoreOwnCase(); }, []);
  const go = (s: PrepareStep) => { setParams({ paso: s }); window.scrollTo({ top: 0 }); };
  const next = PREPARE_STEPS[index + 1];
  const prev = PREPARE_STEPS[index - 1];

  return (
    <div className="container max-w-3xl space-y-6 px-6 py-8 md:py-12" data-testid={`prepare-${step}`}>
      <header className="space-y-3">
        <Eyebrow>{es ? "Preparar mi tratamiento" : "Prepare my treatment"} · {index + 1}/{PREPARE_STEPS.length}</Eyebrow>
        <Progress value={((index + 1) / PREPARE_STEPS.length) * 100} aria-label={es ? "Progreso" : "Progress"} className="h-1.5" />
        <nav aria-label={es ? "Pasos" : "Steps"} className="flex gap-2 overflow-x-auto pb-1">
          {PREPARE_STEPS.map((s) => (
            <button key={s} type="button" onClick={() => go(s)} aria-current={s === step ? "step" : undefined}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs ${s === step ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-accent"}`}>
              {L(PREPARE_TITLES[s])}
            </button>
          ))}
        </nav>
        <h1 className="font-display text-3xl font-medium leading-tight md:text-4xl">{L(PREPARE_TITLES[step])}</h1>
      </header>

      {step === "preguntas" && <QuestionsStep />}
      {step === "clinica" && (
        <div className="space-y-5">
          <Why>{es ? "Elegir clínica es comparar lo mismo con lo mismo: qué incluye cada precio y qué encaja con tu situación." : "Choosing a clinic means comparing like with like: what each price includes and what fits your situation."}</Why>
          <p className="flex max-w-[65ch] gap-3 border-l-2 border-accent/60 pl-4 text-sm leading-relaxed"><ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />{es ? "Somos independientes: no hay posiciones pagadas, y de cada clínica te decimos qué hemos podido comprobar." : "We're independent: there are no paid positions, and for each clinic we tell you what we've been able to check."}</p>
          <Sections step="clinica" />
          <Button asChild className="rounded-full"><Link to="/clinicas">{es ? "Ver clínicas que pueden encajar" : "See clinics that may fit"} <ArrowRight aria-hidden className="ml-1 size-4" /></Link></Button>
        </div>
      )}
      {step === "financiacion" && (
        <div className="space-y-5">
          <Why>{es ? "Cómo se paga un tratamiento y qué mirar en la letra pequeña antes de comprometerte." : "How a treatment is paid for, and what to check in the small print before committing."}</Why>
          <Sections step="financiacion" />
          <Link to={`/aprende/${prepareGuide("financiacion", treatment)}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Leer la guía completa" : "Read the full guide"} <ArrowRight aria-hidden className="size-3.5" /></Link>
        </div>
      )}
      {step === "viaje" && (
        <div className="space-y-5">
          <Why>{es ? "Tratarse fuera puede cambiar el precio y lo que permite la ley; también suma viaje y estancia." : "Treatment abroad can change the price and what the law allows; it also adds travel and a stay."}</Why>
          <TravelStep />
          {PENDING.viaje?.map((p) => <Pending key={p.en}>{L(p)}</Pending>)}
        </div>
      )}
      {step === "despues" && (
        <div className="space-y-5">
          <Why>{es ? "La espera, el resultado y qué pasa si toca otro intento." : "The wait, the result and what happens if another attempt is needed."}</Why>
          <Sections step="despues" />
          {PENDING.despues?.map((p) => <Pending key={p.en}>{L(p)}</Pending>)}
          <Link to={`/aprende/${prepareGuide("despues", treatment)}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Leer la guía completa" : "Read the full guide"} <ArrowRight aria-hidden className="size-3.5" /></Link>
        </div>
      )}
      {step === "consulta" && (
        <div className="space-y-5">
          <Why>{es ? "Lo que conviene llevar pensado a la primera cita, para salir con respuestas." : "What's worth having thought through for the first appointment, so you leave with answers."}</Why>
          {male && <MaleConsult />}
          <Sections step="consulta" />
          <Link to={`/aprende/${prepareGuide("consulta", treatment)}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Leer la guía completa" : "Read the full guide"} <ArrowRight aria-hidden className="size-3.5" /></Link>
        </div>
      )}
      {step === "informe" && (
        <div className="space-y-5" data-testid="prepare-report">
          <Why>{es ? "Todo lo anterior, reunido en un resumen que puedes leer, imprimir o llevar a tu consulta." : "Everything above, gathered in a summary you can read, print or take to your consultation."}</Why>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full"><Link to="/summary">{es ? "Ver mi resumen" : "See my summary"}</Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link to="/report">{es ? "Informe completo para imprimir" : "Full printable report"}</Link></Button>
          </div>
          <div className="space-y-2 border-t border-border/70 pt-5">
            <Button asChild variant="ghost" className="px-0 text-primary"><Link to={ACCOUNT_PATH} data-testid="create-account">{es ? "Crear cuenta (opcional)" : "Create an account (optional)"}</Link></Button>
            <p className="max-w-[65ch] text-xs leading-relaxed text-muted-foreground">
              {es ? "Con una cuenta puedes volver a entrar con tu correo o con Google y enviarnos comentarios. Por ahora tus respuestas siguen guardadas solo en este navegador." : "With an account you can sign back in with your email or Google and send us feedback. For now your answers stay saved in this browser only."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
        {prev ? <Button variant="ghost" onClick={() => go(prev)} className="gap-1 px-0"><ArrowLeft aria-hidden className="size-4" />{es ? "Atrás" : "Back"}</Button> : <span />}
        {next && (
          <div className="flex items-center gap-3">
            {step !== "preguntas" && <Button variant="ghost" onClick={() => go(next)} className="text-muted-foreground" data-testid="prepare-skip">{es ? "Saltar este paso" : "Skip this step"}</Button>}
            <Button onClick={() => go(next)} className="rounded-full" data-testid="prepare-next">{es ? "Siguiente" : "Next"} <ArrowRight aria-hidden className="ml-1 size-4" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}
