import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, MessagesSquare, Sparkles, Building2, Handshake } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { JourneySelector } from "@/modules/journey";

const PRO_PORTALS = [
  {
    id: "clinic",
    href: "/clinic",
    icon: Building2,
    label: "I'm a clinic",
    description: "Access qualified leads, manage your profile and track conversion analytics.",
    tone: "clinic" as const,
  },
  {
    id: "partner",
    href: "/partners",
    icon: Handshake,
    label: "I'm a partner",
    description: "Refer patients, track commissions and manage your payout schedule.",
    tone: "partner" as const,
  },
];

const TONE_STYLES: Record<string, { soft: string; text: string; border: string }> = {
  clinic:  { soft: "bg-clinic-soft",  text: "text-clinic",            border: "hover:border-clinic/40" },
  partner: { soft: "bg-partner-soft", text: "text-partner-foreground", border: "hover:border-partner/40" },
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
        </div>
      </section>

      {/* INTENT SELECTOR */}
      <section className="container -mt-8 md:-mt-12 pb-8">
        <JourneySelector heading="Where are you in your journey?" />
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
