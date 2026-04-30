import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FlaskConical, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  TREATMENT_VARIANTS,
  defaultVariant,
  simulateTreatment,
  type TreatmentVariant,
  type PackageTier,
  financingPlans,
} from "@/lib/engines/personalEngine";
import type { AssessmentData, MatchResult } from "@/lib/engines/types";

export const TreatmentSimulator = ({ m, a }: { m: MatchResult; a: AssessmentData }) => {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<TreatmentVariant>(defaultVariant(a.treatment_interest));
  const [pkg, setPkg] = useState<PackageTier>("basic");
  const [genetic, setGenetic] = useState(false);
  const [guarantee, setGuarantee] = useState(false);

  const sim = useMemo(
    () => simulateTreatment(m, variant, pkg, { genetic_testing: genetic, success_guarantee: guarantee }),
    [m, variant, pkg, genetic, guarantee],
  );
  const plans = useMemo(() => financingPlans(sim.price_mid), [sim.price_mid]);

  return (
    <div className="rounded-xl border border-border bg-card mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <FlaskConical className="size-4 text-primary" />
          <span className="text-sm font-bold">Simulate treatment & financing</span>
          <span className="text-[10px] text-muted-foreground">
            try IVF / ICSI / Donor · add-ons · monthly cost
          </span>
        </div>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {open && (
        <div className="p-4 pt-0 space-y-4">
          {/* Variant */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Treatment type
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TREATMENT_VARIANTS.map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={variant === v ? "default" : "outline"}
                  onClick={() => setVariant(v)}
                  className="h-8"
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>

          {/* Package */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Package
            </div>
            <div className="flex gap-1.5">
              {(["basic", "premium"] as PackageTier[]).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={pkg === p ? "default" : "outline"}
                  onClick={() => setPkg(p)}
                  className="h-8 capitalize"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 cursor-pointer">
              <div>
                <div className="text-xs font-semibold">Genetic testing</div>
                <div className="text-[10px] text-muted-foreground">PGT-A · +6% success</div>
              </div>
              <Switch checked={genetic} onCheckedChange={setGenetic} />
            </label>
            <label className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3 cursor-pointer">
              <div>
                <div className="text-xs font-semibold">Success guarantee</div>
                <div className="text-[10px] text-muted-foreground">Refund pkg · +35% cost</div>
              </div>
              <Switch checked={guarantee} onCheckedChange={setGuarantee} />
            </label>
          </div>

          {/* Output */}
          <div className="rounded-lg bg-primary-soft/50 border border-primary/20 p-3.5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Price range</div>
                <div className="text-base font-bold tabular-nums text-primary">
                  €{sim.price_low.toLocaleString()}–€{sim.price_high.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Success</div>
                <div className="text-base font-bold tabular-nums text-accent">{sim.expected_success}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Ranking impact</div>
                <div className={`text-base font-bold tabular-nums inline-flex items-center gap-1 ${sim.ranking_delta >= 0 ? "text-accent" : "text-warning"}`}>
                  {sim.ranking_delta >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  {sim.ranking_delta > 0 ? "+" : ""}
                  {sim.ranking_delta}
                </div>
              </div>
            </div>
            {sim.components.length > 0 && (
              <div className="mt-3 pt-3 border-t border-primary/15 grid grid-cols-2 gap-y-1 text-[11px]">
                {sim.components.map((c) => (
                  <div key={c.label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="font-semibold tabular-nums">€{c.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financing */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1.5">
              Financing simulator — €{sim.price_mid.toLocaleString()} financed
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {plans.map((p) => (
                <div key={p.months} className="rounded-lg border border-border bg-muted/30 p-2.5 text-center">
                  <div className="text-base font-bold tabular-nums">€{p.monthly}/mo</div>
                  <div className="text-[10px] text-muted-foreground">
                    {p.months}mo · {p.apr}% APR
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 truncate" title={p.partner}>
                    {p.partner}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-2">
              Estimates only. Final terms depend on partner approval and credit profile.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
