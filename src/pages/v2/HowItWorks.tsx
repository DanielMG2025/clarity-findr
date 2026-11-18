import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ClipboardList, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logBetaClick } from "@/modules/beta-analytics/logger";
import { BASICS_PATH, LIBRARY_PATH } from "@/modules/journey-v2/paths";
import { Eyebrow, useL } from "./ui";

const BLOCKS = [
  { icon: BookOpen, t: { en: "Understand", es: "Entiende" }, d: { en: "What each treatment is, what it really costs and what the evidence says at your age.", es: "Qué es cada tratamiento, cuánto cuesta de verdad y qué dice la evidencia a tu edad." } },
  { icon: Scale, t: { en: "Compare", es: "Compara" }, d: { en: "Prices and rules in your country and in the usual destinations.", es: "Precios y reglas de tu país y de los destinos habituales." } },
  { icon: ClipboardList, t: { en: "Prepare", es: "Prepara" }, d: { en: "The clinic, financing, travel, what comes after and the questions for your first consultation.", es: "La clínica, la financiación, el viaje, el después y las preguntas para tu primera consulta." } },
];

/** Journey v2 · screen 1. */
export default function HowItWorks() {
  const { L, es } = useL();
  return (
    <div className="container max-w-4xl space-y-10 px-6 py-10 md:py-14" data-testid="how-it-works">
      <header className="space-y-3">
        <Eyebrow>{es ? "Antes de empezar" : "Before you start"}</Eyebrow>
        <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">{es ? "Así funciona Fertility Compass" : "How Fertility Compass works"}</h1>
      </header>
      <ol className="grid gap-8 md:grid-cols-3">
        {BLOCKS.map(({ icon: Icon, t, d }, i) => (
          <li key={t.en} className="min-w-0 border-t-2 border-accent pt-5">
            <p className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-accent/60 text-primary"><Icon aria-hidden className="size-4" /></span>
              <span className="font-display text-sm tabular-nums text-accent">0{i + 1}</span>
            </p>
            <h2 className="mt-3 font-display text-2xl font-medium">{L(t)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{L(d)}</p>
          </li>
        ))}
      </ol>
      <p className="flex max-w-[65ch] gap-3 border-l-2 border-accent/60 pl-4 text-sm leading-relaxed" data-testid="how-it-works-trust">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
        <span>{es ? "Somos independientes: no hay posiciones pagadas, y de cada clínica te decimos qué hemos podido comprobar." : "We're independent: there are no paid positions, and for each clinic we tell you what we've been able to check."}</span>
      </p>
      <div className="flex flex-col items-start gap-4 border-t border-border/70 pt-8 sm:flex-row sm:items-center">
        <Button asChild size="lg" className="rounded-full">
          <Link to={BASICS_PATH} onClick={() => logBetaClick("start_case", { from: "how_it_works" })}>{es ? "Empezar por ti" : "Start with you"} <ArrowRight aria-hidden className="ml-1 size-4" /></Link>
        </Button>
        <Link to={LIBRARY_PATH} className="text-sm text-muted-foreground underline decoration-accent/50 underline-offset-4 hover:text-foreground">
          {es ? "Saltar e ir a las guías" : "Skip and go to the guides"}
        </Link>
      </div>
    </div>
  );
}
