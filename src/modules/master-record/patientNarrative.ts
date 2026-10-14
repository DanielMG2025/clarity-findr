import { citation, ownEggCitationForAge } from "@/modules/evidence/citations";
import { byCode, type FamilyStructure } from "@/modules/regulatory";
import type { MasterPatientRecord, TreatmentInterest } from "./types";
import type { Journey } from "./runDemo";

export const FAMILY_PHRASE: Record<FamilyStructure, string> = {
  hetero_couple: "part of a heterosexual couple",
  female_couple: "part of a female couple",
  single_woman: "a single woman",
  male_couple: "part of a male couple",
  single_man: "a single man",
};

export const TREATMENT_PHRASE: Record<TreatmentInterest, string> = {
  ivf: "IVF with your own eggs",
  icsi: "IVF with ICSI, where one sperm is placed directly into an egg",
  egg_donation: "treatment with donor eggs",
  social_freezing: "egg freezing",
  iui: "intrauterine insemination (IUI)",
  unsure: "which fertility treatment may fit you",
};

export function joinNaturally(parts: string[]) {
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

/** Shared read-only prose for the compact and detailed patient reports. */
export function patientNarrative(mpr: MasterPatientRecord, journey: Journey): string[] {
  const age = mpr.identity.age;
  const country = mpr.identity.country_of_residence ? byCode(mpr.identity.country_of_residence)?.label : undefined;
  const treatment = mpr.intent.treatment_interest;
  const family = mpr.identity.family_structure;
  const ageEvidence = age != null ? citation(ownEggCitationForAge(age)) : undefined;
  const blockedResult = journey.step0_regulatory?.results.find((result) => result.verdict === "not_allowed");

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
  return [
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

}
