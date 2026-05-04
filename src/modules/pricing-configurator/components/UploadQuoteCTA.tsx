import { useState } from "react";
import { Upload, Send, MessageSquareQuote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function UploadQuoteCTA({ defaultCountry = "Spain", defaultTreatment = "IVF" }: { defaultCountry?: string; defaultTreatment?: string }) {
  const [open, setOpen] = useState(false);
  const [clinic, setClinic] = useState("");
  const [base, setBase] = useState<number | "">("");
  const [meds, setMeds] = useState<number | "">(0);
  const [extras, setExtras] = useState<number | "">(0);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!clinic || !base || Number(base) < 100) {
      toast({ title: "Missing information", description: "Please add at least the clinic and the base price." });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("user_submitted_quotes").insert({
      clinic_name: clinic,
      country: defaultCountry,
      treatment_type: defaultTreatment,
      base_price: Number(base),
      medication_cost: Number(meds || 0),
      extras_cost: Number(extras || 0),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "We couldn't save it", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Thank you!", description: "Your quote helps other patients get better estimates." });
    setOpen(false);
    setClinic(""); setBase(""); setMeds(0); setExtras(0);
  };

  return (
    <Card className="p-6 bg-accent-soft/30 border-accent/20">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-background grid place-items-center shrink-0 border border-accent/30">
          <MessageSquareQuote className="size-5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold">Patients like you have shared</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-3">
            Every quote uploaded makes the estimates more accurate for the next person. 100% anonymous.
          </p>
          {!open ? (
            <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
              <Upload className="size-4" /> Upload my quote
            </Button>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              <div>
                <Label className="text-xs">Clinic</Label>
                <Input value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="e.g. IVI Madrid" />
              </div>
              <div>
                <Label className="text-xs">Base price (€)</Label>
                <Input type="number" value={base} onChange={(e) => setBase(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Medication (€)</Label>
                <Input type="number" value={meds} onChange={(e) => setMeds(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Extras (€)</Label>
                <Input type="number" value={extras} onChange={(e) => setExtras(e.target.value === "" ? "" : Number(e.target.value))} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                <Button size="sm" onClick={submit} disabled={submitting} className="gap-1.5">
                  <Send className="size-4" /> Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
