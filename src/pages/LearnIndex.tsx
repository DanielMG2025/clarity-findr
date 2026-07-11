import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Search, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ALL_ARTICLES, type Article } from "@/modules/education";

const CATEGORIES: { kind: Article["kind"]; label: string; blurb: string }[] = [
  { kind: "glosario", label: "Glossary", blurb: "20-second answers to “what is…?”" },
  { kind: "tratamiento", label: "Treatments, step by step", blurb: "The full journey of each treatment." },
  { kind: "journey", label: "Journeys", blurb: "Patient, donor and freezing, end to end." },
  { kind: "negocio", label: "How it's paid", blurb: "The money model, in plain language." },
];

function ArticleCard({ a }: { a: Article }) {
  return (
    <Card className="p-4 hover:border-primary/40 transition-smooth flex flex-col gap-2">
      <Link to={`/learn/${a.slug}`} className="font-semibold hover:text-primary">
        {a.title}
      </Link>
      <p className="text-sm text-muted-foreground leading-relaxed">{a.hook}</p>
      <div className="mt-auto flex items-center gap-2 text-[11px] text-muted-foreground">
        <Clock className="size-3" /> {a.reading_time_min} min
        <span className="text-primary ml-auto inline-flex items-center gap-0.5">
          Read <ArrowRight className="size-3" />
        </span>
      </div>
    </Card>
  );
}

export default function LearnIndex() {
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return null;
    return ALL_ARTICLES.filter((a) =>
      [a.title, a.hook, a.summary, ...a.tags].join(" ").toLowerCase().includes(query),
    );
  }, [query]);

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      <header className="space-y-3 max-w-2xl">
        <Badge variant="secondary" className="text-[11px]">Learn</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="size-7 text-primary" /> Understand fertility, from scratch
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Plain-language explainers of every treatment, term and journey — orientative and sourced,
          never a medical guide.
        </p>
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: IVF, ICSI, AMH, freezing…"
            className="pl-9"
          />
        </div>
      </header>

      {filtered ? (
        <section className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No articles match “{q}”.</p>
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
                <h2 className="text-lg font-bold">{c.label}</h2>
                <p className="text-sm text-muted-foreground">{c.blurb}</p>
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
        Informative content only — not medical advice, and not a substitute for a professional's
        assessment. Figures are orientative and vary by case.
      </p>
    </div>
  );
}
