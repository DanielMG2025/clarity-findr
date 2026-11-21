import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Compass } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { logBetaClick } from "@/modules/beta-analytics/logger";
import { START_PATH } from "@/modules/journey-v2/paths";
import { SMALL_CAPS, useL } from "./ui";

const COPY = {
  h1: { en: "Understand and prepare your fertility treatment.", es: "Entiende y prepara tu tratamiento de fertilidad." },
  sub: { en: "What would take you months to gather, condensed into a single place.", es: "Lo que tardarías meses en recopilar, condensado en un único sitio." },
  body: {
    en: "To prepare a fertility treatment you usually search on Google, ask an AI, talk to people close to you, dig through forums and end up relying on someone you trust. All that information is valuable, but it arrives in pieces, in no order and without knowing what applies to your case. Fertility Compass brings it all together in one place and shows it to you in the order you need it: what each treatment is, what it really costs in your country, what the law allows, what the evidence says at your age and what's shared in communities.",
    es: "Para preparar un tratamiento de fertilidad normalmente buscas en Google, preguntas a una IA, hablas con gente cercana, buceas en foros y acabas fiándote de alguien de confianza. Toda esa información es valiosa, pero llega a trozos, sin orden y sin saber qué aplica a tu caso. Fertility Compass junta todo eso en un solo sitio y te lo enseña en el orden en que lo necesitas: qué es cada tratamiento, cuánto cuesta de verdad en tu país, qué permite la ley, qué dice la evidencia a tu edad y lo que se cuenta en las comunidades.",
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
        <h1 className="mt-6 font-display text-[clamp(2rem,6vw,4rem)] font-medium leading-[1.08] text-balance">
          {L(COPY.h1)}
        </h1>
        <p className="mt-4 font-display text-[clamp(1.25rem,3.2vw,1.75rem)] italic leading-snug text-accent text-balance" data-testid="landing-sub">{L(COPY.sub)}</p>
        <p className="mx-auto mt-6 max-w-[62ch] text-[0.95rem] leading-relaxed text-background/90 md:text-base">{L(COPY.body)}</p>
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
