import { MapPin, Sparkles, Award, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SourceChip } from "@/components/patient/SourceChip";

export interface ClinicCardData {
  id: string;
  name: string;
  /** Anonymised label shown to patients before they request contact. */
  displayLabel?: string;
  city?: string | null;
  country: string;
  estimatedPrice: number;
  priceLow?: number;
  priceHigh?: number;
  matchScore: number;
  highlights: string[];
  reason: string;
  badge?: "best-match" | "best-value" | "closest" | null;
}

const BADGE_LABELS: Record<NonNullable<ClinicCardData["badge"]>, { label: string; cls: string }> = {
  "best-match": { label: "Best for your case", cls: "bg-primary text-primary-foreground" },
  "best-value": { label: "Best value", cls: "bg-accent text-accent-foreground" },
  closest: { label: "Closest", cls: "bg-secondary text-secondary-foreground" },
};

export function ClinicCardV2({ clinic }: { clinic: ClinicCardData }) {
  const [open, setOpen] = useState(false);
  const label = clinic.displayLabel ?? clinic.name;
  return (
    <Card className="rounded-none border-0 border-t border-border/70 bg-transparent px-0 pb-2 pt-6 shadow-none transition-smooth hover:border-accent/50">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-2xl font-medium">{label}</h3>
            {clinic.badge && (
              <Badge className={BADGE_LABELS[clinic.badge].cls}>{BADGE_LABELS[clinic.badge].label}</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground inline-flex items-center gap-1 mt-1">
            <MapPin className="size-3.5" /> {clinic.country}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Match</div>
          <div className="font-display text-3xl font-medium tabular-nums text-primary">{clinic.matchScore}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="rounded-none border-l border-border/70 bg-transparent p-3 pl-4">
          <div className="text-xs text-muted-foreground">Estimated total</div>
          <div className="font-display text-xl font-medium tabular-nums">€{clinic.estimatedPrice.toLocaleString()}</div>
          {clinic.priceLow && clinic.priceHigh && (
            <div className="text-[11px] text-muted-foreground tabular-nums">
              €{clinic.priceLow.toLocaleString()} – €{clinic.priceHigh.toLocaleString()}
            </div>
          )}
          <div className="mt-2">
            <SourceChip
              source="Public price lists"
              date="2026-Q1"
              confidence="medium"
              detail="Normalized from this clinic's published price list and patient-shared quotes, last reviewed in Q1 2026. Your own quote may differ once the clinic reviews your case."
            />
          </div>
        </div>
        <div className="rounded-none border-l border-border/70 bg-transparent p-3 pl-4">
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Award className="size-3" /> Strengths
          </div>
          <div className="text-xs font-medium mt-0.5 line-clamp-2">{clinic.highlights.slice(0, 2).join(" · ")}</div>
        </div>
      </div>

      <div className="mb-4 rounded-none border-y border-accent/40 bg-accent-soft/35 px-4 py-4">
        <div className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          <Sparkles className="size-3" /> Why this clinic
        </div>
        <p className="max-w-[65ch] text-sm leading-7 text-muted-foreground">{clinic.reason}</p>
      </div>

      <Button className="w-full" onClick={() => setOpen(true)}>
        <Calendar className="size-4" /> Request appointment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request contact with {label}</DialogTitle>
            <DialogDescription>
              We pass your details to the clinic. They'll reach out directly. No obligation.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Lead sent. The clinic will contact you within 48h.");
              setOpen(false);
            }}
          >
            <div>
              <Label>Your name</Label>
              <Input required placeholder="Jane Doe" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required placeholder="you@example.com" />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Textarea placeholder="Anything they should know?" />
            </div>
            <Button type="submit" className="w-full">Send request</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
