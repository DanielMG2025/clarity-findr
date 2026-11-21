// Shared pieces for "what you've told us": the country picker, the confirmable
// summary and the inline ask for missing answers. All read and write the single
// answers store (`useBasics`, mirrored into the case by `bindAnswers`).
import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AGE_BANDS_V2, ageLabel, maleFocus, reasonLabel, useBasics, whoLabel, type Basics } from "@/modules/journey-v2/basics";
import { FEATURED_COUNTRIES, countryOption, searchCountries } from "@/modules/journey-v2/countries";
import { STEP_OF, hasAnyAnswer } from "@/modules/journey-v2/answers";
import { treatmentById } from "@/modules/journey-v2/treatments";
import { changePath } from "@/modules/journey-v2/paths";
import { Eyebrow, SMALL_CAPS, Tile, useL } from "./ui";

/** Featured countries as tiles, plus a search over the whole list. */
export function CountryPicker({ value, onPick, exclude, testPrefix, label }: { value?: string; onPick: (code: string) => void; exclude?: string; testPrefix: string; label: string }) {
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

export type AnswerLine = { key: "who" | "age" | "reason" | "residence" | "destination" | "treatment"; label: string; value: string; step: number };

/** One line per answer given, in the order "lo básico" asks them. */
export function answerLines(b: Basics, lang: "en" | "es"): AnswerLine[] {
  const es = lang === "es";
  const country = (c?: string) => { const o = countryOption(c); return o ? o.name[lang] : undefined; };
  const dest = b.destination === "same" ? (es ? "En el mismo país" : "In the same country") : b.destination === "unsure" ? (es ? "Aún no lo sé" : "Not decided yet") : country(b.destination);
  const treatment = b.treatment === "unsure" ? (es ? "Aún no lo sé" : "Not sure yet") : treatmentById(b.treatment)?.label[lang];
  const rows: (AnswerLine | null)[] = [
    b.who ? { key: "who", label: es ? "Para quién" : "Who it's for", value: whoLabel(b.who, lang)!, step: STEP_OF.who } : null,
    b.age ? { key: "age", label: es ? "Edad" : "Age", value: ageLabel(b.age, lang)!, step: STEP_OF.age } : null,
    b.reason ? { key: "reason", label: es ? "Qué te trae" : "What brings you", value: reasonLabel(b.reason, lang)!, step: STEP_OF.reason } : null,
    country(b.residence) ? { key: "residence", label: es ? "Dónde vives" : "Where you live", value: country(b.residence)!, step: STEP_OF.residence } : null,
    b.destination && dest ? { key: "destination", label: es ? "Dónde te tratarías" : "Where you'd have treatment", value: dest, step: STEP_OF.destination } : null,
    treatment ? { key: "treatment", label: es ? "Tratamiento" : "Treatment", value: treatment, step: STEP_OF.treatment } : null,
  ];
  return rows.filter((r): r is AnswerLine => !!r);
}

/**
 * "Esto es lo que nos has contado": shown instead of asking again.
 * [Sí, seguir] confirms; [Cambiar algo] turns each line into a link to that one question, returning to `back`.
 */
export function AnswersSummary({ back, onConfirm }: { back: string; onConfirm: () => void }) {
  const { es, language } = useL();
  const b = useBasics();
  const [editing, setEditing] = useState(false);
  if (!hasAnyAnswer(b)) return null;
  const lines = answerLines(b, language);
  return (
    <section className="space-y-4 rounded-2xl border border-accent/60 bg-card p-5 md:p-6" data-testid="answers-summary" aria-labelledby="answers-summary-title">
      <Eyebrow>{es ? "Ya nos lo has contado" : "You've already told us"}</Eyebrow>
      <h2 id="answers-summary-title" className="font-display text-2xl font-medium leading-snug">{es ? "Esto es lo que nos has contado" : "This is what you've told us"}</h2>
      <ul className="divide-y divide-border/70 text-sm">
        {lines.map((l) => (
          <li key={l.key} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2" data-testid={`answer-${l.key}`}>
            <span className="text-muted-foreground">{l.label}</span>
            <span className="flex min-w-0 items-baseline gap-3">
              <span className="font-medium text-foreground">{l.value}</span>
              {editing && <Link to={changePath(l.step, back)} className="text-primary underline-offset-4 hover:underline" data-testid={`change-${l.key}`}>{es ? "cambiar" : "change"}</Link>}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <Button className="rounded-full" onClick={onConfirm} data-testid="answers-confirm"><Check aria-hidden className="mr-1 size-4" />{es ? "Sí, seguir" : "Yes, continue"}</Button>
        {!editing && <Button variant="outline" className="rounded-full" onClick={() => setEditing(true)} data-testid="answers-edit"><Pencil aria-hidden className="mr-1 size-4" />{es ? "Cambiar algo" : "Change something"}</Button>}
      </div>
      {editing && <p className="text-xs text-muted-foreground">{es ? "Toca «cambiar» en la respuesta que quieras corregir; solo te preguntamos esa." : "Tap “change” on the answer you want to correct; we only ask that one."}</p>}
    </section>
  );
}

export type Need = "country" | "age";

/** What a screen still needs: the country, and the age band only where age changes what we show (never for a male focus). */
export function missingNeeds(b: Basics, needs: Need[]): Need[] {
  return needs.filter((n) => (n === "country" ? !b.residence : !b.age && !maleFocus(b)));
}

/**
 * Inline ask for only what this screen is missing (country, age band), saved as it is tapped.
 * Nothing else from "lo básico" is asked, and the person stays on the same screen.
 */
export function MissingAnswers({ needs, why }: { needs: Need[]; why?: string }) {
  const { es, L } = useL();
  const b = useBasics();
  const [asked] = useState(() => missingNeeds(useBasics.getState(), needs));
  if (asked.length === 0) return null;
  const pending = missingNeeds(b, asked);
  if (pending.length === 0) {
    return <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="missing-answers-done"><Check aria-hidden className="size-4 text-primary" />{es ? "Guardado. Ya no te lo volveremos a preguntar." : "Saved. We won't ask you again."}</p>;
  }
  return (
    <section className="space-y-4 rounded-2xl border border-accent bg-accent-soft/30 p-5" data-testid="missing-answers" aria-label={es ? "Datos que faltan" : "Missing answers"}>
      <p className="text-sm leading-relaxed">{why ?? (es ? "Para enseñarte lo que te aplica nos falta solo esto:" : "To show you what applies to you, we only need this:")}</p>
      {asked.includes("country") && (
        <div className="space-y-2">
          <p className={`${SMALL_CAPS} text-primary`}>{es ? "¿Dónde vives?" : "Where do you live?"}</p>
          <CountryPicker value={b.residence} onPick={(code) => b.patch({ residence: code, destination: b.destination ?? "same" })} testPrefix="missing-country" label={es ? "Busca el país donde vives" : "Search the country where you live"} />
        </div>
      )}
      {asked.includes("age") && (
        <div className="space-y-2">
          <p className={`${SMALL_CAPS} text-primary`}>{es ? "¿Qué edad tiene la persona que se trataría?" : "How old is the person who would be treated?"}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {AGE_BANDS_V2.map((a) => <Tile key={a.id} selected={b.age === a.id} onClick={() => b.patch({ age: a.id })} testId={`missing-age-${a.id}`}>{L(a.label)}</Tile>)}
          </div>
        </div>
      )}
    </section>
  );
}
