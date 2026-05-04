import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatIsThis } from "@/components/shared/WhatIsThis";
import { ShieldCheck, Repeat, Wallet, Banknote } from "lucide-react";
import type { Scenario } from "../logic/types";

interface Props {
  guarantee: Scenario;
}

export function GuaranteeProgramDetail({ guarantee }: Props) {
  const cyclesIncluded = 3;
  const transfersIncluded = 4;
  const refundPct = 70;
  const totalMid = Math.round((guarantee.total_min + guarantee.total_max) / 2);
  const costPerAttempt = Math.round(totalMid / cyclesIncluded);
  const refundAmount = Math.round(totalMid * (refundPct / 100));

  const stats = [
    { Icon: Repeat,      label: "Cycles included",            value: `Up to ${cyclesIncluded}`,           hint: "Maximum number of ovarian stimulations covered by the program." },
    { Icon: ShieldCheck, label: "Transfers",                  value: `Up to ${transfersIncluded}`,         hint: "Includes both fresh and frozen embryo transfers." },
    { Icon: Banknote,    label: "Refund if no pregnancy",     value: `${refundPct}%`,                       hint: "If you don't achieve pregnancy after using all attempts, you get this percentage back." },
    { Icon: Wallet,      label: "Average cost per attempt",   value: `€${costPerAttempt.toLocaleString()}`, hint: "Total program cost divided by the number of included attempts." },
  ];

  return (
    <Card className="p-6 border-expert/30 bg-expert-soft/20">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="size-5 text-expert" />
        <h3 className="text-lg font-bold">Guarantee program detail</h3>
        <Badge variant="outline" className="bg-expert-soft text-expert border-expert/30 ml-1">
          €{guarantee.total_min.toLocaleString()} – €{guarantee.total_max.toLocaleString()}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        You pay a fixed price for several attempts. If pregnancy isn't achieved, you receive a partial refund. Useful when it's unclear how many cycles will be needed.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map(({ Icon, label, value, hint }) => (
          <div key={label} className="p-3 rounded-xl bg-background border border-border">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
              <Icon className="size-3.5 text-expert" />
              {label}
              <WhatIsThis title={label} size="sm">{hint}</WhatIsThis>
            </div>
            <div className="text-xl font-bold tabular-nums mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-background border border-border p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          If the program ends without pregnancy
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div className="text-sm">You paid:</div>
          <div className="text-lg font-bold tabular-nums">€{totalMid.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">→ you get back up to</div>
          <div className="text-lg font-bold tabular-nums text-accent">€{refundAmount.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">({refundPct}% refund)</div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 italic">
          Exact terms (percentage, cycles, eligibility by age or AMH) vary by clinic. Always request the detailed contract before signing.
        </p>
      </div>
    </Card>
  );
}
