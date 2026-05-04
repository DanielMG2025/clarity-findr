import { Link } from "react-router-dom";
import { ArrowRight, Compass, Search, Headset, HeartHandshake, Snowflake, ShieldCheck, MessagesSquare, Sparkles, Building2, Handshake } from "lucide-react";
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
    tone: "explorer" as const,
  },
  {
    id: "navigator",
    href: "/navigator",
    icon: Search,
    label: "I've already researched",
    description: "You know some terms. Get precise matching, side-by-side comparisons and financing.",
    time: "~10 min",
    tone: "navigator" as const,
  },
  {
    id: "expert",
    href: "/expert",
    icon: Headset,
    label: "I want direct help",
    description: "A guided concierge service. We help you build a shortlist and prepare your file.",
    time: "Personal",
    tone: "expert" as const,
  },
  {
    id: "donor",
    href: "/donor",
    icon: HeartHandshake,
    label: "I want to donate eggs",
    description: "Learn what donation means, eligibility, compensation and how to safely connect with clinics.",
    time: "~3 min",
    tone: "donor" as const,
  },
  {
    id: "freezing",
    href: "/freezing",
    icon: Snowflake,
    label: "I want to freeze my eggs",
    description: "Understand timing, costs and what to expect — without medical pressure.",
    time: "~5 min",
    tone: "freezing" as const,
  },
];

const PRO_PORTALS = [
  {
    id: "clinic",
    href: "/clinic",
    icon: Building2,
    label: "I'm a clinic",
    description: "Access qualified leads, manage your profile and track conversion analytics.",
    cta: "Open clinic portal",
    tone: "clinic" as const,
  },
  {
    id: "partner",
    href: "/partners",
    icon: Handshake,
    label: "I'm a partner",
    description: "Refer patients, track commissions and manage your payout schedule.",
    cta: "Open partner portal",
    tone: "partner" as const,
  },
];

const TONE_STYLES: Record<string, { soft: string; text: string; border: string }> = {
  explorer:  { soft: "bg-primary-soft",  text: "text-primary",  border: "hover:border-primary/40" },
  navigator: { soft: "bg-accent-soft",   text: "text-accent",   border: "hover:border-accent/40" },
  expert:    { soft: "bg-expert-soft",   text: "text-expert",   border: "hover:border-expert/40" },
  donor:     { soft: "bg-donor-soft",    text: "text-donor",    border: "hover:border-donor/40" },
  freezing:  { soft: "bg-freezing-soft", text: "text-freezing", border: "hover:border-freezing/40" },
  clinic:    { soft: "bg-clinic-soft",   text: "text-clinic",   border: "hover:border-clinic/40" },
  partner:   { soft: "bg-partner-soft",  text: "text-partner-foreground", border: "hover:border-partner/40" },
};

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

      {/* INTENT SELECTOR — patients */}
      <section className="container -mt-8 md:-mt-12 pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {JOURNEYS.map((j) => {
            const Icon = j.icon;
            const t = TONE_STYLES[j.tone];
            return (
              <Link key={j.id} to={j.href} className="group">
                <Card className={`p-6 h-full hover:shadow-elegant transition-smooth border-2 bg-gradient-card ${t.border} relative overflow-hidden`}>
                  {/* tone stripe */}
                  <div className={`absolute inset-x-0 top-0 h-1 ${t.soft}`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className={`size-12 rounded-2xl grid place-items-center ${t.soft}`}>
                      <Icon className={`size-6 ${t.text}`} />
                    </div>
                    <Badge variant="secondary" className="text-xs">{j.time}</Badge>
                  </div>
                  <Badge variant="outline" className={`mb-2 text-[10px] uppercase tracking-wider ${t.text} border-current/30`}>
                    {j.tone}
                  </Badge>
                  <h3 className="text-lg font-bold mb-1.5">{j.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{j.description}</p>
                  <div className={`text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all ${t.text}`}>
                    Start this path <ArrowRight className="size-4" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PRO PORTALS */}
      <section className="container pb-16">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">For professionals</div>
            <h2 className="text-xl font-bold mt-1">Are you a clinic or a partner?</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {PRO_PORTALS.map((p) => {
            const Icon = p.icon;
            const t = TONE_STYLES[p.tone];
            return (
              <Link key={p.id} to={p.href} className="group">
                <Card className={`p-6 h-full transition-smooth border-2 hover:shadow-elegant ${t.border} relative overflow-hidden`}>
                  <div className={`absolute inset-x-0 top-0 h-1 ${t.soft}`} />
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl grid place-items-center ${t.soft}`}>
                      <Icon className={`size-6 ${t.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{p.label}</h3>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    </div>
                    <ArrowRight className={`size-5 ${t.text} transition-transform group-hover:translate-x-1`} />
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
