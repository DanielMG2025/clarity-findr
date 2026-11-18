import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Compass } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { logBetaClick } from "@/modules/beta-analytics/logger";
import { START_PATH } from "@/modules/journey-v2/paths";
import { SMALL_CAPS, useL } from "./ui";

const COPY = {
  h1a: { en: "Understand and prepare your fertility treatment,", es: "Entiende y prepara tu tratamiento de fertilidad," },
  h1b: { en: "without losing months.", es: "sin perder meses." },
  body: {
    en: "Fertility Compass brings together, independently, what would normally take you months to gather —real prices by country, what the law allows, what the science says and what's shared in communities— and shows it to you in the order you need it.",
    es: "Fertility Compass reúne, de forma independiente, lo que normalmente tardarías meses en juntar —precios reales por país, qué permite la ley, qué dice la ciencia y lo que se cuenta en las comunidades— y te lo enseña en el orden en que lo necesitas.",
  },
  start: { en: "Start", es: "Empezar" },
  micro: { en: "No account. Your answers stay in your browser.", es: "Sin cuenta. Tus respuestas se quedan en tu navegador." },
  find: { en: "What you'll find", es: "Qué encontrarás" },
};

const FIND = [
  { t: { en: "Understand", es: "Entiende" }, d: { en: "what each treatment is, what it really costs and what the evidence says at your age.", es: "qué es cada tratamiento, cuánto cuesta de verdad y qué dice la evidencia a tu edad." } },
  { t: { en: "Compare", es: "Compara" }, d: { en: "prices and rules in your country and in the usual destinations.", es: "precios y reglas de tu país y de los destinos habituales." } },
  { t: { en: "Prepare", es: "Prepara" }, d: { en: "the clinic, financing, travel and what comes after.", es: "la clínica, la financiación, el viaje y el después." } },
];

/** Journey v2 · screen 0: one idea, one action. */
export default function LandingV2() {
  const { L } = useL();
  return (
    <section className="relative flex flex-1 items-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-5%,hsl(var(--primary))_0%,hsl(var(--foreground))_60%)] text-background dark:[--background:var(--sidebar-accent-foreground)] dark:[--foreground:var(--sidebar-background)]" data-testid="landing-v2">
      <div className="container max-w-3xl px-6 py-12 text-center md:py-16">
        <p className={`${SMALL_CAPS} inline-flex items-center gap-2 text-accent`}><Compass aria-hidden className="size-3.5" /> Fertility Compass</p>
        <h1 className="mt-6 font-display text-[clamp(2.1rem,6.5vw,4.25rem)] font-medium leading-[1.08] text-balance">
          {L(COPY.h1a)} <span className="block italic text-accent">{L(COPY.h1b)}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[60ch] text-base leading-relaxed text-background/90 md:text-lg">{L(COPY.body)}</p>
        <Link
          to={START_PATH}
          onClick={() => logBetaClick("start_case", { from: "landing_v2" })}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-base font-semibold text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
        >
          {L(COPY.start)} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <p className="mt-3 text-xs text-background/70">{L(COPY.micro)}</p>

        <Collapsible className="mx-auto mt-8 max-w-xl text-left">
          <CollapsibleTrigger className="group mx-auto flex items-center gap-1.5 text-sm font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            {L(COPY.find)} <ChevronDown aria-hidden className="size-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-4 space-y-2 border-t border-accent/30 pt-4 text-sm leading-relaxed text-background/85">
              {FIND.map((f) => (
                <li key={f.t.en}><strong className="font-semibold text-accent">{L(f.t)}</strong> · {L(f.d)}</li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}
