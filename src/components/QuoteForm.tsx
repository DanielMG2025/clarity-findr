import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Heart, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, storage } from "@/lib/fertility";
import { supabase } from "@/integrations/supabase/client";

const TREATMENTS = ["IVF", "Egg Donation", "Social Freezing", "ICSI", "Other"];

const schema = z.object({
  clinic_name: z.string().trim().min(2).max(120),
  country: z.string().min(2).max(60),
  treatment_type: z.enum(["IVF", "Egg Donation", "Social Freezing", "ICSI", "Other"]),
  base_price: z.coerce.number().int().min(100).max(100000),
  medication_cost: z.coerce.number().int().min(0).max(50000),
  extras_cost: z.coerce.number().int().min(0).max(50000),
  date_received: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const QuoteForm = ({ onSubmitted }: { onSubmitted?: () => void }) => {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(storage.hasSubmitted());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      clinic_name: fd.get("clinic_name"),
      country: fd.get("country"),
      treatment_type: fd.get("treatment_type"),
      base_price: fd.get("base_price"),
      medication_cost: fd.get("medication_cost") || 0,
      extras_cost: fd.get("extras_cost") || 0,
      date_received: fd.get("date_received") || undefined,
      notes: fd.get("notes") || undefined,
    });
    if (!parsed.success) {
      toast.error("Please check your inputs", {
        description: parsed.error.issues[0]?.message,
      });
      return;
    }
    setSubmitting(true);
    const d = parsed.data;
    const { error } = await supabase.from("user_submitted_quotes").insert([
      {
        clinic_name: d.clinic_name,
        country: d.country,
        treatment_type: d.treatment_type,
        base_price: d.base_price,
        medication_cost: d.medication_cost,
        extras_cost: d.extras_cost,
        date_received: d.date_received || null,
        notes: d.notes || null,
        is_verified: false,
      },
    ]);
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit quote", { description: error.message });
      return;
    }
    storage.markSubmitted();
    storage.unlock();
    setDone(true);
    toast.success("Thank you for contributing 💙", {
      description: "Precise price ranges have been unlocked.",
    });
    onSubmitted?.();
  };

  if (done) {
    return (
      <Card className="p-8 bg-accent-soft border-2 border-accent/40 text-center">
        <Heart className="size-8 text-accent mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-1">Thank you for sharing.</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Your anonymous quote helps thousands of patients make better decisions. Enhanced price
          insights have been unlocked above.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-elegant bg-gradient-card border-2">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
          Crowdsource
        </div>
        <h3 className="text-2xl font-bold">Help others — share your real quote</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          100% anonymous — no name, email or phone needed. Your data unlocks more accurate price
          insights for everyone.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="clinic_name">Clinic name</Label>
          <Input id="clinic_name" name="clinic_name" required placeholder="e.g. IVI Madrid" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Select name="country" defaultValue="Spain">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="treatment_type">Treatment</Label>
          <Select name="treatment_type" defaultValue="IVF">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TREATMENTS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date_received">Date received</Label>
          <Input id="date_received" name="date_received" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="base_price">Base price (€)</Label>
          <Input id="base_price" name="base_price" type="number" required min={100} max={100000} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="medication_cost">Medication cost (€)</Label>
          <Input id="medication_cost" name="medication_cost" type="number" defaultValue={0} min={0} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="extras_cost">Extras: tests, anesthesia, etc. (€)</Label>
          <Input id="extras_cost" name="extras_cost" type="number" defaultValue={0} min={0} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" name="notes" maxLength={500} placeholder="What was included?" />
        </div>
        <div className="md:col-span-2 flex justify-end pt-2">
          <Button type="submit" variant="hero" size="lg" disabled={submitting}>
            <Send className="size-4" /> {submitting ? "Submitting…" : "Share my quote"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default QuoteForm;
