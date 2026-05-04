import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatIsThis } from "@/components/shared/WhatIsThis";
import { ShieldCheck, Repeat, Wallet, Banknote } from "lucide-react";
import type { Scenario } from "../logic/types";

interface Props {
  guarantee: Scenario;
}

/**
 * Detailed view of the multi-cycle guarantee program:
 * how many cycles included, transfers, refund logic, cost per attempt.
 */
export function GuaranteeProgramDetail({ guarantee }: Props) {
  const cyclesIncluded = 3;
  const transfersIncluded = 4;
  const refundPct = 70;
  const totalMid = Math.round((guarantee.total_min + guarantee.total_max) / 2);
  const costPerAttempt = Math.round(totalMid / cyclesIncluded);
  const refundAmount = Math.round(totalMid * (refundPct / 100));

  const stats = [
    { Icon: Repeat,      label: "Ciclos incluidos",      value: `Hasta ${cyclesIncluded}`,           hint: "Número máximo de estimulaciones ováricas cubiertas por el programa." },
    { Icon: ShieldCheck, label: "Transferencias",        value: `Hasta ${transfersIncluded}`,         hint: "Incluye transferencias en fresco y de embriones congelados." },
    { Icon: Banknote,    label: "Reembolso si no hay embarazo", value: `${refundPct}%`,              hint: "Si tras agotar todos los intentos no hay embarazo, te devuelven este porcentaje." },
    { Icon: Wallet,      label: "Coste medio por intento", value: `€${costPerAttempt.toLocaleString()}`, hint: "Coste total del programa dividido entre los intentos incluidos." },
  ];

  return (
    <Card className="p-6 border-expert/30 bg-expert-soft/20">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="size-5 text-expert" />
        <h3 className="text-lg font-bold">Detalle del programa garantía</h3>
        <Badge variant="outline" className="bg-expert-soft text-expert border-expert/30 ml-1">
          €{guarantee.total_min.toLocaleString()} – €{guarantee.total_max.toLocaleString()}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Pagas un precio cerrado por varios intentos. Si no hay embarazo, recibes un reembolso parcial. Útil cuando hay incertidumbre sobre cuántos ciclos van a ser necesarios.
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
          Si el programa termina sin embarazo
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div className="text-sm">Pagaste:</div>
          <div className="text-lg font-bold tabular-nums">€{totalMid.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">→ recuperas hasta</div>
          <div className="text-lg font-bold tabular-nums text-accent">€{refundAmount.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">({refundPct}% de reembolso)</div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 italic">
          Las condiciones exactas (porcentaje, ciclos, criterios de elegibilidad por edad o AMH) varían por clínica. Pide siempre el contrato detallado antes de firmar.
        </p>
      </div>
    </Card>
  );
}
