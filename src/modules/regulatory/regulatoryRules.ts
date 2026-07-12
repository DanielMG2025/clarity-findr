// Regulatory eligibility engine
// ---------------------------------------------------------------------------
// Answers the question nobody answers today:
//   "Given who I am and where I live, what can I legally do — and if I can't, where can I?"
//
// It's a GATE, not an extra: if your country doesn't allow what you need, the
// clinical probability and the price are irrelevant. That's why this engine
// filters the Costs and Clinics steps downstream.
//
// SOURCE: European Atlas of Fertility Treatment Policies (Fertility Europe + EPF),
// with ESHRE EIM survey data. See REG_SOURCE for the edition and date. Public,
// citable data.
//
// ⚠️ Regulation CHANGES. Each record carries `as_of` and `verify`. Before
// launch it must be re-validated country by country (France and Portugal have
// changed recently). Never present this as legal advice.

export const REG_SOURCE = {
  label: "European Atlas of Fertility Treatment Policies 2024 — Fertility Europe & EPF",
  url: "https://fertilityeurope.eu/atlas2024/",
  as_of: "2024-06",
  underlying: "ESHRE EIM survey as of 31-Dec-2022 + desk research",
  note: "Public, citable data. Regulation changes: re-verify before each publication.",
};

export const REG_DISCLAIMER =
  "Orientative information about the legal framework, based on public sources and subject to change. It is not legal or medical advice: confirm it with the clinic and, where relevant, a legal professional.";

// --- Axis 2: who you are ---------------------------------------------------
export type FamilyStructure =
  | "hetero_couple"
  | "female_couple"
  | "single_woman"
  | "male_couple"
  | "single_man";

// --- What you need ---------------------------------------------------------
export type Need =
  | "ivf_own_eggs" //      IVF/ICSI with own eggs
  | "sperm_donation" //    treatment with donor sperm
  | "egg_donation" //      egg donation
  | "iui_donor_sperm" //   insemination with donor sperm
  | "pgt" //               embryo genetic testing
  | "egg_freezing" //      egg freezing (social freezing)
  | "ropa"; //             shared motherhood (reception of oocytes from the partner)

export type Anonymity = "anonymous" | "non_anonymous" | "mixed" | "unknown";

export interface CountryRules {
  code: string;
  label: string;
  /** Access by family structure to each need. */
  access: Partial<Record<Need, FamilyStructure[]>>;
  anonymity: Anonymity;
  pgt: boolean;
  /** Public funding of IVF/ICSI (orientative). */
  public_funding: "none" | "partial" | "full";
  /** Public-health waiting list — a very relevant datum for the patient. */
  waiting_list?: "none" | "<6m" | "6-12m" | ">12m" | "unknown";
  /** Other access issues flagged by the Atlas. */
  access_issues?: string;
  /** Overall Atlas score (0-100), useful as a "friendliness" signal of the framework. */
  atlas_score?: number;
  as_of: string;
  verify?: string;
}

const ALL: FamilyStructure[] = ["hetero_couple", "female_couple", "single_woman"];
const HETERO_ONLY: FamilyStructure[] = ["hetero_couple"];

// Note: surrogacy is NOT in the Atlas and is PROHIBITED in Spain. It's mentioned
// only informatively and with extreme care; it's not modelled as a routable
// "need" to avoid inducing anything.

export const COUNTRIES: CountryRules[] = [
  {
    code: "ES", label: "Spain", atlas_score: 65.2,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: ALL,
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL, ropa: ["female_couple"],
    },
    anonymity: "anonymous", pgt: true, public_funding: "partial",
    waiting_list: ">12m", as_of: "2024-06",
    verify: "Public funding is uneven across autonomous communities and the waiting list is long (>12 months).",
  },
  {
    code: "IT", label: "Italy", atlas_score: 42.6,
    access: {
      ivf_own_eggs: HETERO_ONLY, sperm_donation: HETERO_ONLY, egg_donation: HETERO_ONLY,
      iui_donor_sperm: HETERO_ONLY, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "anonymous", pgt: true, public_funding: "partial",
    waiting_list: "6-12m", as_of: "2024-06",
    verify: "Restrictive framework: single women and female couples have NO access. It's the largest exporter of patients abroad (45% have already been treated abroad).",
  },
  {
    code: "FR", label: "France", atlas_score: 85.5,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: ALL,
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "non_anonymous", pgt: true, public_funding: "full",
    waiting_list: "6-12m", as_of: "2024-06",
    verify: "After the 2021 bioethics law: open access for single women and female couples, and NON-anonymous donation.",
  },
  {
    code: "PT", label: "Portugal", atlas_score: 71.9,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: ALL,
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "non_anonymous", pgt: true, public_funding: "partial",
    waiting_list: ">12m", as_of: "2024-06",
    verify: "NON-anonymous donation. Long public waiting list (>12 months).",
  },
  {
    code: "GR", label: "Greece", atlas_score: 57.7,
    access: {
      ivf_own_eggs: ["hetero_couple", "single_woman"],
      sperm_donation: ["hetero_couple", "single_woman"],
      egg_donation: ["hetero_couple", "single_woman"],
      iui_donor_sperm: ["hetero_couple", "single_woman"],
      pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "mixed", pgt: true, public_funding: "partial",
    waiting_list: "none", as_of: "2024-06",
    verify: "Single women YES; female couples NO. Mixed donation (anonymous or open-identity).",
  },
  {
    code: "CZ", label: "Czech Republic", atlas_score: 50.6,
    access: {
      ivf_own_eggs: HETERO_ONLY, sperm_donation: HETERO_ONLY, egg_donation: HETERO_ONLY,
      iui_donor_sperm: HETERO_ONLY, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "anonymous", pgt: true, public_funding: "partial",
    waiting_list: "none", as_of: "2024-06",
    verify: "CHEAP BUT RESTRICTIVE: heterosexual couples only. Key warning before someone travels for price.",
  },
  {
    code: "DK", label: "Denmark", atlas_score: 75.7,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: ALL,
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "mixed", pgt: true, public_funding: "partial",
    waiting_list: "6-12m", as_of: "2024-06",
    verify: "Anonymous or open-identity donor, by choice. A European reference for sperm donation.",
  },
  {
    code: "DE", label: "Germany", atlas_score: 66.3,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL,
      egg_donation: [], // PROHIBITED
      iui_donor_sperm: ["hetero_couple", "female_couple"],
      pgt: ALL, egg_freezing: [],
    },
    anonymity: "mixed", pgt: true, public_funding: "partial",
    waiting_list: "none", as_of: "2024-06",
    verify: "EGG DONATION PROHIBITED and a legal ban on most embryo freezing. That's why German patients travel: in the DACH region, legislation weighs MORE than cost as the reason.",
  },
  {
    code: "CH", label: "Switzerland", atlas_score: 26.1,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ["hetero_couple", "female_couple"],
      egg_donation: [], // PROHIBITED
      iui_donor_sperm: ["hetero_couple", "female_couple"],
      pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "non_anonymous", pgt: true, public_funding: "none",
    waiting_list: "unknown", as_of: "2024-06",
    verify: "Very restrictive: egg donation prohibited and no public funding.",
  },
  {
    code: "PL", label: "Poland", atlas_score: 62.1,
    access: {
      ivf_own_eggs: HETERO_ONLY, sperm_donation: HETERO_ONLY, egg_donation: HETERO_ONLY,
      iui_donor_sperm: HETERO_ONLY, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "anonymous", pgt: true, public_funding: "full",
    waiting_list: "none", as_of: "2024-06",
    verify: "Heterosexual couples only. Embryo donation is mandatory (leftovers must be donated).",
  },
  {
    code: "UK", label: "United Kingdom", atlas_score: 65.0,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: [...ALL, "male_couple"],
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "non_anonymous", pgt: true, public_funding: "partial",
    waiting_list: "unknown", as_of: "2024-06",
    verify: "NON-anonymous donation (identity disclosable at 18). Uneven funding by region.",
  },
  {
    code: "BE", label: "Belgium", atlas_score: 89.5,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: [...ALL, "male_couple"],
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "mixed", pgt: true, public_funding: "full",
    waiting_list: "none", as_of: "2024-06",
    verify: "The most favourable framework in Europe per the 2024 Atlas, alongside the Netherlands.",
  },
  {
    code: "NL", label: "Netherlands", atlas_score: 89.4,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: [...ALL, "male_couple"],
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "non_anonymous", pgt: true, public_funding: "partial",
    waiting_list: "none", as_of: "2024-06",
  },
  {
    code: "CY", label: "Cyprus", atlas_score: 33.9,
    access: {
      ivf_own_eggs: ["hetero_couple", "single_woman"],
      sperm_donation: ["hetero_couple", "single_woman"],
      egg_donation: ["hetero_couple", "single_woman"],
      iui_donor_sperm: ["hetero_couple", "single_woman"],
      pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "anonymous", pgt: true, public_funding: "none",
    waiting_list: "unknown", as_of: "2024-06",
    verify: "Single women YES; female couples NO. No public funding.",
  },
  {
    code: "EE", label: "Estonia", atlas_score: 74.4,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: ALL,
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "anonymous", pgt: true, public_funding: "partial",
    waiting_list: "none", as_of: "2024-06",
  },
  {
    code: "FI", label: "Finland", atlas_score: 75.3,
    access: {
      ivf_own_eggs: ALL, sperm_donation: ALL, egg_donation: ALL,
      iui_donor_sperm: ALL, pgt: ALL, egg_freezing: ALL,
    },
    anonymity: "non_anonymous", pgt: true, public_funding: "partial",
    waiting_list: "6-12m", as_of: "2024-06",
  },
];

export const byCode = (c: string) => COUNTRIES.find((x) => x.code === c);

// ---------------------------------------------------------------------------
// The engine
// ---------------------------------------------------------------------------

export type Verdict = "allowed" | "not_allowed" | "unknown";

export interface NeedResult {
  need: Need;
  label: string;
  verdict: Verdict;
  why: string;
  /** If not possible at home: countries where it would be, best first. */
  alternatives: { code: string; label: string; note?: string }[];
}

export interface RegulatoryOrientation {
  home: CountryRules;
  family: FamilyStructure;
  results: NeedResult[];
  /** true if something the patient needs is NOT possible in their country. */
  needs_to_travel: boolean;
  /** Countries viable for ALL their needs — filters Costs and Clinics. */
  viable_countries: string[];
  headline: string;
  anonymity_note: string;
  /** Public funding and waiting list — often the first thing the patient wants to know. */
  funding_note: string;
  source: typeof REG_SOURCE;
  disclaimer: string;
}

const NEED_LABEL: Record<Need, string> = {
  ivf_own_eggs: "IVF with own eggs",
  sperm_donation: "Treatment with donor sperm",
  egg_donation: "Egg donation",
  iui_donor_sperm: "Insemination with donor sperm",
  pgt: "Embryo genetic testing (PGT)",
  egg_freezing: "Egg freezing",
  ropa: "ROPA method (shared motherhood)",
};

function allows(c: CountryRules, need: Need, family: FamilyStructure): Verdict {
  const list = c.access[need];
  if (list === undefined) return "unknown";
  return list.includes(family) ? "allowed" : "not_allowed";
}

function anonymityNote(a: Anonymity): string {
  switch (a) {
    case "anonymous":
      return "Donation is anonymous: you won't know the donor's identity, nor will the child be able to.";
    case "non_anonymous":
      return "Donation is NOT anonymous: the child will be able to know the donor's identity upon reaching adulthood.";
    case "mixed":
      return "There are anonymous and open-identity donors: you can choose.";
    default:
      return "The donor anonymity regime must be confirmed with the clinic.";
  }
}

/** Produce the patient's regulatory orientation. */
export function regulatoryOrientation(
  homeCode: string,
  family: FamilyStructure,
  needs: Need[],
): RegulatoryOrientation | null {
  const home = byCode(homeCode);
  if (!home) return null;

  const results: NeedResult[] = needs.map((need) => {
    const verdict = allows(home, need, family);
    const alternatives =
      verdict === "allowed"
        ? []
        : COUNTRIES.filter((c) => c.code !== home.code && allows(c, need, family) === "allowed")
            .sort((a, b) => (b.atlas_score ?? 0) - (a.atlas_score ?? 0))
            .map((c) => ({ code: c.code, label: c.label, note: c.verify }));

    const why =
      verdict === "allowed"
        ? `In ${home.label}, ${NEED_LABEL[need].toLowerCase()} is available for your situation.`
        : verdict === "not_allowed"
          ? `In ${home.label}, ${NEED_LABEL[need].toLowerCase()} is not available for your situation under the current legal framework.`
          : `We haven't confirmed the legal framework for ${NEED_LABEL[need].toLowerCase()} in ${home.label}.`;

    return { need, label: NEED_LABEL[need], verdict, why, alternatives };
  });

  const blocked = results.filter((r) => r.verdict === "not_allowed");
  const needs_to_travel = blocked.length > 0;

  // Countries where ALL needs are possible
  const viable_countries = COUNTRIES.filter((c) =>
    needs.every((n) => allows(c, n, family) === "allowed"),
  ).map((c) => c.code);

  const headline = needs_to_travel
    ? `In ${home.label} there are ${blocked.length} option(s) out of your reach. We show you where they would be available.`
    : `In ${home.label}, all the options you're looking for are available for your situation.`;

  const funding_note = fundingNote(home);

  return {
    home,
    family,
    results,
    needs_to_travel,
    viable_countries,
    headline,
    anonymity_note: anonymityNote(home.anonymity),
    funding_note,
    source: REG_SOURCE,
    disclaimer: REG_DISCLAIMER,
  };
}

function fundingNote(c: CountryRules): string {
  const f =
    c.public_funding === "full"
      ? "There is public funding"
      : c.public_funding === "partial"
        ? "There is partial public funding"
        : "There is no public funding";
  const w =
    c.waiting_list === ">12m"
      ? ", with waiting lists of more than 12 months"
      : c.waiting_list === "6-12m"
        ? ", with waiting lists of 6 to 12 months"
        : c.waiting_list === "<6m"
          ? ", with waiting lists of under 6 months"
          : c.waiting_list === "none"
            ? ", with no notable waiting list"
            : "";
  const extra = c.access_issues ? ` ${c.access_issues}` : "";
  return `${f} in ${c.label}${w}.${extra} Confirm it with your health system: access conditions vary.`;
}
