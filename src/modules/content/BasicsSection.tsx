import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Search, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BridgeCta } from "./PillCard";
import { ALL_ARTICLES, type Article } from "@/modules/education";
import { useLanguage } from "@/i18n/LanguageContext";

const CATEGORIES: { kind: Article["kind"]; en: [string, string]; es: [string, string] }[] = [
  { kind: "glosario", en: ["Glossary", "A short answer to “what is…?”, then the detail."], es: ["Glosario", "Una respuesta breve a «¿qué es…?» y, después, el detalle."] },
  { kind: "tratamiento", en: ["Treatments, step by step", "The full journey of each treatment."], es: ["Tratamientos, paso a paso", "El recorrido completo de cada tratamiento."] },
  { kind: "journey", en: ["Journeys", "Patient, donor and freezing, end to end."], es: ["Recorridos", "Paciente, donante y congelación, de principio a fin."] },
  { kind: "negocio", en: ["How it's paid", "The money model, in plain language."], es: ["Cómo se paga", "El modelo económico, en lenguaje claro."] },
];

function ArticleCard({ a }: { a: Article }) {
  const { t, language } = useLanguage();
  const es = language === "es";
  return (
    <Card className="p-4 hover:border-primary/40 transition-smooth flex flex-col gap-2">
      <Link to={`/aprende/${a.slug}`} className="font-semibold hover:text-primary">
        {t(a.title)}
      </Link>
      <p className="text-sm text-muted-foreground leading-relaxed">{t(a.hook)}</p>
      <div className="mt-auto flex items-center gap-2 text-[11px] text-muted-foreground">
        <Clock className="size-3" /> {a.reading_time_min} min
        <Link to={`/aprende/${a.slug}`} className="text-primary ml-auto inline-flex items-center gap-0.5 hover:underline">
          {es ? "Leer" : "Read"} <ArrowRight className="size-3" />
        </Link>
      </div>
      <BridgeCta />
    </Card>
  );
}

export function BasicsSection() {
  const [q, setQ] = useState("");
  const { t, language } = useLanguage();
  const es = language === "es";

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return null;
    // Search the English source and the active-language copy, so Spanish terms (FIV, congelación…) match too.
    return ALL_ARTICLES.filter((a) =>
      [a.title, a.hook, a.summary, t(a.title), t(a.hook), t(a.summary), ...(a.body_en ?? []), ...(a.body_es ?? []), ...a.tags].join(" ").toLowerCase().includes(query),
    );
  }, [query, t]);

  return (
    <div className="space-y-8">
      <header className="space-y-3 max-w-2xl">
        <h2 className="font-display text-3xl font-medium flex items-center gap-2">
          <BookOpen className="size-6 text-primary" /> {es ? "Guías" : "Guides"}
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {es
            ? "Explicaciones en lenguaje claro de cada tratamiento, término y recorrido: primero un resumen y, si quieres, el detalle. Orientativas y con fuentes, nunca una guía médica."
            : "Plain-language explainers of every treatment, term and journey: a short summary first, then the detail if you want it. Orientative and sourced, never a medical guide."}
        </p>
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={es ? "Busca: FIV, ICSI, AMH, congelación…" : "Search: IVF, ICSI, AMH, freezing…"}
            className="pl-9"
          />
        </div>
      </header>

      {filtered ? (
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {es
              ? `${filtered.length} resultado${filtered.length === 1 ? "" : "s"}`
              : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">{es ? `Ninguna guía coincide con «${q}».` : `No articles match “${q}”.`}</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          )}
        </section>
      ) : (
        CATEGORIES.map((c) => {
          const items = ALL_ARTICLES.filter((a) => a.kind === c.kind);
          if (items.length === 0) return null;
          return (
            <section key={c.kind} className="space-y-3">
              <div>
                <h2 className="text-lg font-bold">{es ? c.es[0] : c.en[0]}</h2>
                <p className="text-sm text-muted-foreground">{es ? c.es[1] : c.en[1]}</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((a) => (
                  <ArticleCard key={a.slug} a={a} />
                ))}
              </div>
            </section>
          );
        })
      )}

      <p className="text-xs text-muted-foreground border-t pt-4 leading-relaxed">
        {es
          ? "Contenido solo informativo: no es consejo médico ni sustituye la valoración de un profesional. Las cifras son orientativas y varían según el caso."
          : "Informative content only — not medical advice, and not a substitute for a professional's assessment. Figures are orientative and vary by case."}
      </p>
    </div>
  );
}
