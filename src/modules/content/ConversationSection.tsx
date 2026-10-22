import { ExternalLink, MessageCircle, TrendingUp, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import { AUDIENCE_LABEL, type Audience } from "./types";
import { usePublishedTopics, type TopicRow } from "./conversation";

function TopicCard({ t }: { t: TopicRow }) {
  const { language } = useLanguage();
  const es = language === "es";
  const up = t.trend === "up";
  return (
    <Card className="flex min-w-0 flex-col rounded-lg border-border/70 bg-card/60 p-6 shadow-none">
      <div className="flex flex-wrap items-center gap-2">
        {(t.audiences as Audience[]).slice(0, 2).map((a) => (
          <Badge key={a} variant="outline" className="border-accent/60 bg-accent/10 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            {AUDIENCE_LABEL[a]?.[language] ?? a}
          </Badge>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          {up ? <TrendingUp className="size-3 text-primary" /> : <Minus className="size-3" />}
          {up ? (es ? "en aumento" : "rising") : (es ? "estable" : "steady")}
        </span>
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        ≈ {t.mentions_estimate} {es ? "menciones · anónimo" : "mentions · anonymous"}
      </p>
      <h3 className="mt-2 font-display text-xl font-medium leading-snug text-balance">{es ? t.question_es : t.question_en}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{es ? t.answer_es : t.answer_en}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          <MessageCircle className="size-2.5" aria-hidden /> {es ? "lo que se dice · señal anecdótica" : "what people say · anecdotal signal"}
        </span>
        {t.source_url ? (
          <a href={t.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            {t.source_forum} <ExternalLink className="size-3" />
          </a>
        ) : <span className="text-xs text-muted-foreground">{t.source_forum}</span>}
      </div>
    </Card>
  );
}

/** "This week's conversation" — hidden entirely when nothing is published. */
export function ConversationSection() {
  const { language } = useLanguage();
  const es = language === "es";
  const topics = usePublishedTopics();
  if (topics.length === 0) return null;
  return (
    <section className="mt-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{es ? "Escuchamos los foros" : "We listen to the forums"}</p>
      <h2 className="mt-2 font-display text-3xl font-medium">{es ? "La conversación de esta semana" : "This week's conversation"}</h2>
      <p className="mt-2 max-w-[65ch] text-sm text-muted-foreground">
        {es
          ? "Las preguntas que más se repiten en foros públicos de pacientes, resumidas sin nombres ni historias personales. Es lo que se dice, no consejo médico."
          : "The questions people ask most in public patient forums, summarised with no names or personal stories. It is what people say, not medical advice."}
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">{topics.map((t) => <TopicCard key={t.id} t={t} />)}</div>
    </section>
  );
}
