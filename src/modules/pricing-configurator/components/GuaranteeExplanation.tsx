import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export function GuaranteeExplanation() {
  const cols = [
    {
      title: "Pay-per-cycle",
      tone: "border-primary/30 bg-primary-soft/30",
      pros: ["Lower upfront cost", "Flexibility if you decide to stop", "More control over which clinic to use each attempt"],
      cons: ["Compounding risk if you need several cycles", "No refund if pregnancy isn't achieved"],
    },
    {
      title: "Guarantee / multi-cycle program",
      tone: "border-expert/30 bg-expert-soft/30",
      pros: ["Predictable total cost", "Partial or full refund if pregnancy isn't achieved", "Coverage for several attempts"],
      cons: ["Higher upfront cost", "Eligibility criteria (age, AMH, etc.)", "Locks you in with a single clinic"],
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-1">Another way to pay for treatment</h3>
      <p className="text-sm text-muted-foreground mb-5">
        Some clinics offer <strong>guarantee programs</strong>: you pay a fixed price for several attempts and get a refund if pregnancy isn't achieved. They don't always pay off — it depends on your profile.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        {cols.map((c) => (
          <div key={c.title} className={`p-4 rounded-xl border ${c.tone}`}>
            <div className="font-semibold mb-3">{c.title}</div>
            <ul className="space-y-1.5 text-sm">
              {c.pros.map(p => (
                <li key={p} className="flex gap-2 items-start"><Check className="size-4 text-accent shrink-0 mt-0.5" /><span>{p}</span></li>
              ))}
              {c.cons.map(p => (
                <li key={p} className="flex gap-2 items-start text-muted-foreground"><X className="size-4 text-warning shrink-0 mt-0.5" /><span>{p}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
