import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, ExternalLink, HelpCircle, GitCompare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getArticle, AutoGlossary, type Article } from "@/modules/education";
import { useLanguage } from "@/i18n/LanguageContext";
import { voicesForArticle, primaryVoiceLink } from "@/modules/content";

const KIND_LABEL: Record<Article["kind"], { en: string; es: string }> = {
  glosario: { en: "Glossary", es: "Glosario" },
  tratamiento: { en: "Treatment", es: "Tratamiento" },
  journey: { en: "Journey", es: "Recorrido" },
  negocio: { en: "How it's paid", es: "Cómo se paga" },
};

/** The expanded body in the active language; legacy English-only bodies go through the dictionary. */
function depthParagraphs(a: Article, es: boolean, t: (s: string) => string): string[] {
  const own = es ? a.body_es : a.body_en;
  if (own?.length) return own;
  return (a.body ?? []).map((p) => t(p));
}

export default function LearnArticle() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const es = language === "es";
  const article = slug ? getArticle(slug) : undefined;

  if (!article) {
    return (
      <div className="container max-w-2xl py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">{es ? "Guía no encontrada" : "Article not found"}</h1>
        <p className="text-muted-foreground">{es ? "Esta guía no existe o se ha movido." : "This explainer doesn't exist or was moved."}</p>
        <Button asChild variant="outline">
          <Link to="/descubre#basicos"><ArrowLeft className="size-4 mr-1" /> {es ? "Volver a Guías" : "Back to Guides"}</Link>
        </Button>
      </div>
    );
  }

  const a = article;
  const depth = depthParagraphs(a, es, t);
  const voices = voicesForArticle(a);

  return (
    <article className="container max-w-2xl py-10 space-y-6">
      <Link to="/descubre#basicos" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="size-4" /> {es ? "Guías" : "Guides"}
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[11px]">{es ? KIND_LABEL[a.kind].es : KIND_LABEL[a.kind].en}</Badge>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Clock className="size-3" /> {a.reading_time_min} min
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t(a.title)}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{t(a.hook)}</p>
      </header>

      <section aria-label={es ? "Resumen" : "Summary"} className="rounded-lg border-l-2 border-accent bg-accent-soft/30 px-5 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{es ? "En breve" : "In short"}</div>
        <p className="leading-relaxed"><AutoGlossary>{t(a.summary)}</AutoGlossary></p>
      </section>

      {depth.length > 0 && (
        <section aria-labelledby="in-depth" className="space-y-4 border-t border-border pt-6">
          <h2 id="in-depth" className="font-display text-2xl font-medium">{es ? "En detalle" : "In depth"}</h2>
          {depth.map((p, i) =>
            p.startsWith("### ") ? (
              <h3 key={i} className="pt-2 text-base font-semibold text-foreground">{p.slice(4)}</h3>
            ) : (
              <p key={i} className="leading-relaxed text-foreground/90"><AutoGlossary>{p}</AutoGlossary></p>
            ),
          )}
        </section>
      )}

      {a.steps && a.steps.length > 0 && (
        <div className="space-y-3">
          {a.steps.map((s, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold">{t(s.title)}</div>
                {s.typical_duration && (
                  <Badge variant="outline" className="text-[10px] shrink-0">{t(s.typical_duration)}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{t(s.detail)}</p>
            </Card>
          ))}
        </div>
      )}

      {a.differences && a.differences.length > 0 && (
        <div className="rounded-xl border p-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <GitCompare className="size-3.5" /> {es ? "En qué se diferencia" : "How it differs"}
          </div>
          {a.differences.map((d, i) => (
            <p key={i} className="text-sm leading-relaxed">
              <strong className="text-foreground">{es ? "frente a" : "vs"} {t(d.vs)}:</strong>{" "}
              <span className="text-muted-foreground">{t(d.note)}</span>
            </p>
          ))}
        </div>
      )}

      {a.faqs && a.faqs.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <HelpCircle className="size-3.5" /> {es ? "Preguntas frecuentes" : "FAQ"}
          </div>
          {a.faqs.map((f, i) => (
            <details key={i} className="rounded-lg border p-3">
              <summary className="cursor-pointer font-medium text-sm">{t(f.q)}</summary>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{t(f.a)}</p>
            </details>
          ))}
        </div>
      )}

      {voices.length > 0 && (
        <section aria-labelledby="voices-on-topic" className="space-y-3 border-t border-border pt-6">
          <div>
            <h2 id="voices-on-topic" className="font-display text-xl font-medium flex items-center gap-2">
              <Users className="size-4 text-primary" /> {es ? "Voces que tratan este tema" : "Voices on this topic"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {es
                ? "Divulgadores y comunidades que hablan a menudo de esta área en sus canales. No es un vídeo concreto sobre este término."
                : "Creators and communities who often cover this area on their channels. Not a specific video about this exact term."}
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {voices.map((r) => (
              <li key={r.id} className="flex min-w-0 flex-col rounded-lg border border-border/70 bg-card/60 p-4">
                <div className="font-display text-base font-medium leading-snug break-words">{r.name}</div>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground break-words">{r.platform}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed">{r.blurb[language]}</p>
                <div className="mt-3 space-y-1 border-t border-border pt-2">
                  <Badge variant="outline" className="border-accent/50 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                    {es ? "Transparencia" : "Why trust it"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{r.affiliation[language]}</p>
                </div>
                <a href={primaryVoiceLink(r)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  {es ? "Ver su canal" : "See their channel"} <ExternalLink className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="rounded-lg bg-muted/40 border p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{es ? "Fuentes" : "Sources"}</div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {a.sources.map((s) => (
            <li key={s.label} className="text-xs">
              {s.url ? (
                <a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                  {t(s.label)} <ExternalLink className="size-3" />
                </a>
              ) : (
                <span className="text-muted-foreground">{t(s.label)}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground border-t pt-4 leading-relaxed">{t(a.disclaimer)}</p>
    </article>
  );
}
