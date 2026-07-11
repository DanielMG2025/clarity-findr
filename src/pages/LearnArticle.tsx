import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, ExternalLink, HelpCircle, GitCompare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getArticle, type Article } from "@/modules/education";

const KIND_LABEL: Record<Article["kind"], string> = {
  glosario: "Glossary",
  tratamiento: "Treatment",
  journey: "Journey",
  negocio: "How it's paid",
};

export default function LearnArticle() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  if (!article) {
    return (
      <div className="container max-w-2xl py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <p className="text-muted-foreground">This explainer doesn't exist or was moved.</p>
        <Button asChild variant="outline">
          <Link to="/aprende"><ArrowLeft className="size-4 mr-1" /> Back to Learn</Link>
        </Button>
      </div>
    );
  }

  const a = article;

  return (
    <article className="container max-w-2xl py-10 space-y-6">
      <Link to="/aprende" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="size-4" /> Learn
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[11px]">{KIND_LABEL[a.kind]}</Badge>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Clock className="size-3" /> {a.reading_time_min} min
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{a.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{a.hook}</p>
      </header>

      <p className="leading-relaxed">{a.summary}</p>

      {a.body?.map((p, i) => (
        <p key={i} className="leading-relaxed text-foreground/90">{p}</p>
      ))}

      {a.steps && a.steps.length > 0 && (
        <div className="space-y-3">
          {a.steps.map((s, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold">{s.title}</div>
                {s.typical_duration && (
                  <Badge variant="outline" className="text-[10px] shrink-0">{s.typical_duration}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.detail}</p>
            </Card>
          ))}
        </div>
      )}

      {a.differences && a.differences.length > 0 && (
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <GitCompare className="size-3.5" /> How it differs
          </div>
          {a.differences.map((d, i) => (
            <p key={i} className="text-sm leading-relaxed">
              <strong className="text-foreground">vs {d.vs}:</strong>{" "}
              <span className="text-muted-foreground">{d.note}</span>
            </p>
          ))}
        </div>
      )}

      {a.faqs && a.faqs.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <HelpCircle className="size-3.5" /> FAQ
          </div>
          {a.faqs.map((f, i) => (
            <details key={i} className="rounded-lg border p-3">
              <summary className="cursor-pointer font-medium text-sm">{f.q}</summary>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-muted/40 border p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Sources</div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {a.sources.map((s) => (
            <li key={s.label} className="text-xs">
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                  {s.label} <ExternalLink className="size-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">{s.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground border-t pt-4 leading-relaxed">{a.disclaimer}</p>
    </article>
  );
}
