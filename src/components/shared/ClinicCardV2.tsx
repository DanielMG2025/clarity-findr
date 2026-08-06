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
  return (
    <Card className="p-6 hover:shadow-elegant transition-smooth border">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold">{clinic.name}</h3>
            {clinic.badge && (
              <Badge className={BADGE_LABELS[clinic.badge].cls}>{BADGE_LABELS[clinic.badge].label}</Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground inline-flex items-center gap-1 mt-1">
            <MapPin className="size-3.5" /> {clinic.city ? `${clinic.city}, ` : ""}{clinic.country}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Match</div>
          <div className="text-2xl font-bold text-primary tabular-nums">{clinic.matchScore}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="rounded-lg bg-muted p-3">
          <div className="text-xs text-muted-foreground">Estimated total</div>
          <div className="font-bold tabular-nums">€{clinic.estimatedPrice.toLocaleString()}</div>
          {clinic.priceLow && clinic.priceHigh && (
            <div className="text-[11px] text-muted-foreground tabular-nums">
              €{clinic.priceLow.toLocaleString()} – €{clinic.priceHigh.toLocaleString()}
            </div>
          )}
        </div>
        <div className="rounded-lg bg-accent-soft p-3">
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Award className="size-3" /> Strengths
          </div>
          <div className="text-xs font-medium mt-0.5 line-clamp-2">{clinic.highlights.slice(0, 2).join(" · ")}</div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed p-3 mb-4">
        <div className="text-[11px] uppercase tracking-wider text-primary font-bold inline-flex items-center gap-1 mb-1">
          <Sparkles className="size-3" /> Why this clinic
        </div>
        <p className="text-sm text-muted-foreground">{clinic.reason}</p>
      </div>

      <Button className="w-full" onClick={() => setOpen(true)}>
        <Calendar className="size-4" /> Request appointment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request appointment at {clinic.name}</DialogTitle>
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
