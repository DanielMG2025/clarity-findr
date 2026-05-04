import { Link } from "react-router-dom";
import { ArrowRight, Compass, Search, Headset, HeartHandshake, Snowflake, ShieldCheck, MessagesSquare, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";

const JOURNEYS = [
  {
    id: "explorer",
    href: "/explorer",
    icon: Compass,
    label: "I'm just starting",
    description: "You're learning what fertility care is and what it costs. We'll guide you step by step.",
    time: "~5 min",
    color: "primary",
  },
  {
    id: "navigator",
    href: "/navigator",
    icon: Search,
    label: "I've already researched",
    description: "You know some terms. Get precise matching, side-by-side comparisons and financing.",
    time: "~10 min",
    color: "accent",
  },
  {
    id: "expert",
    href: "/expert",
    icon: Headset,
    label: "I want direct help",
    description: "A guided concierge service. We help you build a shortlist and prepare your file.",
    time: "Personal",
    color: "primary",
  },
  {
    id: "donor",
    href: "/donor",
    icon: HeartHandshake,
    label: "I want to donate eggs",
    description: "Learn what donation means, eligibility, and how to safely connect with clinics.",
    time: "~3 min",
    color: "accent",
  },
  {
    id: "freezing",
    href: "/freezing",
    icon: Snowflake,
    label: "I want to freeze my eggs",
    description: "Understand timing, costs and what to expect — without medical pressure.",
    time: "~5 min",
    color: "primary",
  },
];

const HomeV2 = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-gradient-hero">
        <div className="container py-16 md:py-24 max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-soft px-3 py-1.5 rounded-full">
            <Sparkles className="size-3" /> A guide, not a directory
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
            We help you understand and decide
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              on your fertility journey.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Clear language. Real prices. Personalized guidance. Choose where you are right now —
            we'll take it from there.
          </p>
          <div className="text-sm font-semibold text-foreground pt-2">Where are you in your journey?</div>
        </div>
      </section>

      {/* INTENT SELECTOR */}
      <section className="container -mt-8 md:-mt-12 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {JOURNEYS.map((j) => {
            const Icon = j.icon;
            return (
              <Link key={j.id} to={j.href} className="group">
                <Card className="p-6 h-full hover:shadow-elegant hover:border-primary/40 transition-smooth border-2 bg-gradient-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`size-12 rounded-2xl grid place-items-center ${j.color === "primary" ? "bg-primary-soft" : "bg-accent-soft"}`}>
                      <Icon className={`size-6 ${j.color === "primary" ? "text-primary" : "text-accent"}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">{j.time}</Badge>
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">{j.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{j.description}</p>
                  <div className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Start this path <ArrowRight className="size-4" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PROMISE / TRANSPARENCY */}
      <section className="container py-12 grid md:grid-cols-3 gap-5">
        <Card className="p-6">
          <ShieldCheck className="size-8 text-accent mb-3" />
          <h3 className="font-bold mb-1">Transparent by default</h3>
          <p className="text-sm text-muted-foreground">
            Every recommendation comes with a "why you see this" explanation. No hidden ranking.
          </p>
        </Card>
        <Card className="p-6">
          <MessagesSquare className="size-8 text-primary mb-3" />
          <h3 className="font-bold mb-1">Real patient voices</h3>
          <p className="text-sm text-muted-foreground">
            Browse the community to see real questions, prices and experiences from people like you.
          </p>
        </Card>
        <Card className="p-6">
          <Sparkles className="size-8 text-accent mb-3" />
          <h3 className="font-bold mb-1">Plain language</h3>
          <p className="text-sm text-muted-foreground">
            No medical jargon. Tooltips on every term. You stay in control of every step.
          </p>
        </Card>
      </section>

      <section className="container pb-20">
        <TransparencyBlock variant="method">
          We combine real clinic prices, anonymous patient reports and a matching engine that explains
          its reasoning. We never sell your personal data. Each journey is anonymous unless you choose
          to contact a clinic.
        </TransparencyBlock>
      </section>

      <SiteFooter />
    </div>
  );
};

export default HomeV2;
