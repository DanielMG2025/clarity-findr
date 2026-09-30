import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/patient/PageHeader";
import { citation, ownEggCitationForAge } from "@/modules/evidence/citations";
import { useMasterRecord, usePatientJourney, type TreatmentInterest } from "@/modules/master-record";
import { seedEstimateForProfile } from "@/modules/provenance";
import { usePricingConfigurator } from "@/modules/pricing-configurator";
import { byCode, type FamilyStructure } from "@/modules/regulatory";

const FAMILY_PHRASE: Record<FamilyStructure, string> = {
  hetero_couple: "part of a heterosexual couple",
  female_couple: "part of a female couple",
  single_woman: "a single woman",
  male_couple: "part of a male couple",
  single_man: "a single man",
};

const TREATMENT_PHRASE: Record<TreatmentInterest, string> = {
  ivf: "IVF with your own eggs",
  icsi: "IVF with ICSI, where one sperm is placed directly into an egg",
  egg_donation: "treatment with donor eggs",
  social_freezing: "egg freezing",
  iui: "intrauterine insemination (IUI)",
  unsure: "which fertility treatment may fit you",
};

function formatEuro(value: number) {
  return `€${Math.round(value).toLocaleString()}`;
}

function joinNaturally(parts: string[]) {
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className={`report-card space-y-3 border-t border-border/70 pt-5 first:border-t-0 first:pt-0 ${number === "04" ? "print:break-before-page" : ""}`}>
      <div className="flex items-baseline gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-primary">{number}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="space-y-3 text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

export default function OrientationSummary() {
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
  const situationParts = [
    age != null ? `You're ${age}` : undefined,
    country ? `living in ${country}` : undefined,
    family ? FAMILY_PHRASE[family] : undefined,
    treatment ? `considering ${TREATMENT_PHRASE[treatment]}` : undefined,
  ].filter((part): part is string => Boolean(part));
  const optionRows = journey.step4_costs.slice(0, 3);
  const blockedResult = journey.step0_regulatory?.results.find((result) => result.verdict === "not_allowed");
  const reportDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

  // Narrative opening — a warm, plain-language lead-in written from the patient's
  // own values. Read-only: it introduces the structured sections below, it never
  // recalculates anything.
  const travelBlocked = journey.step0_regulatory?.needs_to_travel ? blockedResult : undefined;
  const missingAnything = journey.step2_orientation.factors.some((factor) => factor.kind === "missing");
  const lead = joinNaturally(
    [
      age != null ? `you're ${age}` : undefined,
      country ? `living in ${country}` : undefined,
      treatment ? `thinking about ${TREATMENT_PHRASE[treatment]}` : "still working out which direction may suit you",
    ].filter((part): part is string => Boolean(part)),
  );
  const narrative = [
    `Thank you for being here. Right now ${lead}. ${
      family ? `Doing this as ${FAMILY_PHRASE[family]} shapes some of the questions you'll be asked along the way. ` : ""
    }Whatever brought you to this page — a conversation, a result you didn't expect, or simply the feeling that it was time to look properly — deciding to understand your options is a real step, and not a small one.`,
    `What we can offer you today is honest orientation rather than a forecast. Everything below comes from national registries, published price lists and the legal rules that apply where you live, chosen so that you can check any of it yourself. That makes it useful for knowing what to expect and what to ask. It cannot tell you what will happen in your own body, and we would rather say that plainly than hint at something we can't support.${
      missingAnything
        ? " A few of the numbers that would sharpen this — your hormone results, mainly — aren't in your profile yet, so where we can't be specific we've said so instead of guessing."
        : ""
    }`,
    travelBlocked
      ? `One thing is worth understanding early, because it shapes the path more than anything else: ${travelBlocked.label} is not currently available to you in ${
          country ?? "your country"
        }. That is about the rules where you live, not about you or your health. It rarely closes the door — more often it moves it — so the options below include the places where that path is open, and you can weigh it calmly rather than stumble on it later.`
      : ageEvidence
        ? `The thing worth understanding first is how age sits in all of this. It isn't a judgement about you; it is simply the factor published data follows most carefully, because egg numbers and how predictably the ovaries respond do change over time. That is why the figure below is grouped by age band rather than given as one number, and why a clinic will want your own hormone results — those are what turn a general pattern into something that actually describes you.`
        : `The thing worth understanding first is that most fertility questions come down to a handful of ordinary measurements: hormone levels in a blood test, a simple ultrasound count of the small follicles present in the ovaries, and a clear diagnosis. None of them is frightening on its own, and together they are what turns a general conversation into one that is specifically about you.`,
    `The encouraging part is that there are far fewer paths to weigh than it feels like from the outside, and the questions that matter are ordinary, practical ones: what a clinic actually recommends for someone in your situation, what a quoted price includes, and what the rules where you live allow. This page exists to lay those out in plain language, with nothing important hidden behind a word you'd have to look up.`,
    `So here is the fuller picture, in the same plain terms: your situation, what the published evidence says about it, the options that tend to fit, what they cost, and a few sensible next steps.`,
  ];

  return (

    <div className="report-page mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-8 md:py-10">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="link" className="h-auto px-0 text-muted-foreground hover:text-primary">
          <Link to="/report">See the full detailed report <ArrowRight className="size-3.5" /></Link>
        </Button>
        <Button onClick={() => window.print()} className="gap-2 rounded-full">
          <Printer className="size-4" /> Download / Print PDF
        </Button>
      </div>

      <div className="report-document-header border-b border-primary/20 pb-5">
        <PageHeader
          eyebrow="Fertility Compass"
          title="Your orientation summary"
          subtitle="A short, human explanation of your situation and the options that may be worth exploring."
          note={`Prepared ${reportDate} · Orientation based on public data — not a diagnosis or a personalized prediction.`}
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
          <div className="space-y-4 text-[15px] leading-8 text-muted-foreground">
            {narrative.map((paragraph, index) => (
              <p key={index} className={index === narrative.length - 1 ? "font-medium text-foreground" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
          <Card className="rounded-2xl p-6 sm:p-8">

          <div className="space-y-6">
            <Section number="01" title="Your situation">
              <p>{joinNaturally(situationParts)}.</p>
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
                    <span><strong className="font-semibold text-foreground">Explore treatment abroad.</strong> {blockedResult.label} is not currently available for your situation in {country ?? "your country"}, while existing regulatory data lists {joinNaturally(blockedResult.alternatives.slice(0, 3).map((item) => item.label))} as possible alternatives to confirm directly.</span>
                  </li>
                )}
              </ol>
              <p>These are options to discuss, not instructions. A clinician can help you understand which one fits your medical history and priorities.</p>
            </Section>

            <Section number="04" title="What it might cost">
              {priceEstimate && !priceEstimate.empty ? (
                <p>Published prices for {TREATMENT_PHRASE[treatment ?? "unsure"]} in {country ?? profile.country} currently point to a range of <strong className="font-semibold text-foreground">{formatEuro(priceEstimate.range_min)}–{formatEuro(priceEstimate.range_max)}</strong>, with a central estimate of about <strong className="font-semibold text-foreground">{formatEuro(priceEstimate.expected)}</strong> and {priceEstimate.confidence} confidence. These prices are usually per cycle and often exclude medication, storage, travel and case-specific extras, so only a clinic quote can confirm your total.</p>
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
        </>
      )}

    </div>
  );
}
