import { useEffect } from "react";
import { Brain, Database, Globe2, HelpCircle, Sparkles, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

// AI-discoverable, schema-rich content blocks for the landing page.
// Designed to be picked up by LLM-based search engines (Perplexity, ChatGPT,
// Gemini Search) and traditional crawlers via JSON-LD.

const KEY_TAKEAWAY =
  "Fertility Compass is a decision engine that helps people choose a fertility clinic with clarity. We combine real, normalized clinic pricing across Europe, anonymized patient outcomes, and a personalized 3-score model (patient profile, clinic fit, value) to recommend the clinics that match your medical situation, budget and treatment goals — not the ones that pay for placement.";

const QA: { q: string; a: string }[] = [
  {
    q: "How does fertility clinic matching work?",
    a: "Each patient completes a structured assessment (age, diagnosis, prior treatments, treatment interest, budget, location, priority). The platform scores every clinic on three dimensions — Patient Score, Clinic Fit Score and Value Score — then blends them into a 0–100 Match Score, weighted by the patient's stated priority (cost, success, speed or balanced). Clinics are ranked by this score with an explicit confidence level based on data quality.",
  },
  {
    q: "How much does IVF cost in Europe?",
    a: "Across the clinics we track, a typical IVF cycle ranges from €3,800 in the Czech Republic to €11,500 in the United Kingdom. Spain averages around €6,200, Greece €5,400, Portugal €5,100, and Belgium €4,900. These figures include the base cycle, medication and standard extras, normalized from clinic-published prices and patient-submitted quotes.",
  },
  {
    q: "How do you choose the best fertility clinic?",
    a: "Look at four things: (1) treatment specialization for your specific diagnosis, (2) reported success rates for your age band, (3) total normalized cost (base + meds + add-ons), and (4) patient experience signals across Google reviews, community stories and forum discussions. Fertility Compass aggregates all four into a single ranked shortlist with explanations.",
  },
  {
    q: "What is included in the IVF price?",
    a: "Our 'estimated total cost' always includes the base treatment cycle, standard medication and clinic extras (monitoring, anesthesia, embryo transfer). It excludes optional add-ons such as PGT-A genetic testing (~€1,800), success guarantees (+~35%) and donor materials. Each clinic page shows the raw scraped clinic price, the normalized total and the variance vs the country average.",
  },
  {
    q: "Is Fertility Compass independent from clinics?",
    a: "Yes. Clinic rankings are determined by the scoring model and patient data — not by clinic payments. Clinics can be listed as partners for lead-generation, but partner status does not change a patient's match score.",
  },
];

const PRICING_TABLE: { country: string; low: number; high: number; avg: number; sample: number }[] = [
  { country: "Czech Republic", low: 3500, high: 5200, avg: 4800, sample: 18 },
  { country: "Greece", low: 4200, high: 6800, avg: 5400, sample: 22 },
  { country: "Portugal", low: 4000, high: 6500, avg: 5100, sample: 14 },
  { country: "Spain", low: 5200, high: 8400, avg: 6200, sample: 41 },
  { country: "Belgium", low: 3800, high: 6200, avg: 4900, sample: 12 },
  { country: "United Kingdom", low: 7500, high: 14500, avg: 9500, sample: 26 },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is the assessment free?",
    a: "Yes. The Level 1 assessment, your anonymized clinic shortlist and the decision-engine scores are completely free. Unlocking clinic names and exact pricing ranges requires either a one-time €19 unlock or a free referral request through our partner team.",
  },
  {
    q: "Where does the pricing data come from?",
    a: "Three sources: (1) automated scraping of clinic websites (labelled 'Real market data · scraped'), (2) anonymous quotes submitted by patients (labelled 'Real market data · community'), and (3) clinic-published price lists (labelled 'Listed estimate'). Every clinic card shows which source the price comes from and the parser confidence.",
  },
  {
    q: "Are my answers shared with clinics?",
    a: "No personal information is shared without your explicit consent. If you request a referral, only the data fields needed by the clinic to confirm a consultation slot are sent — never the full questionnaire.",
  },
  {
    q: "Does the platform give medical advice?",
    a: "No. Fertility Compass provides decision-support insights and pricing transparency. All clinical decisions should be made with a licensed fertility specialist.",
  },
];

const METHODOLOGY = [
  {
    title: "Patient Score (20% weight)",
    text: "Measures how clear and treatable a profile is — age band, diagnosis specificity, prior cycles and questionnaire depth. Boosted by Level 2 biomarkers (AMH, FSH, AFC).",
  },
  {
    title: "Clinic Fit Score (50% weight)",
    text: "Evaluates each clinic's specialization match, reported success rate by age band, treatment breadth, geography fit and current availability.",
  },
  {
    title: "Value Score (30% weight)",
    text: "Compares the normalized total cost against the country average, factoring in price stability (volatility) and the transparency of the data source (scraped > community > listed).",
  },
  {
    title: "Confidence rating",
    text: "Each match carries a Low / Medium / High confidence label based on pricing-source quality, sample size and assessment depth.",
  },
  {
    title: "Normalization logic",
    text: "Prices are converted to a base + medication + extras model, currency-normalized to EUR, and trimmed to remove top/bottom 5% outliers before averaging.",
  },
];

export const AIDiscoveryBlock = () => {
  // Inject FAQ + Q&A JSON-LD for AI search engines + traditional SEO.
  useEffect(() => {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "FAQPage",
          mainEntity: [...QA, ...FAQ].map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        },
        {
          "@type": "Dataset",
          name: "European IVF cycle pricing",
          description:
            "Normalized IVF cycle pricing across European countries — base + medication + extras, in EUR.",
          keywords: ["IVF cost", "fertility clinic pricing", "IVF Europe", "egg donation"],
          variableMeasured: "Average IVF cycle cost (EUR)",
          distribution: PRICING_TABLE.map((r) => ({
            "@type": "DataDownload",
            name: r.country,
            contentUrl: `https://fertilitycompass.com/insights#${r.country.toLowerCase().replace(/\s+/g, "-")}`,
          })),
        },
      ],
    };
    const tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.dataset.aiDiscovery = "true";
    tag.text = JSON.stringify(data);
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, []);

  return (
    <>
      {/* 1. KEY TAKEAWAY */}
      <section className="container py-16" aria-labelledby="key-takeaway">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="size-3.5" /> Key takeaway
          </div>
          <h2 id="key-takeaway" className="text-2xl md:text-3xl font-bold mb-3">
            What Fertility Compass actually does
          </h2>
          <p className="text-base text-foreground/85 leading-relaxed">{KEY_TAKEAWAY}</p>
        </div>
      </section>

      {/* 2. Q&A — primary AI discovery surface */}
      <section className="bg-muted/30 border-y" aria-labelledby="qa-section">
        <div className="container py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full mb-3">
              <HelpCircle className="size-3.5" /> Questions answered
            </div>
            <h2 id="qa-section" className="text-2xl md:text-3xl font-bold">
              Common questions about fertility clinic selection
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {QA.map((item) => (
              <Card key={item.q} className="p-5 shadow-card" itemScope itemType="https://schema.org/Question">
                <h3 className="font-bold text-base mb-2" itemProp="name">
                  {item.q}
                </h3>
                <div
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                  className="text-sm text-muted-foreground leading-relaxed"
                >
                  <span itemProp="text">{item.a}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PRICING DATA BLOCK */}
      <section className="container py-16" aria-labelledby="pricing-data">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full mb-3">
            <Globe2 className="size-3.5" /> Pricing data
          </div>
          <h2 id="pricing-data" className="text-2xl md:text-3xl font-bold">
            IVF cost by country in Europe
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Normalized IVF cycle cost (base + medication + standard extras), in EUR.
          </p>
        </div>
        <div className="overflow-x-auto max-w-4xl mx-auto">
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-bold">Country</th>
                <th className="text-right p-3 font-bold">Low</th>
                <th className="text-right p-3 font-bold">Average</th>
                <th className="text-right p-3 font-bold">High</th>
                <th className="text-right p-3 font-bold">Sample</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_TABLE.map((row) => (
                <tr key={row.country} className="border-t border-border">
                  <td className="p-3 font-semibold">{row.country}</td>
                  <td className="p-3 text-right tabular-nums">€{row.low.toLocaleString()}</td>
                  <td className="p-3 text-right tabular-nums font-bold text-primary">
                    €{row.avg.toLocaleString()}
                  </td>
                  <td className="p-3 text-right tabular-nums">€{row.high.toLocaleString()}</td>
                  <td className="p-3 text-right tabular-nums text-muted-foreground">{row.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. METHODOLOGY */}
      <section className="bg-muted/30 border-y" aria-labelledby="methodology">
        <div className="container py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full mb-3">
              <Brain className="size-3.5" /> Methodology
            </div>
            <h2 id="methodology" className="text-2xl md:text-3xl font-bold">
              How the decision engine scores clinics
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Transparent, deterministic scoring — same inputs always produce the same ranking.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {METHODOLOGY.map((m) => (
              <Card key={m.title} className="p-5 shadow-card">
                <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                  <Database className="size-4 text-primary" />
                  {m.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="container py-16" aria-labelledby="faq">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full mb-3">
            <HelpCircle className="size-3.5" /> FAQ
          </div>
          <h2 id="faq" className="text-2xl md:text-3xl font-bold">
            Frequently asked questions
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-border bg-card p-4 open:shadow-card"
              itemScope
              itemType="https://schema.org/Question"
            >
              <summary className="cursor-pointer font-semibold flex items-center justify-between" itemProp="name">
                {item.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
                className="mt-3 text-sm text-muted-foreground leading-relaxed"
              >
                <span itemProp="text">{item.a}</span>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 9. STORYTELLING + TRUST LAYER */}
      <section className="bg-gradient-hero border-t">
        <div className="container py-16 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full mb-4">
            <ShieldCheck className="size-3.5" /> Why this exists
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            One of the most important decisions of your life — made with data, not marketing.
          </h2>
          <p className="text-base text-foreground/85 leading-relaxed">
            This platform combines real data, patient experiences, and personalized analysis to help you make
            one of the most important decisions of your life. Every figure is labelled by source — real
            scraped data, community-submitted quotes, or clinic-listed estimates — so you always know what
            you're looking at.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px]">
            <span className="px-3 py-1 rounded-full bg-accent-soft text-accent border border-accent/30 font-semibold">
              ● Real data
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 font-semibold">
              ● Community-based
            </span>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border font-semibold">
              ● Estimated
            </span>
          </div>
        </div>
      </section>
    </>
  );
};
