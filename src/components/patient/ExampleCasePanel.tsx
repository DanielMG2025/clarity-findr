import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Compass, Stethoscope, Plane, ListChecks, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { useActiveExampleCase, startOwnCase, type Journey } from "@/modules/master-record";
import { joinNaturally } from "@/modules/master-record/patientNarrative";

/** "Useful? → Study your own case": clears the example and opens the route question. */
export function StudyOwnCaseCta({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  const es = language === "es";
  const navigate = useNavigate();
  const go = () => { startOwnCase(); navigate("/situacion"); };
  return (
    <div className={`no-print flex flex-wrap items-center justify-between gap-4 rounded-lg border border-accent/50 bg-accent-soft/40 ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <div className="min-w-0">
        <p className="font-display text-xl font-medium text-foreground">{es ? "¿Te sirve?" : "Useful?"}</p>
        <p className="mt-1 max-w-[55ch] text-sm leading-relaxed text-muted-foreground">
          {es
            ? "Estudia tu caso con tus propios datos. Borramos este ejemplo y empiezas por la primera pregunta."
            : "Study your own case with your own data. We clear this example and you start from the first question."}
        </p>
      </div>
      <Button onClick={go} className="gap-2 rounded-full">
        {es ? "Estudia tu caso con tus propios datos" : "Study your own case"} <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

/** Shown on report pages while an example case is loaded: its recommended next step + the jump to own data. */
export function ExampleCasePanel({ journey }: { journey: Journey }) {
  const { language, t } = useLanguage();
  const es = language === "es";
  const seed = useActiveExampleCase();
  if (!seed) return null;

  const first = journey.step4_costs[0];
  const reg = journey.step0_regulatory;
  const blocked = reg?.needs_to_travel ? reg.results.find((r) => r.verdict === "not_allowed") : undefined;
  const places = blocked?.alternatives.slice(0, 3).map((a) => t(a.label)) ?? [];
  const missingStep = journey.step2_orientation.factors.some((f) => f.kind === "missing") ? journey.step6_next[0] : undefined;
  const homeCountry = reg ? t(reg.home.label) : undefined;

  const steps: { icon: typeof Compass; title: string; body: string; to?: string; link?: string }[] = [];
  if (first) {
    steps.push({
      icon: Stethoscope,
      title: es ? `Una primera consulta para valorar ${t(first.estimate.plan_label)}` : `A first consultation to assess ${first.estimate.plan_label}`,
      body: t(first.why_this_plan),
      to: "/costes",
      link: es ? "Ver costes orientativos" : "See indicative costs",
    });
  }
  if (blocked) {
    steps.push({
      icon: Plane,
      title: es ? `Mirar fuera de ${homeCountry}` : `Look beyond ${homeCountry}`,
      body: places.length
        ? es
          ? `${t(blocked.label)} no está disponible para su situación en ${homeCountry}. Según el Atlas europeo, sí lo está en ${joinNaturally(places, "es")}.`
          : `${blocked.label} is not available for their situation in ${homeCountry}. Per the European Atlas, it is in ${joinNaturally(places)}.`
        : es
          ? `${t(blocked.label)} no figura como disponible para su situación en ningún país del Atlas europeo. Aquí el primer paso es asesoramiento legal especializado.`
          : `${blocked.label} isn't listed as available for their situation in any Atlas country. Here the first step is specialist legal advice.`,
      to: "/clinicas",
      link: es ? "Ver clínicas que podrían encajar" : "See clinics that may fit",
    });
  } else {
    steps.push({
      icon: Compass,
      title: es ? "Comparar clínicas que podrían encajar" : "Compare clinics that may fit",
      body: es
        ? `Todo lo que busca está permitido en ${homeCountry ?? "su país"}, así que puede comparar clínicas cercanas con el mismo criterio.`
        : `Everything they need is allowed in ${homeCountry ?? "their country"}, so they can compare nearby clinics on the same basis.`,
      to: "/clinicas",
      link: es ? "Ver clínicas" : "See clinics",
    });
  }
  if (missingStep) {
    steps.push({ icon: ListChecks, title: es ? "Completar sus datos" : "Complete their data", body: t(missingStep) });
  }
  steps.push({
    icon: HeartHandshake,
    title: es ? "Un apoyo complementario" : "Complementary support",
    body: es
      ? "Una opinión experta e independiente para preparar la primera visita y las preguntas que conviene hacer."
      : "An independent expert opinion to prepare the first visit and the questions worth asking.",
    to: "/asesoramiento",
    link: es ? "Ver asesoramiento" : "See guidance",
  });

  return (
    <section aria-labelledby="example-next" className="no-print space-y-5 rounded-lg border border-primary/25 bg-primary-soft/25 p-5 sm:p-7">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {es ? `Caso de ejemplo · ${seed.name}` : `Example case · ${seed.name}`}
        </p>
        <h2 id="example-next" className="font-display text-2xl font-medium leading-tight sm:text-3xl">
          {es ? `Esto es lo que le recomendaríamos a ${seed.name}` : `This is what we'd suggest to ${seed.name}`}
        </h2>
        <p className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{es ? seed.story_es : seed.story}</p>
      </div>
      <ol className="grid gap-3 md:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.title} className="min-w-0 rounded-md border border-border/70 bg-background p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/15 font-display text-sm text-primary tabular-nums">{i + 1}</span>
              <div className="min-w-0 space-y-1.5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><s.icon className="size-4 shrink-0 text-primary" aria-hidden /> {s.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                {s.to && s.link && (
                  <Link to={s.to} className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-4 hover:underline">
                    {s.link} <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        {es ? "Orientación basada en datos públicos, no un consejo médico." : "Orientation based on public data, not medical advice."}
      </p>
      <StudyOwnCaseCta compact />
    </section>
  );
}
