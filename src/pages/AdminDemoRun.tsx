import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Wallet,
  Compass,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DEMO_PATIENTS, runDemo, type Factor } from "@/modules/master-record";
import { getArticle } from "@/modules/education";

const eur = (n: number) => `€${Math.round(n).toLocaleString()}`;

const FACTOR_META: Record<Factor["kind"], { icon: typeof CheckCircle2; tone: string; label: string }> = {
  favorable: { icon: CheckCircle2, tone: "text-emerald-600", label: "Favorable" },
  attention: { icon: AlertTriangle, tone: "text-amber-600", label: "To keep in mind" },
  missing: { icon: HelpCircle, tone: "text-muted-foreground", label: "Missing" },
};

function Section({ n, title, icon: Icon, children }: { n: number; title: string; icon: typeof Compass; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="grid place-items-center size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">{n}</span>
        <Icon className="size-4 text-primary" />
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AdminDemoRun() {
  const { key } = useParams();
  const patient = DEMO_PATIENTS.find((p) => p.key === key);

  if (!patient) {
    return (
      <AdminShell title="Demo run" subtitle="Patient not found">
        <Button asChild variant="outline"><Link to="/admin/demo"><ArrowLeft className="size-4 mr-1" /> Demo Center</Link></Button>
      </AdminShell>
    );
  }

  const run = runDemo(patient);
  const o = run.step2_orientation;

  return (
    <AdminShell title={`${patient.name}, ${patient.age}`} subtitle="Full golden-path run — one call, all 7 steps">
      <div className="max-w-3xl space-y-8">
        <Link to="/admin/demo" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
          <ArrowLeft className="size-4" /> Demo Center
        </Link>

        {/* Step 0 — Legal eligibility gate */}
        {run.step0_regulatory && (
          <Section n={0} title="Legal eligibility" icon={ShieldCheck}>
            <Card className="p-4 space-y-3">
              <p className="text-sm font-medium">{run.step0_regulatory.headline}</p>
              <ul className="space-y-2">
                {run.step0_regulatory.results.map((res) => {
                  const Icon = res.verdict === "allowed" ? CheckCircle2 : res.verdict === "not_allowed" ? AlertTriangle : HelpCircle;
                  const tone = res.verdict === "allowed" ? "text-emerald-600" : res.verdict === "not_allowed" ? "text-rose-600" : "text-muted-foreground";
                  return (
                    <li key={res.need} className="flex gap-2">
                      <Icon className={`size-4 mt-0.5 shrink-0 ${tone}`} />
                      <div>
                        <div className="text-sm font-medium">{res.label}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{res.why}</div>
                        {res.alternatives.length > 0 && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Available in: {res.alternatives.slice(0, 4).map((a) => a.label).join(", ")}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
                <p>{run.step0_regulatory.funding_note}</p>
                <p>{run.step0_regulatory.anonymity_note}</p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {run.step0_regulatory.disclaimer} ·{" "}
                <a href={run.step0_regulatory.source.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                  {run.step0_regulatory.source.label} <ExternalLink className="size-3" />
                </a>
              </p>
            </Card>
          </Section>
        )}

        {/* Step 1 — Profile */}
        <Section n={1} title="Profile" icon={Compass}>
          <Card className="p-4 space-y-2">
            <p className="text-sm">{run.step1_profile.summary}</p>
            <Progress value={Math.max(run.step1_profile.completeness, 4)} className="h-2" />
            <p className="text-[11px] text-muted-foreground">{run.step1_profile.completeness}% complete</p>
          </Card>
        </Section>

        {/* Step 2 — Orientation */}
        <Section n={2} title="Success orientation" icon={Compass}>
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Badge variant="outline" className="text-xs">Confidence: {o.confidence}</Badge>
              <span className="text-xs text-muted-foreground">{o.confidence_reason}</span>
            </div>
            <ul className="space-y-2">
              {o.factors.map((f, i) => {
                const meta = FACTOR_META[f.kind];
                return (
                  <li key={i} className="flex gap-2">
                    <meta.icon className={`size-4 mt-0.5 shrink-0 ${meta.tone}`} />
                    <div>
                      <div className="text-sm font-medium">
                        {f.title}
                        {f.needs_professional && <Badge variant="outline" className="ml-2 text-[10px]">ask a doctor</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">{f.why}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-[11px] text-muted-foreground border-t pt-2">{o.disclaimer}</p>
          </Card>

          {/* Evidence */}
          <Card className="p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evidence base</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{o.evidence.report_intro}</p>
            {o.evidence.routes.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Routes described: </span>
                {o.evidence.routes.map((r) => r.route).join(", ")}
              </div>
            )}
          </Card>
        </Section>

        {/* Step 3 — Learn */}
        <Section n={3} title="Learn" icon={BookOpen}>
          <div className="flex flex-wrap gap-2">
            {run.step3_learn.map((slug) => {
              const a = getArticle(slug);
              return (
                <Button key={slug} asChild size="sm" variant="outline" className="gap-1">
                  <Link to={`/learn/${slug}`}>{a?.title ?? slug} <ArrowRight className="size-3" /></Link>
                </Button>
              );
            })}
          </div>
        </Section>

        {/* Step 4 — Costs */}
        <Section n={4} title="Costs" icon={Wallet}>
          <div className="space-y-3">
            {run.step4_costs.map((c, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-semibold">{c.estimate.plan_label}</div>
                  <div className="text-lg font-bold tabular-nums">{eur(c.estimate.total_min)}–{eur(c.estimate.total_max)}</div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Confidence: {c.estimate.confidence} · {c.estimate.market.label}</div>
                <p className="text-xs text-muted-foreground mt-1.5">{c.why_this_plan}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* Step 5 — Clinics */}
        <Section n={5} title="Clinics" icon={Building2}>
          <Card className="p-4 text-sm text-muted-foreground">
            {run.step5_clinics.length === 0
              ? "Clinic fit is injected from the demonstrator's clinic seed (not part of this engine run)."
              : run.step5_clinics.map((cl) => cl.name).join(", ")}
          </Card>
        </Section>

        {/* Step 6 — Next steps */}
        <Section n={6} title="Next steps" icon={Stethoscope}>
          <ul className="space-y-1.5">
            {run.step6_next.map((s, i) => (
              <li key={i} className="text-sm flex gap-2"><ArrowRight className="size-3.5 mt-0.5 shrink-0 text-primary" /> {s}</li>
            ))}
          </ul>
        </Section>

        {/* Improvement path */}
        <Card className="p-4 bg-muted/40 border-dashed">
          <p className="text-xs text-muted-foreground leading-relaxed inline-flex items-start gap-1">
            <Sparkles className="size-3.5 mt-0.5 shrink-0 text-primary" /> {run.improvement_path}
          </p>
        </Card>
      </div>
    </AdminShell>
  );
}
