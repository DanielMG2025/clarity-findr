import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ClipboardList } from "lucide-react";
import { maleFocus, useBasics, type Basics } from "@/modules/journey-v2/basics";
import { MALE_GUIDE_ID, treatmentById } from "@/modules/journey-v2/treatments";
import { BASICS_PATH, LIBRARY_PATH, PREPARE_PATH, guidePath } from "@/modules/journey-v2/paths";
import { Eyebrow, useL } from "./ui";

/** Where "Entender" goes: the chosen treatment's guide; with no treatment, the male-fertility page for a male focus, else the library. */
export function understandPath(b: Pick<Basics, "treatment" | "who" | "reason">): string {
  const t = treatmentById(b.treatment);
  if (t) return guidePath(t.id);
  return maleFocus(b) ? guidePath(MALE_GUIDE_ID) : LIBRARY_PATH;
}

/** Journey v2 · screen 3: two doors. */
export default function WhatYouNeed() {
  const { es } = useL();
  const treatment = useBasics((s) => s.treatment);
  const who = useBasics((s) => s.who);
  const reason = useBasics((s) => s.reason);
  const doors = [
    { to: understandPath({ treatment, who, reason }), icon: BookOpen, title: es ? "Entender" : "Understand", desc: es ? "Qué es, cuánto cuesta y qué dice la evidencia, para tu caso." : "What it is, what it costs and what the evidence says, for your case.", testId: "door-understand" },
    { to: PREPARE_PATH, icon: ClipboardList, title: es ? "Preparar mi tratamiento" : "Prepare my treatment", desc: es ? "La clínica, la financiación, el viaje y el después, paso a paso." : "The clinic, financing, travel and what comes after, step by step.", testId: "door-prepare" },
  ];
  return (
    <div className="container max-w-4xl space-y-8 px-6 py-10 md:py-14" data-testid="what-you-need">
      <header className="space-y-3">
        <Eyebrow>{es ? "Tu siguiente paso" : "Your next step"}</Eyebrow>
        <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">{es ? "¿Qué necesitas ahora?" : "What do you need now?"}</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        {doors.map((d) => (
          <Link key={d.testId} to={d.to} data-testid={d.testId}
            className="group flex min-w-0 flex-col rounded-2xl border border-accent/60 bg-card p-6 transition-colors hover:border-accent hover:bg-accent-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-8">
            <span className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-accent/70 text-primary"><d.icon aria-hidden className="size-5" /></span>
              <span className="font-display text-2xl font-medium leading-tight md:text-3xl">{d.title}</span>
              <ArrowRight aria-hidden className="ml-auto size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
            </span>
            <span className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{d.desc}</span>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{es ? "Puedes pasar de una a otra cuando quieras." : "You can switch between them whenever you like."}{" "}
        <Link to={BASICS_PATH} className="text-primary underline-offset-4 hover:underline">{es ? "Cambiar mis respuestas" : "Change my answers"}</Link>
      </p>
    </div>
  );
}
