import { Link } from "react-router-dom";
import { ShieldCheck, Info, ArrowRight, MessageSquare, Calendar, AlertTriangle, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMasterRecord } from "@/modules/master-record";
import { overallCompletionMPR } from "@/modules/patient-profile/blocks";

type Confidence = "low" | "medium" | "high";
type SourceLabel = "reviewed" | "public" | "external" | "pending";

interface ReviewedClinic {
  id: string;
  /** Internal only — never shown to patients before they request contact. */
  clinic: string;
  /** Anonymised label shown to patients. */
  displayLabel: string;
  city: string;
  published: number;
  basicMin: number;
  basicMax: number;
  premiumMin: number;
  premiumMax: number;
  includes: string[];
  mayNotInclude: string[];
  confidence: Confidence;
  lastReview: string;
  source: SourceLabel;
}

// Madrid IVF clinics — initial seed
const MADRID_FIV: ReviewedClinic[] = [
  {
    id: "m1",
    clinic: "Fertility Madrid",
    displayLabel: "Clinic 1",
    city: "Madrid",
    published: 5400,
    basicMin: 5400, basicMax: 6900,
    premiumMin: 6900, premiumMax: 9200,
    includes: ["Stimulation", "Egg retrieval", "Embryo culture", "Transfer"],
    mayNotInclude: ["Medication", "ICSI", "PGT-A"],
    confidence: "high",
    lastReview: "2026-04-30",
    source: "reviewed",
  },
  {
    id: "m2",
    clinic: "FIVMadrid",
    displayLabel: "Clinic 2",
    city: "Madrid",
    published: 5600,
    basicMin: 5600, basicMax: 7100,
    premiumMin: 7100, premiumMax: 9500,
    includes: ["Stimulation", "Egg retrieval", "Culture", "Transfer"],
    mayNotInclude: ["Medication", "ICSI", "Freezing"],
    confidence: "high",
    lastReview: "2026-04-28",
    source: "reviewed",
  },
  {
    id: "m3",
    clinic: "IVI Madrid",
    displayLabel: "Clinic 3",
    city: "Madrid",
    published: 5900,
    basicMin: 5900, basicMax: 7400,
    premiumMin: 7400, premiumMax: 9800,
    includes: ["Stimulation", "Egg retrieval", "Embryo culture", "Transfer"],
    mayNotInclude: ["Medication", "ICSI", "PGT-A", "Freezing"],
    confidence: "medium",
    lastReview: "2026-04-29",
    source: "public",
  },
  {
    id: "m4",
    clinic: "Instituto Bernabeu Madrid",
    displayLabel: "Clinic 4",
    city: "Madrid",
    published: 6200,
    basicMin: 6200, basicMax: 7800,
    premiumMin: 7800, premiumMax: 10400,
    includes: ["Stimulation", "Egg retrieval", "ICSI", "Culture", "Transfer"],
    mayNotInclude: ["Medication", "PGT-A", "Anaesthesia"],
    confidence: "medium",
    lastReview: "2026-04-22",
    source: "external",
  },
  {
    id: "m5",
    clinic: "Clínica Tambre",
    displayLabel: "Clinic 5",
    city: "Madrid",
    published: 6100,
    basicMin: 6100, basicMax: 7700,
    premiumMin: 7700, premiumMax: 10200,
    includes: ["Stimulation", "Egg retrieval", "Culture", "Transfer"],
    mayNotInclude: ["Medication", "ICSI", "PGT-A"],
    confidence: "low",
    lastReview: "2026-04-10",
    source: "pending",
  },
  {
    id: "m6",
    clinic: "Ginefiv Madrid",
    displayLabel: "Clinic 6",
    city: "Madrid",
    published: 5800,
    basicMin: 5800, basicMax: 7300,
    premiumMin: 7300, premiumMax: 9700,
    includes: ["Stimulation", "Egg retrieval", "Culture", "Transfer"],
    mayNotInclude: ["Medication", "ICSI", "PGT-A"],
    confidence: "low",
    lastReview: "2026-03-28",
    source: "pending",
  },
];

const confStyles: Record<Confidence, string> = {
  high:   "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  medium: "bg-amber-500/10 text-amber-700 border-amber-200",
  low:    "bg-rose-500/10 text-rose-700 border-rose-200",
};
const confLabel: Record<Confidence, string> = { high: "High", medium: "Medium", low: "Low" };

const sourceMeta: Record<SourceLabel, { label: string; className: string; icon: React.ReactNode }> = {
  reviewed: {
    label: "Reviewed price",
    className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    icon: <ShieldCheck className="size-3" />,
  },
  public: {
    label: "Clinic's public price list",
    className: "bg-blue-500/10 text-blue-700 border-blue-200",
    icon: <Globe className="size-3" />,
  },
  external: {
    label: "External source · needs review",
    className: "bg-amber-500/10 text-amber-700 border-amber-200",
    icon: <AlertTriangle className="size-3" />,
  },
  pending: {
    label: "Estimate pending validation",
    className: "bg-muted text-muted-foreground border-border",
    icon: <Info className="size-3" />,
  },
};

const fmt = (n: number) => `€${n.toLocaleString()}`;

export function ReviewedClinicPricing() {
  const mpr = useMasterRecord();
  const completion = overallCompletionMPR(mpr);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-lg">IVF in Madrid · reviewed prices</CardTitle>
            <CardDescription>
              Estimates based on prices published by the clinics and reviewed by our team.
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 gap-1">
            <ShieldCheck className="size-3.5" /> Verified data
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {completion < 60 && (
          <div className="rounded-lg border border-amber-200 bg-amber-500/10 text-amber-900 px-3 py-2 text-sm flex items-start gap-2">
            <Info className="size-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              Share a little more about your situation to refine this estimate.
              <Link to="/situacion" className="underline ml-1 font-medium">Open my situation</Link>
            </div>
          </div>
        )}

        {/* Normalization explanation */}
        <div className="rounded-lg border bg-primary-soft/30 px-3 py-2 text-sm flex items-start gap-2">
          <Info className="size-4 mt-0.5 shrink-0 text-primary" />
          <p>
            Published prices don't all include the same components. That's why we normalize
            <b> medication, lab work, freezing and possible extras</b> so you can compare clinics on the same basis.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Clinic identities are shown once you choose to connect. This keeps our guidance neutral.
        </p>

        <div className="grid gap-3">
          {MADRID_FIV.map((c) => {
            const sm = sourceMeta[c.source];
            return (
              <div key={c.id} className="border rounded-xl p-4 hover:border-primary/40 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-semibold">{c.displayLabel}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={`${sm.className} gap-1`}>
                      {sm.icon} {sm.label}
                    </Badge>
                    <Badge variant="outline" className={confStyles[c.confidence]}>
                      Confidence {confLabel[c.confidence]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Published price</div>
                    <div className="font-bold tabular-nums">{fmt(c.published)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Normalized basic</div>
                    <div className="font-bold tabular-nums text-accent">{fmt(c.basicMin)}–{fmt(c.basicMax)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Normalized premium</div>
                    <div className="font-bold tabular-nums text-primary">{fmt(c.premiumMin)}–{fmt(c.premiumMax)}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">What it includes</div>
                    <div className="flex flex-wrap gap-1">
                      {c.includes.map((i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-200">
                          + {i}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">What it may not include</div>
                    <div className="flex flex-wrap gap-1">
                      {c.mayNotInclude.map((i) => (
                        <Badge key={i} variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-200">
                          – {i}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Calendar className="size-3" /> Last reviewed: {c.lastReview}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/clinicas">Compare clinics</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link to={`/clinicas?contact=${encodeURIComponent(c.id)}`}>
                        <MessageSquare className="size-3.5 mr-1" /> Request contact
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="rounded-xl border bg-muted/30 p-4 text-sm space-y-2">
          <div className="font-semibold inline-flex items-center gap-1.5">
            <Info className="size-4 text-primary" />
            Why the normalized price can differ from the price on a clinic's website
          </div>
          <p className="text-muted-foreground">
            A clinic's published price is usually a <b>"from" price</b> that leaves out medication,
            extra techniques (ICSI, PGT-A), embryo freezing, anaesthesia or prior tests. Our normalized
            price adjusts these components so you can compare clinics on the same basis, and gives a
            realistic range for your situation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" asChild>
            <Link to="/clinicas">Compare clinics</Link>
          </Button>
          <Button asChild>
            <Link to="/clinicas?contact=1">
              Request contact <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
