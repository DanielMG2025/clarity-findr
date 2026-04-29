import { Link } from "react-router-dom";
import { Dna, TestTube, ArrowRight, CheckCircle2, HandCoins, Sparkles, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const PARTNERS = [
  {
    icon: Dna,
    name: "Genetic screening",
    examples: "Igenomix, Veritas, Eugin Lab",
    text: "Carrier screening + PGT-A panel ordered through partner labs. Results feed directly into the matching engine.",
    patient_price: "Free",
    note: "Subsidized by partner — they pay us a referral fee on each kit ordered.",
    color: "primary" as const,
  },
  {
    icon: TestTube,
    name: "Home fertility kits",
    examples: "Hormone & AMH at-home tests",
    text: "Lab-grade hormonal panel sent to the patient's home. Results sync to their match profile.",
    patient_price: "Free",
    note: "Partner-funded. The lab earns a downstream margin from clinic referrals.",
    color: "accent" as const,
  },
  {
    icon: Building2,
    name: "Insurance & financing",
    examples: "Cover cycles & medication",
    text: "Partner financing options for IVF cycles, integrated at the unlock step. No out-of-pocket required.",
    patient_price: "From €0/mo",
    note: "Commission-based — patient pays nothing extra to access the offer.",
    color: "primary" as const,
  },
];

const Partners = () => (
  <div className="min-h-screen flex flex-col">
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-gradient-hero">
        <div className="container py-16 md:py-20 max-w-5xl">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back
          </Link>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            Partner ecosystem
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mt-3 leading-[1.05]">
            Partners subsidize
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              the patient experience.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            Genetic labs, at-home test providers, and financing partners all plug into the decision flow — and pick up the cost so patients don't have to.
          </p>
        </div>
      </section>

      <section className="container py-16 grid md:grid-cols-3 gap-6">
        {PARTNERS.map((p) => (
          <Card key={p.name} className="p-7 shadow-card hover:shadow-elegant transition-smooth flex flex-col">
            <div className={`size-12 rounded-xl grid place-items-center mb-4 ${p.color === "primary" ? "bg-primary-soft" : "bg-accent-soft"}`}>
              <p.icon className={`size-6 ${p.color === "primary" ? "text-primary" : "text-accent"}`} />
            </div>
            <h3 className="text-lg font-bold mb-1">{p.name}</h3>
            <div className="text-xs text-muted-foreground mb-3">{p.examples}</div>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{p.text}</p>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs uppercase font-semibold text-muted-foreground">Patient price</span>
              <span className={`text-xl font-extrabold ${p.color === "primary" ? "text-primary" : "text-accent"}`}>
                {p.patient_price}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground border-t pt-3">{p.note}</div>
          </Card>
        ))}
      </section>

      <section className="bg-muted/40 border-y">
        <div className="container py-16 max-w-4xl">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary-soft grid place-items-center shrink-0">
              <HandCoins className="size-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">How partner subsidies work</h2>
              <p className="text-muted-foreground mt-2">
                We integrate partner products at the highest-intent moment of the patient journey — Step 3, advanced matching. When a patient orders a partner test or financing product, the partner pays a referral fee, and we waive the related platform fees for the patient.
              </p>
              <ul className="space-y-2 text-sm mt-5">
                {[
                  "Patient gets premium services for free",
                  "Partner gets a high-intent customer with verified clinical interest",
                  "We get a referral fee — never paid by the patient",
                  "Logic: pick a partner product, related advanced module becomes free",
                ].map((b) => (
                  <li key={b} className="flex gap-2">
                    <CheckCircle2 className="size-4 text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild variant="hero">
                  <Link to="/patient/advanced">See partner-funded modules <ArrowRight className="size-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/admin/pricing-dashboard">Admin · revenue model</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 max-w-3xl text-center">
        <Sparkles className="size-8 text-primary mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold">A platform funded by who benefits.</h2>
        <p className="text-muted-foreground mt-3">
          Patients pay only for what's purely for them (€5–€19 unlocks, advanced questionnaires). Everything that benefits a clinic or partner is paid by them — never by the patient.
        </p>
      </section>
    </main>
    <SiteFooter />
  </div>
);

export default Partners;
