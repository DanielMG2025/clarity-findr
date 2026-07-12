import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scale, Check, X, HelpCircle, Plane, ExternalLink, ShieldCheck, ArrowRight, Info } from "lucide-react";
import type { RegulatoryOrientation, Verdict } from "@/modules/regulatory";

const VERDICT_META: Record<Verdict, { icon: typeof Check; tone: string; label: string }> = {
  allowed:     { icon: Check,      tone: "text-emerald-600", label: "Available" },
  not_allowed: { icon: X,          tone: "text-rose-600",    label: "Not available where you live" },
  unknown:     { icon: HelpCircle, tone: "text-muted-foreground", label: "To confirm" },
};

/**
 * "Your legal framework" — the regulatory GATE, shown as an equal half alongside
 * the clinical success factors. What you can legally do where you live, and if
 * not, where you could. Cites the European Atlas 2024 + a clear disclaimer.
 */
export function RegulatoryFrameworkPanel({ orientation }: { orientation: RegulatoryOrientation | null }) {
  if (!orientation) {
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center size-9 rounded-xl bg-primary-soft text-primary"><Scale className="size-5" /></span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your legal framework</div>
            <h3 className="font-bold text-lg">What you can legally do</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tell us your <strong>country of residence</strong> and your <strong>family situation</strong> and
          we'll show you what's within reach where you live — and, if something isn't, where in Europe
          it would be. It's the first gate: without it, neither the clinical orientation nor the price
          are actionable.
        </p>
        <Button asChild size="sm" className="gap-1"><Link to="/situacion">Complete my situation <ArrowRight className="size-3.5" /></Link></Button>
      </Card>
    );
  }

  const o = orientation;

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center size-9 rounded-xl bg-primary-soft text-primary"><Scale className="size-5" /></span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your legal framework</div>
            <h3 className="font-bold text-lg">What you can legally do in {o.home.label}</h3>
          </div>
        </div>
        {o.needs_to_travel ? (
          <Badge variant="outline" className="text-xs gap-1 border-rose-500/40 text-rose-600"><Plane className="size-3" /> May require travelling</Badge>
        ) : (
          <Badge variant="outline" className="text-xs gap-1 border-emerald-500/40 text-emerald-600"><Check className="size-3" /> All within reach</Badge>
        )}
      </div>

      <div className={`rounded-xl border p-4 text-sm leading-relaxed ${o.needs_to_travel ? "bg-rose-500/10 border-rose-500/25" : "bg-emerald-500/10 border-emerald-500/25"}`}>
        {o.headline}
      </div>

      {/* Need-by-need verdicts */}
      <ul className="space-y-2">
        {o.results.map((r) => {
          const meta = VERDICT_META[r.verdict];
          const Icon = meta.icon;
          return (
            <li key={r.need} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Icon className={`size-4 shrink-0 ${meta.tone}`} />
                <span className="text-sm font-semibold">{r.label}</span>
                <span className={`text-[11px] ml-auto ${meta.tone}`}>{meta.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.why}</p>
              {r.verdict === "not_allowed" && r.alternatives.length > 0 && (
                <div className="mt-2 text-xs">
                  <div className="font-semibold text-foreground mb-1">Available in:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.alternatives.slice(0, 5).map((a) => (
                      <span key={a.code} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium" title={a.note}>{a.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Donor anonymity + funding context */}
      <div className="grid sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/40 border p-3 leading-relaxed">{o.anonymity_note}</div>
        <div className="rounded-lg bg-muted/40 border p-3 leading-relaxed">{o.funding_note}</div>
      </div>

      {/* Where everything is viable */}
      {o.viable_countries.length > 0 && (
        <div className="rounded-lg bg-primary-soft/30 border border-primary/15 p-3 text-xs">
          <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5"><Info className="size-3.5" /> Countries where everything you need is viable</div>
          <p className="text-muted-foreground">
            {o.viable_countries.length} option(s). This is the same filter your costs and clinic list use downstream.
          </p>
        </div>
      )}

      {/* Source + disclaimer */}
      <div className="rounded-lg bg-muted/40 border p-3 space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Source</div>
        <a href={o.source.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-0.5">
          {o.source.label} <ExternalLink className="size-3" />
        </a>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{o.disclaimer}</p>
      </div>
    </Card>
  );
}
