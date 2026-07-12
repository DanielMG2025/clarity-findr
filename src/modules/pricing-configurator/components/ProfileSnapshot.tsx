import { Link } from "react-router-dom";
import { ArrowRight, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SideInfo } from "@/components/shared/SideInfo";
import type { PricingProfile } from "../logic/types";

interface Props {
  profile: PricingProfile;
  patch: (p: Partial<PricingProfile>) => void;
}

/**
 * Compact, read-mostly panel that surfaces the inputs the configurator is
 * currently using. The patient profile remains the single source of truth —
 * deeper edits are made on /situacion.
 */
export function ProfileSnapshot({ profile, patch }: Props) {
  return (
    <Card className="p-5 space-y-5 bg-gradient-card border-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <User className="size-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From your profile</div>
            <div className="font-semibold">Adjust extras here, edit the rest in your profile.</div>
          </div>
        </div>
        <Button asChild size="sm" variant="outline" className="gap-1">
          <Link to="/situacion">Edit <ArrowRight className="size-3.5" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Treatment" value={profile.treatment.toUpperCase()} />
        <Field label="Country" value={profile.country} />
        <Field label="Age" value={String(profile.age)} />
        <Field label="Prior failed cycles" value={String(profile.prior_failed_cycles ?? 0)} />
      </div>

      <div className="space-y-3 pt-1 border-t">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-3">Extras for this estimate</div>

        <Toggle
          label={<SideInfo infoKey="icsi" className="text-foreground" />}
          checked={!!profile.needs_icsi}
          onChange={(v) => patch({ needs_icsi: v })}
        />
        <Toggle
          label={<SideInfo infoKey="pgt_a" className="text-foreground" />}
          checked={!!profile.needs_pgt}
          onChange={(v) => patch({ needs_pgt: v })}
        />
        <Toggle
          label={<SideInfo infoKey="vitrification" className="text-foreground" />}
          checked={!!profile.needs_vitrification}
          onChange={(v) => patch({ needs_vitrification: v })}
        />

        <div>
          <Label className="text-xs">Years of storage</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={profile.storage_years ?? 1}
            onChange={(e) => patch({ storage_years: Number(e.target.value) })}
          />
        </div>
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-background/60 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold truncate">{value || "—"}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: React.ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/40 cursor-pointer">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
