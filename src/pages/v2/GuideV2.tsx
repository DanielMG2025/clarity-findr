import { Link, useParams } from "react-router-dom";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getArticle } from "@/modules/education";
import { CONFIDENCE_LABEL, usePublishedPills, voicesForArticle, primaryVoiceLink } from "@/modules/content";
import { PillCard } from "@/modules/content/PillCard";
import { usePublishedTopics, platformFamily, provenanceSummary } from "@/modules/content/conversation";
import { forumTopicsForArticle, conversationLink } from "@/modules/content/forumLinks";
import { ADDONS, ADDONS_FRAMING, ADDON_RATING_LABEL, ADDON_WHAT, FINDINGS } from "@/modules/content/science";
import { CONFIDENCE_LABEL as REG_CONFIDENCE } from "@/modules/content/regulation";
import { scopeFromMarket, scopeLabel, isOtherCountry } from "@/modules/evidence/geoScope";
import { useBasics, ageLabel, maleFocus, reasonLabel, treatmentCountry } from "@/modules/journey-v2/basics";
import { countryOption } from "@/modules/journey-v2/countries";
import { MALE_GUIDE_ID, TREATMENTS_V2, treatmentById, type TreatmentV2 } from "@/modules/journey-v2/treatments";
import { ageForGuide, guideArticles, guideFindings, guideSources, guideTags, priceLines, regulationFor, regulationLink } from "@/modules/journey-v2/guide";
import { LIBRARY_PATH, PREPARE_PATH, changePath, guidePath, reviewPath } from "@/modules/journey-v2/paths";
import { STEP_OF } from "@/modules/journey-v2/answers";
import { MissingAnswers } from "./answersUi";
import { useLanguage } from "@/i18n/LanguageContext";
import { Eyebrow, Fold, Pending, SMALL_CAPS, useL } from "./ui";

const euro = (n: number, es: boolean) => new Intl.NumberFormat(es ? "es-ES" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Buttons that always open a guide (never a click without effect). */
function TreatmentLinks() {
  const { L } = useL();
  return (
    <div className="flex flex-wrap gap-2">
      {TREATMENTS_V2.map((t) => (
        <Button key={t.id} asChild variant="outline" size="sm" className="rounded-full"><Link to={guidePath(t.id)}>{L(t.label)}</Link></Button>
      ))}
    </div>
  );
}

/** "[Tratamiento] · [país] · [edad] · [situación] · cambiar": each answer opens only its own question and comes back here. */
function CaseBar({ t }: { t: TreatmentV2 }) {
  const { L, es, language } = useL();
  const b = useBasics();
  const here = guidePath(t.id);
  const where = countryOption(treatmentCountry(b));
  const parts: { text: string; step: number }[] = [
    { text: L(t.label), step: STEP_OF.treatment },
    ...(where ? [{ text: `${es ? "para" : "for"} ${L(where.name)}`, step: STEP_OF.residence }] : []),
    ...(b.age ? [{ text: ageLabel(b.age, language)!, step: STEP_OF.age }] : []),
    ...(b.reason ? [{ text: reasonLabel(b.reason, language)!, step: STEP_OF.reason }] : []),
  ];
  return (
    <p className="text-sm text-muted-foreground" data-testid="guide-casebar">
      {parts.map((p, i) => (
        <span key={p.text}>
          {i > 0 && " · "}
          <Link to={changePath(p.step, here)} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">{p.text}</Link>
        </span>
      ))}
      {" · "}
      <Link to={reviewPath(here)} className="text-primary underline-offset-4 hover:underline" data-testid="guide-casebar-change">{es ? "cambiar" : "change"}</Link>
    </p>
  );
}

function Section({ title, children, testId }: { title: string; children: React.ReactNode; testId?: string }) {
  return (
    <section className="space-y-3 border-t border-border/70 pt-6" data-testid={testId}>
      <h2 className="font-display text-2xl font-medium">{title}</h2>
      {children}
    </section>
  );
}

function AgeSection({ t }: { t: TreatmentV2 }) {
  const { es, language } = useL();
  const b = useBasics();
  const block = ageForGuide(t, b);
  if (!block) return null;
  const f = block.finding;
  const scope = scopeFromMarket(block.kind === "hfea-table" ? "UK" : null);
  const own = treatmentCountry(b);
  return (
    <Section title={es ? `Qué cambia a tu edad (${ageLabel(b.age, language)})` : `What changes at your age (${ageLabel(b.age, language)})`} testId="guide-age">
      {block.kind === "hfea-table" ? (
        <>
          <ul className="space-y-1">
            {block.rows.map((r) => (
              <li key={r.band} className="flex items-baseline justify-between gap-3 border-b border-border/60 py-1.5 text-sm">
                <span>{es ? `${r.band} años` : `${r.band} years`}</span><span className="font-display text-lg tabular-nums">{r.rate}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">{block.caption[language]}{block.note ? ` · ${block.note[language]}` : ""}</p>
          <p className="text-sm leading-relaxed">{es ? f.summary_es : f.summary_en}</p>
          <p className="text-xs text-muted-foreground">
            <span className="rounded-full border border-accent/50 px-2 py-0.5 text-primary">{scopeLabel(scope, language)}</span>
            {isOtherCountry(scope, own) && <> · {es ? "No hay un dato equivalente de tu país en esta fuente; se muestra como referencia." : "There's no equivalent figure from your country in this source; shown as a reference."}</>}
          </p>
        </>
      ) : (
        <>
          <p className="font-medium">{es ? f.title_es : f.title_en}</p>
          <p className="text-sm leading-relaxed">{es ? f.summary_es : f.summary_en}</p>
        </>
      )}
      <p className="text-xs text-muted-foreground">
        {es ? "Fuente" : "Source"}: <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{f.source_label}</a> · {f.source_year}
      </p>
    </Section>
  );
}

function PriceSection({ t }: { t: TreatmentV2 }) {
  const { es, L, language } = useL();
  const b = useBasics();
  const lines = priceLines(t, b);
  if (lines.length === 0) return null;
  const names = lines.map((l) => L(countryOption(l.country)!.name)).join(es ? " y " : " and ");
  return (
    <Section title={es ? `Cuánto cuesta en ${names}` : `What it costs in ${names}`} testId="guide-price">
      {lines.map((l) => {
        const name = L(countryOption(l.country)!.name);
        if (!l.price) return <Pending key={l.country}>{es ? `Aún no tenemos un precio de referencia con fuente para ${L(t.label)} en ${name}.` : `We don't yet have a sourced reference price for ${L(t.label)} in ${name}.`}</Pending>;
        return (
          <div key={l.country} className="space-y-1">
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm">{name}</span>
              <span className="font-display text-2xl tabular-nums">{euro(l.price.min, es)} – {euro(l.price.max, es)}</span>
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {es ? "Por ciclo, en general sin incluir la medicación" : "Per cycle, generally excluding medication"} · {es ? "Fuentes" : "Sources"}: {l.sources.map((s) => s.label).join("; ")} · {l.price.as_of} · {CONFIDENCE_LABEL[l.price.confidence][language]}
            </p>
          </div>
        );
      })}
      <Link to="/costes" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Ver el desglose de costes" : "See the cost breakdown"} <ArrowRight aria-hidden className="size-3.5" /></Link>
    </Section>
  );
}

/**
 * Male content that already exists (pills, the ICSI evidence, the ICSI guide, voices).
 * Shown first when the information is for a man or about male fertility; the
 * dedicated guide is still "en preparación".
 */
function MaleBlock({ own }: { own: boolean }) {
  const { es, language } = useL();
  const pills = usePublishedPills();
  const m = treatmentById(MALE_GUIDE_ID)!;
  const related = pills.filter((p) => m.pills.includes(p.id));
  const findings = guideFindings(m);
  const voices = voicesForArticle({ tags: guideTags(m) }).filter((r) => r.audiences?.includes("men"));
  return (
    <Section title={es ? "Fertilidad masculina" : "Male fertility"} testId="guide-male">
      {!own && <p className="text-sm text-muted-foreground">{es ? "Está aquí primero porque la información es para un hombre o sobre fertilidad masculina." : "It's here first because the information is for a man or about male fertility."}</p>}
      {!own && <Link to={guidePath(MALE_GUIDE_ID)} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Ver todo lo que tenemos sobre fertilidad masculina" : "See everything we have on male fertility"} <ArrowRight aria-hidden className="size-3.5" /></Link>}
      {own && (
        <>
          {related.map((p) => <PillCard key={p.id} pill={p} />)}
          {findings.map((f) => (
            <div key={f.id} className="border-l-2 border-accent/60 pl-3">
              <p className="font-medium">{es ? f.title_es : f.title_en}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{es ? f.summary_es : f.summary_en} {es ? f.means_es : f.means_en}</p>
              <p className="mt-1 text-xs text-muted-foreground">{es ? "Evidencia" : "Evidence"}: <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{f.source_label}</a> · {f.source_year}</p>
            </div>
          ))}
          <Link to="/aprende/what-is-icsi" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Leer la guía de ICSI (la técnica que se usa cuando hay un problema en el semen)" : "Read the ICSI guide (the technique used when there's a sperm problem)"} <ArrowRight aria-hidden className="size-3.5" /></Link>
          {voices.map((r) => <p key={r.id} className="text-sm"><a href={primaryVoiceLink(r)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.name}</a> <span className="text-muted-foreground">· {r.affiliation[language]}</span></p>)}
        </>
      )}
    </Section>
  );
}

/** Journey v2 · screen 4a: the guide in two layers. */
export default function GuideV2() {
  const { tratamiento } = useParams();
  const { t: tr } = useLanguage();
  const { es, L, language } = useL();
  const b = useBasics();
  const t = treatmentById(tratamiento);
  const topics = usePublishedTopics();
  const pills = usePublishedPills();

  if (!t) {
    return (
      <div className="container max-w-3xl space-y-5 px-6 py-12" data-testid="guide-unknown">
        <h1 className="font-display text-3xl font-medium">{es ? "No encontramos esta guía" : "We couldn't find this guide"}</h1>
        <p className="text-muted-foreground">{es ? "Elige un tratamiento:" : "Choose a treatment:"}</p>
        <TreatmentLinks />
      </div>
    );
  }

  const what = t.what ? getArticle(t.what) : undefined;
  const male = maleFocus(b);
  const isMaleGuide = t.id === MALE_GUIDE_ID;
  const articles = guideArticles(t);
  const faqs = articles.flatMap((a) => (a.faqs ?? []).map((f) => ({ ...f, slug: a.slug })));
  const findings = guideFindings(t);
  const related = pills.filter((p) => t.pills.includes(p.id));
  const tags = { tags: guideTags(t) };
  const forum = forumTopicsForArticle(tags, topics, 4);
  const prov = provenanceSummary(forum);
  const voices = voicesForArticle(tags);
  const country = treatmentCountry(b);
  const reg = regulationFor(country);
  const regName = countryOption(country)?.name;
  const sources = guideSources(t, b);
  const addonsFinding = FINDINGS.find((f) => f.is_addons);
  const pgta = FINDINGS.find((f) => f.id === "pgta");

  return (
    <article className="container max-w-3xl space-y-6 px-6 py-8 md:py-12" data-testid={`guide-${t.id}`}>
      <header className="space-y-3">
        <Eyebrow>{es ? "Guía" : "Guide"}</Eyebrow>
        <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">{L(t.label)}</h1>
        <CaseBar t={t} />
      </header>
      <MissingAnswers needs={t.age ? ["country", "age"] : ["country"]} why={es ? "Para enseñarte precios, reglas y lo que cambia a tu edad, nos falta solo esto:" : "To show you prices, rules and what changes at your age, we only need this:"} />

      {!what ? (
        <>
          <Pending>{es ? `La guía de ${L(t.label).toLowerCase()} todavía no está escrita. No la rellenamos con contenido sin fuente.` : `The ${L(t.label).toLowerCase()} guide isn't written yet. We don't fill it with unsourced content.`}</Pending>
          {isMaleGuide && <MaleBlock own />}
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full"><Link to={PREPARE_PATH}>{es ? "Preparar mi tratamiento" : "Prepare my treatment"}</Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link to={LIBRARY_PATH}>{es ? "Ir a la biblioteca" : "Go to the library"}</Link></Button>
          </div>
          <div className="space-y-2 border-t border-border/70 pt-6"><p className="text-sm text-muted-foreground">{es ? "Otras guías:" : "Other guides:"}</p><TreatmentLinks /></div>
        </>
      ) : (
        <>
          {/* LAYER 1 — the essentials */}
          {male && <MaleBlock own={false} />}
          <Section title={es ? "Qué es" : "What it is"} testId="guide-what">
            <p className="leading-relaxed">{tr(what.summary)}</p>
            <Link to={`/aprende/${what.slug}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Leer la guía completa" : "Read the full guide"} <ArrowRight aria-hidden className="size-3.5" /></Link>
          </Section>
          <AgeSection t={t} />
          <PriceSection t={t} />
          <div className="pt-2">
            <Button asChild size="lg" className="rounded-full" data-testid="guide-prepare"><Link to={PREPARE_PATH}>{es ? "Preparar mi tratamiento" : "Prepare my treatment"} <ArrowRight aria-hidden className="ml-1 size-4" /></Link></Button>
          </div>

          {/* LAYER 2 — going deeper */}
          <div className="flex items-center gap-3 pt-6" aria-hidden>
            <span className="h-px flex-1 bg-border" /><span className={`${SMALL_CAPS} text-muted-foreground`}>{es ? "¿Quieres profundizar?" : "Want to go deeper?"}</span><span className="h-px flex-1 bg-border" />
          </div>
          <div data-testid="guide-deeper">
            {(faqs.length > 0 || findings.length > 0 || related.length > 0) && (
              <Fold id="preguntas" title={es ? "Preguntas frecuentes" : "Frequently asked questions"} why={es ? "Las dudas que más se repiten, con lo que dice la evidencia al lado." : "The questions that come up most, with what the evidence says alongside."}>
                <div className="space-y-4">
                  {faqs.map((f) => (
                    <div key={f.q}><p className="font-medium">{tr(f.q)}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tr(f.a)}</p></div>
                  ))}
                  {findings.map((f) => (
                    <div key={f.id} className="border-l-2 border-accent/60 pl-3">
                      <p className="font-medium">{es ? f.title_es : f.title_en}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{es ? f.summary_es : f.summary_en} {es ? f.means_es : f.means_en}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{es ? "Evidencia" : "Evidence"}: <a href={f.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{f.source_label}</a> · {f.source_year}</p>
                    </div>
                  ))}
                  {related.length > 0 && <div className="space-y-3 pt-2"><p className={`${SMALL_CAPS} text-primary`}>{es ? "En una píldora" : "In a pill"}</p>{related.map((p) => <PillCard key={p.id} pill={p} />)}</div>}
                </div>
              </Fold>
            )}
            <Fold id="foros" title={es ? "Lo que se cuenta en foros y comunidades" : "What's said in forums and communities"} why={es ? "Experiencias de otras personas, resumidas sin nombres. Es señal, no evidencia." : "Other people's experiences, summarised with no names. It's a signal, not evidence."}>
              {forum.length === 0 ? <Pending>{es ? "Aún no tenemos conversaciones publicadas sobre este tratamiento." : "We don't have published conversations on this treatment yet."}</Pending> : (
                <div className="space-y-3">
                  {(prov.conversations > 0 || prov.forums > 0) && (
                    <p className="text-xs text-muted-foreground" data-testid="forum-provenance">
                      {[prov.conversations > 0 ? (es ? `≈${prov.conversations} conversaciones` : `≈${prov.conversations} conversations`) : null, prov.forums > 0 ? (es ? `${prov.forums} ${prov.forums === 1 ? "foro" : "foros"}` : `${prov.forums} ${prov.forums === 1 ? "forum" : "forums"}`) : null].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {forum.map((ft) => {
                      const q = es ? ft.question_es : ft.question_en;
                      return (
                        <li key={ft.id}><Link to={conversationLink(q)} className="block rounded-lg border border-border/70 p-3 hover:border-accent">
                          <span className="block font-medium leading-snug">{q}</span>
                          <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{platformFamily(ft.source_platform || ft.source_forum)}</span>
                        </Link></li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </Fold>
            {t.addons && addonsFinding && (
              <Fold id="extras" title={es ? "Los extras que te van a ofrecer" : "The extras you'll be offered"} why={es ? "Muchas clínicas ofrecen técnicas adicionales; aquí está cómo las puntúa el regulador británico." : "Many clinics offer additional techniques; this is how the UK regulator rates them."}>
                <p className="text-sm leading-relaxed">{ADDONS_FRAMING[language]}</p>
                <ul className="mt-3 divide-y divide-border/60">
                  {ADDONS.map((a) => (
                    <li key={a.name_en} className="py-2 text-sm">
                      <span className="flex items-baseline justify-between gap-3"><span className="font-medium">{es ? a.name_es : a.name_en}</span><span className="shrink-0 text-xs uppercase tracking-[0.12em] text-primary">{ADDON_RATING_LABEL[a.rating][language]}</span></span>
                      {ADDON_WHAT[a.name_en] && <span className="mt-0.5 block text-xs text-muted-foreground">{ADDON_WHAT[a.name_en][language]}</span>}
                    </li>
                  ))}
                </ul>
                {pgta && <p className="mt-3 text-sm text-muted-foreground">{es ? pgta.summary_es : pgta.summary_en}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{es ? "Fuente" : "Source"}: <a href={addonsFinding.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{addonsFinding.source_label}</a> · {addonsFinding.source_year}</p>
              </Fold>
            )}
            <Fold id="reglas" title={regName ? (es ? `Reglas en ${L(regName)}` : `Rules in ${L(regName)}`) : (es ? "Reglas de tu país" : "Rules in your country")} why={es ? "Quién puede tratarse y qué permite la ley cambia mucho de un país a otro." : "Who can be treated and what the law allows varies a lot between countries."}>
              {!country ? <Pending>{es ? "Elige tu país para ver sus reglas." : "Choose your country to see its rules."}</Pending> : !reg ? (
                <Pending>{es ? `Aún no tenemos la regulación de ${L(regName!)} verificada.` : `We don't have ${L(regName!)}'s regulation verified yet.`}</Pending>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="leading-relaxed">{es ? reg.summary_es : reg.summary_en}</p>
                  <p className="text-xs text-muted-foreground">{reg.legal_basis} · <a href={reg.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{reg.source_label}</a> · {es ? reg.updated_es : reg.updated_en} · {REG_CONFIDENCE[reg.confidence][language]}</p>
                </div>
              )}
              <Link to={reg ? regulationLink(reg) : "/descubre/regulacion"} className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">{es ? "Comparar con otros países" : "Compare with other countries"} <ArrowRight aria-hidden className="size-3.5" /></Link>
            </Fold>
            <Fold id="fuentes" title={es ? "Fuentes y entidades" : "Sources and organisations"} why={es ? "De dónde sale cada dato de esta guía, para que puedas comprobarlo." : "Where every figure in this guide comes from, so you can check it."}>
              <ul className="space-y-1 text-sm" data-testid="guide-sources">
                {sources.map((s) => (
                  <li key={`${s.label}|${s.url ?? ""}`}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{s.label} <ExternalLink aria-hidden className="size-3" /></a> : s.label}{s.date ? <span className="text-muted-foreground"> · {s.date}</span> : null}</li>
                ))}
              </ul>
              {voices.length > 0 && (
                <div className="mt-4 space-y-1">
                  <p className={`${SMALL_CAPS} text-primary`}>{es ? "Voces que tratan este tema" : "Voices on this topic"}</p>
                  {voices.map((r) => <p key={r.id} className="text-sm"><a href={primaryVoiceLink(r)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.name}</a> <span className="text-muted-foreground">· {r.affiliation[language]}</span></p>)}
                </div>
              )}
            </Fold>
          </div>
        </>
      )}
    </article>
  );
}
