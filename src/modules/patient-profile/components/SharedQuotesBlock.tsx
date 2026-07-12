import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { useMasterRecord } from "@/modules/master-record";

export function SharedQuotesBlock() {
  const list = useMasterRecord((s) => s.shared_quotes);
  const add = useMasterRecord((s) => s.addSharedQuote);
  const remove = useMasterRecord((s) => s.removeSharedQuote);
  const [draft, setDraft] = useState({ clinic_name: "", treatment_type: "IVF", total_price: 0, country: "Spain" });

  return (
    <div className="space-y-4">
      {list.length > 0 && (
        <ul className="space-y-2">
          {list.map((q) => (
            <li key={q.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30">
              <div className="text-sm">
                <span className="font-semibold">{q.clinic_name}</span>
                <span className="text-muted-foreground"> · {q.treatment_type}</span>
                <span className="ml-2 font-bold">€{q.total_price.toLocaleString()}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(q.id)}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid sm:grid-cols-5 gap-2 items-end">
        <div className="sm:col-span-2">
          <Label className="text-xs">Clinic</Label>
          <Input value={draft.clinic_name} onChange={(e) => setDraft({ ...draft, clinic_name: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Treatment</Label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={draft.treatment_type}
            onChange={(e) => setDraft({ ...draft, treatment_type: e.target.value })}
          >
            <option>IVF</option><option>ICSI</option><option>Egg Donation</option><option>Social Freezing</option><option>Other</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Total (€)</Label>
          <Input type="number" value={draft.total_price} onChange={(e) => setDraft({ ...draft, total_price: Number(e.target.value) })} />
        </div>
        <Button
          disabled={!draft.clinic_name || !draft.total_price}
          onClick={() => { add(draft); setDraft({ ...draft, clinic_name: "", total_price: 0 }); }}
        >
          <Plus className="size-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
}
