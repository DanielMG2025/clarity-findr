// Educational content library — "Learn" / divulgative entry point
// ---------------------------------------------------------------------------
// Purpose: give someone who knows NOTHING about fertility a simple, step-by-step
// understanding — what each treatment is, how it differs, and what the patient /
// donor / freezing journeys look like end to end.
//
// Two hard rules baked into the data:
//   1. ORIENTATIVE, never a medical guide. Every article carries `disclaimer`.
//   2. SOURCED. Every article lists `sources` it was composed from.
//
// Structure-first on purpose: the SAME objects render in the app, export to a
// blog/SEO, and convert into VIDEO SCRIPTS (see toVideoScript at the bottom) for
// YouTube/Instagram — the social top-of-funnel — without rewriting anything.

export const CONTENT_DISCLAIMER =
  "Informational and educational content. Not medical advice and not a substitute for a professional's assessment. Figures are orientative and vary from case to case.";

export interface Source {
  label: string;
  url?: string;
}

export interface Step {
  title: string;
  detail: string;
  typical_duration?: string;
}

export interface Article {
  slug: string;
  kind: "glosario" | "tratamiento" | "journey" | "negocio";
  title: string;
  hook: string; // one-line, plain-language, for cards and video intros
  summary: string; // 2–3 sentences
  reading_time_min: number;
  body?: string[]; // short paragraphs (plain language)
  steps?: Step[]; // for treatments / journeys
  differences?: { vs: string; note: string }[]; // "how it differs from X"
  faqs?: { q: string; a: string }[];
  disclaimer: string;
  sources: Source[];
  tags: string[];
}

// Shared sources (composed from concordant clinical/educational materials)
const S = {
  eshre: { label: "ESHRE — patient information", url: "https://www.eshre.eu/" },
  hfea: { label: "HFEA — treatments and processes", url: "https://www.hfea.gov.uk/" },
  urmc: { label: "URMC Strong Fertility — IVF step by step", url: "https://www.urmc.rochester.edu/" },
  ccrm: { label: "CCRM — IVF process day by day", url: "https://www.ccrmivf.com/" },
  monash: { label: "Monash IVF — the IVF process", url: "https://monashivf.com/" },
  sef: { label: "Spanish Fertility Society (SEF)", url: "https://www.sefertilidad.net/" },
};

// ---------------------------------------------------------------------------
// 1) GLOSSARY — 20-second answers ("what is ICSI?")
// ---------------------------------------------------------------------------
export const GLOSSARY: Article[] = [
  {
    slug: "what-is-ivf",
    kind: "glosario",
    title: "What is IVF?",
    hook: "Joining egg and sperm in the lab, not in the body.",
    summary:
      "In vitro fertilisation (IVF) means retrieving eggs, fertilising them in the lab and transferring the resulting embryo to the uterus. It's the most common assisted-reproduction treatment.",
    reading_time_min: 1,
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.monash],
    tags: ["ivf", "basics"],
  },
  {
    slug: "what-is-icsi",
    kind: "glosario",
    title: "What is ICSI?",
    hook: "An IVF where a single sperm is injected into the egg.",
    summary:
      "ICSI (intracytoplasmic sperm injection) is a variant of IVF in which the embryologist injects a single sperm directly into each mature egg. It's typically used for male-factor infertility or previous fertilisation failures.",
    reading_time_min: 1,
    differences: [{ vs: "conventional IVF", note: "In classic IVF, eggs and sperm are left together; in ICSI a selected sperm is injected." }],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.urmc, S.ccrm],
    tags: ["icsi", "male-factor"],
  },
  {
    slug: "what-is-iui",
    kind: "glosario",
    title: "What is IUI (insemination)?",
    hook: "Placing prepared semen inside the uterus at ovulation.",
    summary:
      "Intrauterine insemination (IUI) is a simpler, less invasive treatment than IVF: prepared semen is placed in the uterus around ovulation. It's often a first step in mild cases.",
    reading_time_min: 1,
    differences: [{ vs: "IVF", note: "In IUI, fertilisation happens inside the body; there's no embryo lab." }],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.monash],
    tags: ["iui", "basics"],
  },
  {
    slug: "what-is-pgt-a",
    kind: "glosario",
    title: "What is PGT-A (embryo genetic testing)?",
    hook: "Checking the embryo's chromosomes before transferring it.",
    summary:
      "PGT-A (preimplantation genetic testing for aneuploidy) checks whether the embryo has the correct number of chromosomes. A few cells are taken on day 5–6, and the embryo is frozen while the result comes back.",
    reading_time_min: 1,
    differences: [{ vs: "PGT-M", note: "PGT-A looks at the number of chromosomes; PGT-M looks for a specific mutation the parents may carry." }],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.ccrm, S.urmc],
    tags: ["pgt", "genetics"],
  },
  {
    slug: "what-is-egg-donation",
    kind: "glosario",
    title: "What is egg donation?",
    hook: "An IVF with a donor's eggs instead of your own.",
    summary:
      "In egg donation, eggs from an anonymous donor (in Spain) are used to create the embryos. It's a common option when ovarian reserve is very low or due to advanced age.",
    reading_time_min: 1,
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.sef, S.eshre],
    tags: ["egg-donation", "donor"],
  },
  {
    slug: "what-is-vitrification",
    kind: "glosario",
    title: "What is vitrification (freezing)?",
    hook: "Freezing eggs or embryos very fast to use them later.",
    summary:
      "Vitrification is an ultra-fast freezing that preserves eggs or embryos without damaging them. It lets you preserve fertility or store leftover embryos from a cycle.",
    reading_time_min: 1,
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.sef],
    tags: ["freezing", "vitrification"],
  },
];

// ---------------------------------------------------------------------------
// 2) TREATMENTS — step by step
// ---------------------------------------------------------------------------
export const TREATMENTS: Article[] = [
  {
    slug: "ivf-step-by-step",
    kind: "tratamiento",
    title: "IVF, step by step",
    hook: "From the first consultation to the embryo in the uterus, explained simply.",
    summary:
      "An IVF cycle almost always follows the same steps. Here's the typical journey and how long each phase usually takes — orientative; your clinic adapts it to your case.",
    reading_time_min: 3,
    steps: [
      { title: "1. Assessment and plan", detail: "Initial tests (hormones, ultrasound, semen analysis) and protocol design.", typical_duration: "1–2 weeks" },
      { title: "2. Ovarian stimulation", detail: "Daily injections so several eggs mature, with ultrasound monitoring.", typical_duration: "8–12 days" },
      { title: "3. Egg retrieval (follicular puncture)", detail: "Retrieving the eggs under sedation, a short procedure.", typical_duration: "1 day" },
      { title: "4. Fertilisation in the lab", detail: "Eggs are fertilised with classic IVF or ICSI. The next day, how many fertilised is confirmed.", typical_duration: "1 day" },
      { title: "5. Embryo culture", detail: "Embryos grow in an incubator to day 3 or to blastocyst (day 5–6).", typical_duration: "3–6 days" },
      { title: "6. Transfer", detail: "One embryo is placed in the uterus with a thin catheter, without sedation. The rest can be vitrified.", typical_duration: "1 day" },
      { title: "7. Wait and pregnancy test", detail: "Pregnancy test after ~10–14 days.", typical_duration: "10–14 days" },
    ],
    differences: [
      { vs: "IUI", note: "IVF works the embryos in the lab; IUI doesn't." },
      { vs: "Egg donation", note: "IVF uses your own eggs; egg donation uses a donor's." },
    ],
    faqs: [
      { q: "Does it hurt?", a: "The retrieval is done under sedation; the transfer usually doesn't need it." },
      { q: "How many embryos are transferred?", a: "Current practice tends to transfer one to avoid multiple pregnancies." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.urmc, S.ccrm, S.monash],
    tags: ["ivf", "journey"],
  },
  {
    slug: "egg-freezing-step-by-step",
    kind: "tratamiento",
    title: "Freezing eggs, step by step",
    hook: "Preserve your fertility today to keep options open tomorrow.",
    summary:
      "Egg freezing (vitrification) shares its start with IVF, but stops after the eggs are retrieved: instead of fertilising them, they're frozen.",
    reading_time_min: 2,
    steps: [
      { title: "1. Reserve assessment", detail: "Blood test (AMH) and ultrasound (follicle count) to estimate how many eggs you might get.", typical_duration: "1 week" },
      { title: "2. Ovarian stimulation", detail: "Same as IVF: injections and monitoring.", typical_duration: "8–12 days" },
      { title: "3. Retrieval", detail: "Retrieving the eggs under sedation.", typical_duration: "1 day" },
      { title: "4. Vitrification", detail: "Mature eggs are flash-frozen and stored.", typical_duration: "1 day" },
      { title: "5. Storage", detail: "Kept until you decide to use them; there's an annual storage cost.", typical_duration: "years" },
    ],
    faqs: [
      { q: "What's the best age?", a: "The earlier the better: freezing before 35 usually offers better chances." },
      { q: "Does it guarantee a pregnancy?", a: "No. It increases future options, but it's not a guarantee." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.sef],
    tags: ["freezing", "journey"],
  },
];

// ---------------------------------------------------------------------------
// 3) JOURNEYS — patient, donor, freezing (full journey)
// ---------------------------------------------------------------------------
export const JOURNEYS: Article[] = [
  {
    slug: "patient-journey",
    kind: "journey",
    title: "The patient journey",
    hook: "What happens from arriving at the clinic to the result.",
    summary:
      "An overview of the stages any assisted-reproduction patient goes through, so you know what to expect.",
    reading_time_min: 3,
    steps: [
      { title: "First consultation", detail: "Medical history, questions and initial tests for both partners if there's a couple." },
      { title: "Diagnosis", detail: "With the results, the cause is identified (or labelled unexplained) and a plan is proposed." },
      { title: "Choosing treatment", detail: "IUI, IVF/ICSI, egg donation… depending on age, diagnosis and preferences." },
      { title: "Treatment", detail: "The chosen cycle, with its monitoring and procedures." },
      { title: "Result and next steps", detail: "Pregnancy test; if unsuccessful, the plan is reviewed (new cycle, change of approach)." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.hfea, S.sef],
    tags: ["journey", "patient"],
  },
  {
    slug: "donor-journey",
    kind: "journey",
    title: "The egg donor journey",
    hook: "What being a donor involves: steps, requirements and what it does NOT involve.",
    summary:
      "Being an egg donor is a regulated, altruistic process. Here's the journey and what it really means, without jargon.",
    reading_time_min: 3,
    steps: [
      { title: "Requirements and screening", detail: "Age, good health and a battery of medical and genetic tests." },
      { title: "Stimulation", detail: "Same as an IVF patient: medication and monitoring for ~10 days." },
      { title: "Donation (retrieval)", detail: "Retrieving the eggs under sedation." },
      { title: "Compensation", detail: "In Spain, donation is altruistic and anonymous; there's a regulated financial compensation for the inconvenience." },
    ],
    faqs: [
      { q: "Is it anonymous?", a: "In Spain, yes: the donor and the recipient don't know each other's identity." },
      { q: "Does it affect my future fertility?", a: "That's a medical question; the clinic should answer it in your assessment." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.sef, S.eshre],
    tags: ["journey", "donor"],
  },
  {
    slug: "freezing-journey",
    kind: "journey",
    title: "The freezing journey",
    hook: "Preserving fertility: when it makes sense and what it's like.",
    summary:
      "Who egg freezing may make sense for, when, and how it fits into life — a planning decision, not a medical emergency.",
    reading_time_min: 2,
    steps: [
      { title: "Is it for me?", detail: "Common reasons: postponing motherhood, before a medical treatment, or low reserve detected." },
      { title: "Assessment", detail: "Blood test and ultrasound to estimate the expected yield." },
      { title: "Freezing cycle", detail: "Stimulation, retrieval and vitrification (see 'Freezing eggs, step by step')." },
      { title: "Future use", detail: "When you decide, the eggs are thawed and fertilised via ICSI." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [S.eshre, S.sef],
    tags: ["journey", "freezing"],
  },
];

// ---------------------------------------------------------------------------
// 4) HOW IT WORKS FINANCIALLY (for the patient / the donor)
// Explains the MODEL the patient lives, not how we monetise.
// Orientative ranges by market and, for donation, the key legal nuance.
// ---------------------------------------------------------------------------
const Ssrc = {
  seen: { label: "Seen Fertility — Egg freezing in Spain (costs and storage)", url: "https://seenfertility.com/" },
  freeze: { label: "Freeze.health — Egg freezing Spain (single cycle, storage)", url: "https://freeze.health/" },
  placid: { label: "PlacidWay — Cost of egg donation in Spain 2025", url: "https://www.placidway.com/" },
  ivi: { label: "IVI — How egg donation works in Spain", url: "https://ivi-fertility.com/" },
  boe: { label: "BOE — Law 14/2006 on assisted human reproduction techniques" },
};

export const ECONOMICS: Article[] = [
  {
    slug: "how-egg-freezing-is-paid",
    kind: "negocio",
    title: "How egg freezing is paid for",
    hook: "A one-off payment for the cycle + an annual fee to keep them stored.",
    summary:
      "The economics of freezing have two parts: the cycle (stimulation, retrieval, vitrification) paid once, and storage, which works like an annual subscription while you keep the eggs.",
    reading_time_min: 2,
    body: [
      "Think of it in two blocks. First, the cycle itself: a one-off payment covering stimulation, retrieval and freezing of the eggs.",
      "Second, storage: an annual fee to keep your eggs preserved, year after year, until you decide to use them. This is the subscription-like component, and it's easy to forget when comparing prices.",
      "Many packages include the first 1–5 years of storage; after that you pay the annual fee. And note: medication (~€1,000–1,400) is usually separate from the advertised price.",
    ],
    steps: [
      { title: "Cycle (one-off)", detail: "Stimulation + retrieval + vitrification.", typical_duration: "once" },
      { title: "Storage (recurring)", detail: "Annual fee to keep the eggs stored.", typical_duration: "each year" },
      { title: "Future use (if any)", detail: "Thawing + fertilisation (ICSI) + transfer, with its own cost.", typical_duration: "when you decide" },
    ],
    faqs: [
      { q: "Orientative range in Spain?", a: "The cycle is around ~€2,300–3,500 (without medication); annual storage, ~€200–500/year. Approximate figures by market and clinic." },
      { q: "What if I never use them?", a: "You'll keep paying the annual fee while you store them, unless you decide to stop storing them." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [Ssrc.seen, Ssrc.freeze],
    tags: ["freezing", "economics", "subscription"],
  },
  {
    slug: "donor-compensation-explained",
    kind: "negocio",
    title: "Being a donor: the compensation, explained properly",
    hook: "You're not paid for the eggs —that's prohibited—; the inconvenience is compensated.",
    summary:
      "This is the most misunderstood point. In Spain (and in practice across the EU) it's legally prohibited to pay for eggs: that would be commercialising gametes. What exists is a financial compensation for the inconvenience, time and travel.",
    reading_time_min: 2,
    body: [
      "Donation must, by law, be altruistic, anonymous and voluntary (Law 14/2006 in Spain). It's not a sale.",
      "That's why it's not about a 'price per egg', but a fixed, regulated compensation recognising the inconvenience: medication, travel, time (the process takes about 12–15 days with several visits) and possible time off work.",
      "In Spain that compensation is usually around ~€800–1,100 per cycle, a regulated amount, not negotiable nor proportional to the number of eggs.",
    ],
    differences: [
      { vs: "a payment for eggs", note: "Prohibited: it would turn donation into trading gametes. The compensation is for the inconvenience, not for the biological material." },
    ],
    faqs: [
      { q: "Is it anonymous?", a: "In Spain, yes: donor and recipient don't know each other's identity, and the patient who gives birth is the legal mother." },
      { q: "Can I donate for money?", a: "Not as such. The law frames it as an altruistic act; the compensation covers inconvenience, it's not a salary." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [Ssrc.ivi, Ssrc.placid, Ssrc.boe],
    tags: ["donor", "egg-donation", "economics", "legal"],
  },
  {
    slug: "how-a-treatment-is-financed",
    kind: "negocio",
    title: "How a treatment is financed",
    hook: "Payment in phases, multi-cycle packages and instalment financing.",
    summary:
      "Treatments are rarely paid all at once. It's worth understanding the common options to compare properly and avoid surprises.",
    reading_time_min: 2,
    body: [
      "Payment in phases: many clinics charge at milestones (at the start, before the transfer…), not everything upfront.",
      "Multi-cycle packages and guarantee/refund programmes: you pay several attempts upfront, sometimes with a partial or full refund if there's no live birth. They lower uncertainty in exchange for a larger outlay.",
      "Instalment financing: some clinics work with external lenders to spread the cost into instalments. It's a loan, with its interest; look at the total cost, not just the monthly payment.",
    ],
    faqs: [
      { q: "What's usually left out of the 'headline' price?", a: "Medication, the first consultation, PGT-A, and freezing/storage of leftover embryos. Always ask for the breakdown." },
    ],
    disclaimer: CONTENT_DISCLAIMER,
    sources: [Ssrc.placid, Ssrc.seen],
    tags: ["financing", "economics"],
  },
];

// ---------------------------------------------------------------------------
// Extended glossary (terms that show up unexplained in every clinic)
// ---------------------------------------------------------------------------
export const GLOSSARY_EXTRA: Article[] = [
  { slug: "what-is-ovarian-reserve", kind: "glosario", title: "What is ovarian reserve?", hook: "Roughly, the 'quantity' of eggs you have left.", summary: "Ovarian reserve is an estimate of the quantity of available eggs. It's assessed mainly with AMH and the antral follicle count, and declines with age.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.eshre, S.sef], tags: ["reserve", "basics"] },
  { slug: "what-is-amh", kind: "glosario", title: "What is AMH?", hook: "A blood test that gives a sense of your ovarian reserve.", summary: "Anti-Müllerian hormone (AMH) is a blood marker that helps estimate ovarian reserve. Low values suggest fewer available eggs, but don't predict success on their own.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.sef, S.eshre], tags: ["amh", "reserve"] },
  { slug: "what-is-afc", kind: "glosario", title: "What is the antral follicle count (AFC)?", hook: "Counting the small follicles in your ovaries by ultrasound.", summary: "The AFC is the number of antral follicles seen on ultrasound at the start of the cycle. Together with AMH, it helps estimate how you might respond to stimulation.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.eshre], tags: ["afc", "reserve"] },
  { slug: "what-is-blastocyst", kind: "glosario", title: "What is a blastocyst?", hook: "The embryo at day 5–6, with better odds of implanting.", summary: "A blastocyst is the stage the embryo reaches around day 5–6 of culture. It usually has a better chance of implantation and is the usual moment for transfer or genetic testing.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.ccrm, S.urmc], tags: ["embryo", "lab"] },
  { slug: "fresh-vs-frozen-transfer", kind: "glosario", title: "Fresh vs. frozen transfer", hook: "Transferring the embryo in the same cycle or thawing it later.", summary: "In a fresh transfer the embryo is placed in the same cycle; in a frozen one (FET) it's vitrified and transferred in a later cycle, preparing the uterus. Both are common.", reading_time_min: 1, differences: [{ vs: "each other", note: "Fresh = same cycle; frozen = later cycle with a prepared endometrium." }], disclaimer: CONTENT_DISCLAIMER, sources: [S.ccrm, S.monash], tags: ["transfer", "fet"] },
  { slug: "what-is-ovarian-stimulation", kind: "glosario", title: "What is ovarian stimulation?", hook: "Medication so several eggs mature in one cycle.", summary: "It's a few days of hormone injections so the ovaries produce several eggs at once (instead of one), with ultrasound monitoring. It's the first phase of an IVF or a freezing cycle.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.urmc, S.monash], tags: ["stimulation", "ivf"] },
  { slug: "what-is-egg-retrieval", kind: "glosario", title: "What is egg retrieval (follicular puncture)?", hook: "Retrieving the eggs, under sedation and quickly.", summary: "The retrieval is the procedure that collects the eggs from the ovaries, ultrasound-guided and under sedation. It's short and outpatient.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.urmc, S.ccrm], tags: ["retrieval", "ivf"] },
  { slug: "what-is-ropa-method", kind: "glosario", title: "What is the ROPA method?", hook: "Shared motherhood: one provides the egg, the other carries.", summary: "The ROPA method (Reception of Oocytes from the Partner) lets a female couple share motherhood: one provides the eggs and the other carries the pregnancy. It's regulated in Spain.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.sef], tags: ["ropa", "legal"] },
  { slug: "anonymous-donation", kind: "glosario", title: "What does anonymous donation mean?", hook: "Donor and recipient don't know each other's identity.", summary: "In Spain egg donation is anonymous by law: neither the donor nor the recipient knows the other's identity, and only data such as blood group and age are shared. In other countries the regulation differs.", reading_time_min: 1, disclaimer: CONTENT_DISCLAIMER, sources: [S.sef, Ssrc.ivi], tags: ["donor", "legal"] },
];

export const ALL_ARTICLES: Article[] = [...GLOSSARY, ...GLOSSARY_EXTRA, ...TREATMENTS, ...JOURNEYS, ...ECONOMICS];

export function getArticle(slug: string): Article | undefined {
  return ALL_ARTICLES.find((a) => a.slug === slug);
}

// ---------------------------------------------------------------------------
// Video-script generator — reuses the SAME content for YouTube/Instagram
// ---------------------------------------------------------------------------
export interface VideoScript {
  title: string;
  hook: string; // first 3 seconds
  scenes: { voiceover: string; on_screen: string }[];
  cta: string;
  disclaimer: string;
  sources: Source[];
}

/** Turn any article into a short vertical-video script (social top-of-funnel). */
export function toVideoScript(a: Article): VideoScript {
  const scenes: { voiceover: string; on_screen: string }[] = [
    { voiceover: a.summary, on_screen: a.title },
  ];
  (a.steps ?? []).forEach((s) =>
    scenes.push({ voiceover: `${s.title}: ${s.detail}`, on_screen: s.title + (s.typical_duration ? ` · ${s.typical_duration}` : "") }),
  );
  (a.differences ?? []).forEach((d) =>
    scenes.push({ voiceover: `Difference from ${d.vs}: ${d.note}`, on_screen: `vs ${d.vs}` }),
  );
  return {
    title: a.title,
    hook: a.hook,
    scenes,
    cta: "See it for your own situation on Fertility Compass.",
    disclaimer: a.disclaimer,
    sources: a.sources,
  };
}
