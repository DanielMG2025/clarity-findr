import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, FlaskConical, Route, ShieldCheck } from "lucide-react";
import { usePatientJourney } from "@/modules/master-record";
import { ownEggCitationForAge } from "@/modules/evidence/citations";
import { EvidencePopover } from "@/components/patient/EvidencePopover";
import type { RouteHint } from "@/modules/evidence";

const ROUTE_LABEL: Record<RouteHint["route"], string> = {
  ivf_own: "IVF with your own eggs",
  ivf_donor: "IVF with donor eggs",
  icsi: "ICSI (sperm microinjection)",
  further_testing: "Further diagnostic testing",
};

const RESERVE_LABEL: Record<string, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  unknown: "Not assessed yet",
};

const METRIC_LABEL: Record<string, string> = {
  live_birth_rate_per_cycle_own_eggs: "Live birth rate per cycle (own eggs)",
  live_birth_rate_per_cycle_donor_eggs: "Live birth rate per cycle (donor eggs)",
  clinical_pregnancy_per_transfer_own_eggs: "Clinical pregnancy per transfer (own eggs)",
  clinical_pregnancy_per_transfer_donor_eggs: "Clinical pregnancy per transfer (donor eggs)",
  clinical_pregnancy_per_transfer_europe_context: "European average per transfer (context)",
};

function humanizeMetric(metric: string): string {
  return (
    METRIC_LABEL[metric] ??
    metric.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function EvidenceBasePanel() {
  // Same evidence the shared journey engine computes (buildEvidence under the hood).
  const evidence = usePatientJourney().step2_orientation.evidence;

  // Distinct sources cited across statements + routes, for a references footer.
  const sources = useMemo(() => {
    const map = new Map<string, { label: string; url?: string }>();
    for (const s of evidence.statements) {
      map.set(s.citation.label, { label: s.citation.label, url: s.citation.url ?? undefined });
    }
    for (const r of evidence.routes) {
      map.set(r.citation.label, { label: r.citation.label, url: r.citation.url });
    }
    return [...map.values()];
  }, [evidence]);

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center size-9 rounded-xl bg-primary-soft text-primary">
            <BookOpen className="size-5" />
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              What published evidence says
            </div>
            <h3 className="font-bold text-lg">Evidence base</h3>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Badge variant="secondary" className="text-xs">Age {evidence.segment.age}</Badge>
          <Badge variant="secondary" className="text-xs">
            Reserve: {RESERVE_LABEL[evidence.segment.reserve] ?? evidence.segment.reserve}
          </Badge>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        These pointers come from publicly published statistics and clinical guidelines you can
        open yourself. They describe what's typical for profiles like yours —{" "}
        <strong>not a diagnosis or a personal prediction.</strong>
      </p>

      {/* Typical routes described in the literature */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <Route className="size-3.5" /> Routes commonly described for this segment
        </div>
        {evidence.routes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Share your age and ovarian reserve to see typical routes.</p>
        ) : (
          <ul className="space-y-2">
            {evidence.routes.map((r) => (
              <li key={r.route} className="rounded-lg border p-3">
                <div className="text-sm font-semibold">{ROUTE_LABEL[r.route]}</div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                  <span>Source:</span>
                  {r.citation.url ? (
                    <a
                      href={r.citation.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      {r.citation.label} <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span>{r.citation.label}</span>
                  )}
                  <span>· {r.citation.locator}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Real, sourced figures — each opens its own full breakdown */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <FlaskConical className="size-3.5" /> Success rates for a profile like yours
        </div>
        <ul className="space-y-2">
          {figures.map((f) => (
            <li
              key={f.citationId}
              className="rounded-lg border p-3 flex items-center justify-between gap-3 flex-wrap"
            >
              <span className="text-sm font-medium">{f.label}</span>
              <EvidencePopover citationId={f.citationId} />
            </li>
          ))}
        </ul>
      </div>


      {/* References footer */}
      {sources.length > 0 && (
        <div className="rounded-lg bg-muted/40 border p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> Sources
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {sources.map((s) => (
              <li key={s.label} className="text-xs">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {s.label}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{s.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
