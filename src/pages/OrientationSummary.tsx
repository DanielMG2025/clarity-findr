import { useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/patient/PageHeader";
import { ExampleCasePanel } from "@/components/patient/ExampleCasePanel";
import { citation, ownEggCitationForAge } from "@/modules/evidence/citations";
import { useMasterRecord, usePatientJourney } from "@/modules/master-record";
import { patientNarrative, FAMILY_PHRASE, FAMILY_PHRASE_ES, TREATMENT_PHRASE, TREATMENT_PHRASE_ES, joinNaturally } from "@/modules/master-record/patientNarrative";
import { seedEstimateForProfile } from "@/modules/provenance";
import { usePricingConfigurator } from "@/modules/pricing-configurator";
import { byCode } from "@/modules/regulatory";
import { needWithArticleEs } from "@/i18n/journey.es";

function formatEuro(value: number) {
  return `€${Math.round(value).toLocaleString()}`;
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className={`report-card space-y-5 border-t border-border/70 pt-8 first:border-t-0 first:pt-0 ${number === "04" ? "print:break-before-page" : ""}`}>
      <div className="flex items-center gap-4 rounded-lg bg-foreground px-5 py-6 text-background [print-color-adjust:exact] [-webkit-print-color-adjust:exact] sm:gap-6 sm:px-7 sm:py-7 print:break-inside-avoid print:py-4">
        <span className="shrink-0 font-display text-5xl font-normal leading-none text-accent tabular-nums sm:text-6xl">{number}</span>
        <div className="min-w-0 space-y-2">
          <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-accent">Chapter {number}</span>
          <h2 className="min-w-0 break-words font-display text-2xl font-medium leading-tight text-background sm:text-3xl">{title}</h2>
        </div>
      </div>
      <div className="max-w-[65ch] space-y-4 text-base leading-8 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function OrientationSummary() {
  const { language, t } = useLanguage();
  const es = language === "es";
  const mpr = useMasterRecord();
  const journey = usePatientJourney();
  const { profile, bundle } = usePricingConfigurator();
  const age = mpr.identity.age;
  const country = mpr.identity.country_of_residence ? byCode(mpr.identity.country_of_residence)?.label : undefined;
  const treatment = mpr.intent.treatment_interest;
  const family = mpr.identity.family_structure;
  const hasProfile = Boolean(age || country || family || treatment);

  const ageEvidence = age != null ? citation(ownEggCitationForAge(age)) : undefined;
  const donorEvidence = citation("pr_donor");
  const priceEstimate = useMemo(
    () => bundle.estimate ?? seedEstimateForProfile(profile.treatment, profile.country),
    [bundle.estimate, profile.country, profile.treatment],
  );
  const situationParts = (es
    ? [
        age != null ? `Tienes ${age} años` : undefined,
        country ? `vives en ${t(country)}` : undefined,
        family ? FAMILY_PHRASE_ES[family] : undefined,
        treatment ? `estás valorando ${TREATMENT_PHRASE_ES[treatment]}` : undefined,
      ]
    : [
        age != null ? `You're ${age}` : undefined,
        country ? `living in ${country}` : undefined,
        family ? FAMILY_PHRASE[family] : undefined,
        treatment ? `considering ${TREATMENT_PHRASE[treatment]}` : undefined,
      ]).filter((part): part is string => Boolean(part));
  const optionRows = journey.step4_costs.slice(0, 3);
  const blockedResult = journey.step0_regulatory?.results.find((result) => result.verdict === "not_allowed");
  const reportDate = new Intl.DateTimeFormat(language === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

  const narrative = patientNarrative(mpr, journey, language);

  return (

    <div className="report-page mx-auto max-w-3xl space-y-10 px-4 py-8 md:px-8 md:py-12">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="link" className="h-auto px-0 text-muted-foreground hover:text-primary">
          <Link to="/report">See the full detailed report <ArrowRight className="size-3.5" /></Link>
        </Button>
        <Button onClick={() => window.print()} className="gap-2 rounded-full">
          <Printer className="size-4" /> Download / Print PDF
        </Button>
      </div>

      <div className="report-document-header rounded-lg border-b border-accent/50 bg-foreground px-6 py-9 text-background [print-color-adjust:exact] [-webkit-print-color-adjust:exact] sm:px-10 sm:py-12 print:px-6 print:py-6 [&_h1]:break-words [&_h1]:font-display [&_h1]:text-4xl [&_h1]:font-medium [&_h1]:tracking-normal [&_h1]:text-background sm:[&_h1]:text-5xl [&_header>div]:min-w-0 [&_header>div]:space-y-4 [&_header>div>div]:text-accent [&_header>div>p]:text-background/80">
        <PageHeader
          eyebrow="Fertility Compass"
          title="Your orientation summary"
          subtitle="A short, human explanation of your situation and the options that may be worth exploring."
          note={es ? `Preparado el ${reportDate} · Orientación basada en datos públicos: no es un diagnóstico ni una predicción personalizada.` : `Prepared ${reportDate} · Orientation based on public data — not a diagnosis or a personalized prediction.`}
        />
      </div>

      {!hasProfile ? (
        <Card className="report-card rounded-2xl border-primary/20 bg-primary-soft/25 p-8 text-center">
          <FileText className="mx-auto size-8 text-primary" />
          <h2 className="mt-3 text-xl font-semibold">Tell us a little about your situation first</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Share your age, country and what you are considering. We can then turn the information already in your profile into a clear, personal summary.
          </p>
          <Button asChild className="no-print mt-5 rounded-full"><Link to="/situacion">Complete my situation</Link></Button>
        </Card>
      ) : (
        <>
          <ExampleCasePanel journey={journey} />
          <div className="max-w-[65ch] space-y-6 text-base leading-8 text-muted-foreground">
            {narrative.map((paragraph, index) => (
              <p key={index} className={index === 0 ? "font-editorial text-2xl italic leading-relaxed text-foreground sm:text-3xl first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:not-italic first-letter:leading-none first-letter:text-primary sm:first-letter:text-7xl" : index === narrative.length - 1 ? "font-medium text-foreground" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
          <Card className="rounded-none border-0 bg-transparent p-0 shadow-none ring-0">

          <div className="space-y-10">
            <Section number="01" title="Your situation">
              <p>{joinNaturally(situationParts, language)}.</p>
              <p>This gives you a useful starting point. It helps frame the questions to ask, but it cannot tell us exactly how your body will respond or replace a consultation.</p>
            </Section>

            <Section number="02" title="What this usually means">
              {ageEvidence ? (
                <p>
                  For people in your age band, the {ageEvidence.source.publisher} reports a pregnancy rate of around <strong className="font-semibold text-foreground">{ageEvidence.value}%</strong> with their own eggs. That is a population average per fresh embryo transfer, not your personal chance and not the chance per cycle started, because some cycles do not reach a transfer.
                </p>
              ) : (
                <p>Age is one of the main factors used in published fertility data. Once you add it, this summary can show the registry figure for your age band without turning it into a personal prediction.</p>
              )}
              {(treatment === "egg_donation" || (age != null && age >= 41)) && donorEvidence && (
                <p>Donor-egg treatment is another path people often discuss in this context. European registry data reports around <strong className="font-semibold text-foreground">{donorEvidence.value}%</strong> per fresh embryo transfer, but this is still a broad population figure rather than a promise for one person.</p>
              )}
            </Section>

            <Section number="03" title="Your most likely options">
              <ol className="space-y-2.5">
                {optionRows.map((option, index) => (
                  <li key={option.estimate.plan} className="flex gap-3">
                    <span className="mt-0.5 font-semibold text-primary">{index + 1}.</span>
                    <span><strong className="font-semibold text-foreground">{option.estimate.plan_label}.</strong> {option.why_this_plan}</span>
                  </li>
                ))}
                {blockedResult && blockedResult.alternatives.length > 0 && (
                  <li className="flex gap-3">
                    <span className="mt-0.5 font-semibold text-primary">{optionRows.length + 1}.</span>
                    <span><strong className="font-semibold text-foreground">Explore treatment abroad.</strong> {es
                      ? `Ahora mismo ${needWithArticleEs(blockedResult.label)} no está disponible para tu situación en ${country ? t(country) : "tu país"}; los datos legales disponibles señalan ${joinNaturally(blockedResult.alternatives.slice(0, 3).map((item) => t(item.label)), "es")} como alternativas posibles, que conviene confirmar directamente.`
                      : `${blockedResult.label} is not currently available for your situation in ${country ?? "your country"}, while existing regulatory data lists ${joinNaturally(blockedResult.alternatives.slice(0, 3).map((item) => item.label))} as possible alternatives to confirm directly.`}</span>
                  </li>
                )}
              </ol>
              <p>These are options to discuss, not instructions. A clinician can help you understand which one fits your medical history and priorities.</p>
            </Section>

            <Section number="04" title="What it might cost">
              {priceEstimate && !priceEstimate.empty ? (
                es ? (
                  <p>{`Los precios publicados para ${TREATMENT_PHRASE_ES[treatment ?? "unsure"]} en ${t(country ?? profile.country)} apuntan ahora a un rango de `}<strong className="font-semibold text-foreground">{formatEuro(priceEstimate.range_min)}–{formatEuro(priceEstimate.range_max)}</strong>{", con una estimación central de unos "}<strong className="font-semibold text-foreground">{formatEuro(priceEstimate.expected)}</strong>{` y una confianza ${priceEstimate.confidence === "high" ? "alta" : priceEstimate.confidence === "medium" ? "media" : "baja"}. Estos precios suelen ser por ciclo y a menudo no incluyen medicación, almacenamiento, viajes ni extras propios de cada caso, así que solo el presupuesto de una clínica puede confirmar tu total.`}</p>
                ) : (
                <p>Published prices for {TREATMENT_PHRASE[treatment ?? "unsure"]} in {country ?? profile.country} currently point to a range of <strong className="font-semibold text-foreground">{formatEuro(priceEstimate.range_min)}–{formatEuro(priceEstimate.range_max)}</strong>, with a central estimate of about <strong className="font-semibold text-foreground">{formatEuro(priceEstimate.expected)}</strong> and {priceEstimate.confidence} confidence. These prices are usually per cycle and often exclude medication, storage, travel and case-specific extras, so only a clinic quote can confirm your total.</p>
                )
              ) : (
                <p>There is not enough published price data for this exact treatment and country, so we have not shown a number. A clinic can give you an itemised quote once your treatment plan is clearer.</p>
              )}
            </Section>

            <Section number="05" title="Good next steps">
              <ul className="space-y-2.5">
                <li>Arrange a consultation to confirm which options fit your own medical results.</li>
                <li>Ask each clinic what its quote includes, especially medication, testing, freezing, storage and extra transfers.</li>
                {journey.step2_orientation.factors.some((factor) => factor.kind === "missing") && <li>Bring any recent hormone tests or scan results, as these can make the conversation more specific.</li>}
              </ul>
              <p>Every figure here is sourced. <Link to="/report" className="font-medium text-primary underline-offset-4 hover:underline">See the full report for the evidence behind it <ArrowRight className="inline size-3.5" /></Link></p>
            </Section>
          </div>
        </Card>
          <footer className="flex flex-wrap items-center gap-5 rounded-lg bg-foreground px-6 py-7 text-background [print-color-adjust:exact] [-webkit-print-color-adjust:exact] sm:px-8 print:break-inside-avoid print:py-4">
            <span className="font-display text-2xl font-medium">Fertility Compass</span>
            <span aria-hidden="true" className="h-px min-w-12 flex-1 bg-accent" />
          </footer>
        </>
      )}

    </div>
  );
}
