import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { useMasterRecord } from "@/modules/master-record";

export function TreatmentHistoryBlock() {
  const list = useMasterRecord((s) => s.history);
  const add = useMasterRecord((s) => s.addHistory);
  const remove = useMasterRecord((s) => s.removeHistory);
  const [draft, setDraft] = useState({ treatment: "IVF", year: new Date().getFullYear(), clinic: "", outcome: "none" as const });

  return (
    <div className="space-y-4">
      {list.length > 0 && (
        <ul className="space-y-2">
          {list.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30">
              <div className="text-sm">
                <span className="font-semibold">{h.treatment}</span>
                {h.year && <span className="text-muted-foreground"> · {h.year}</span>}
                {h.clinic && <span className="text-muted-foreground"> · {h.clinic}</span>}
                {h.outcome && <span className="text-muted-foreground"> · {h.outcome}</span>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(h.id)}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid sm:grid-cols-4 gap-2 items-end">
        <div>
          <Label className="text-xs">Treatment</Label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            value={draft.treatment}
            onChange={(e) => setDraft({ ...draft, treatment: e.target.value })}
          >
            <option>IVF</option><option>ICSI</option><option>IUI</option><option>Egg donation</option><option>Freezing</option>
          </select>
        </div>
        <div>
          <Label className="text-xs">Year</Label>
          <Input type="number" value={draft.year} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">Clinic (optional)</Label>
          <Input value={draft.clinic} onChange={(e) => setDraft({ ...draft, clinic: e.target.value })} />
        </div>
        <Button onClick={() => { add(draft); setDraft({ ...draft, clinic: "" }); }}>
          <Plus className="size-4 mr-1" /> Add cycle
        </Button>
      </div>
    </div>
  );
}
