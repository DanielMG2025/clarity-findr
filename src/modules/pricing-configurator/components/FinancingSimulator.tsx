import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

export function FinancingSimulator({ amountMin, amountMax }: { amountMin: number; amountMax: number }) {
  const mid = Math.round((amountMin + amountMax) / 2);
  const [amount, setAmount] = useState(mid);
  const [months, setMonths] = useState(24);
  const apr = 0.08;

  const monthly = Math.round((amount * (1 + apr)) / months);
  const monthlyLow = Math.round((amountMin * (1 + apr)) / months);
  const monthlyHigh = Math.round((amountMax * (1 + apr)) / months);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="size-4 text-primary" />
        <h3 className="text-lg font-bold">Financing simulator</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-5">Estimated monthly payment using an indicative 8% APR. This is not a financial offer.</p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount to finance</Label>
          <div className="text-2xl font-bold tabular-nums my-1">€{amount.toLocaleString()}</div>
          <Slider value={[amount]} min={amountMin} max={amountMax} step={100} onValueChange={([v]) => setAmount(v)} />
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1 tabular-nums">
            <span>€{amountMin.toLocaleString()}</span><span>€{amountMax.toLocaleString()}</span>
          </div>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Term (months)</Label>
          <div className="text-2xl font-bold tabular-nums my-1">{months} months</div>
          <Slider value={[months]} min={6} max={60} step={6} onValueChange={([v]) => setMonths(v)} />
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1 tabular-nums">
            <span>6m</span><span>60m</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-primary-soft/40 border border-primary/15">
        <div className="text-xs text-muted-foreground">Estimated monthly payment</div>
        <div className="text-3xl font-bold tabular-nums text-primary">€{monthly.toLocaleString()}/mo</div>
        <div className="text-xs text-muted-foreground mt-1 tabular-nums">
          Range between €{monthlyLow.toLocaleString()} and €{monthlyHigh.toLocaleString()}/mo depending on the scenario
        </div>
      </div>
    </Card>
  );
}
