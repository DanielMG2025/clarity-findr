import { useState } from "react";
import { ShieldCheck, Save, Eye, Send, X, FileText, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Inclusion = "included" | "excluded" | "optional" | "unknown";
type Draft = {
  id: string;
  clinic: string;
  treatment: string;
  sourceType: string;
  sourceUrl: string;
  rawText: string;
  rawPrice: string;
  components: Record<string, { price: number; inclusion: Inclusion }>;
  basicMin: number; basicMax: number;
  premiumMin: number; premiumMax: number;
  guaranteeMin: number; guaranteeMax: number;
  confidence: number;
  explanation: string;
  status: "draft" | "reviewed" | "approved" | "published" | "rejected";
};

const COMPONENTS = [
  "Base treatment", "Medication", "ICSI", "Transfer",
  "Vitrification", "Storage", "PGT-A", "Guarantee program",
];

const SEED: Draft[] = [
  {
    id: "1",
    clinic: "Fertility Madrid",
    treatment: "FIV",
    sourceType: "Official website",
    sourceUrl: "https://fertilitymadrid.es/precios",
    rawText: "FIV con ICSI: 4.500€ (incluye laboratorio, no incluye medicación). Vitrificación adicional: 450€.",
    rawPrice: "€4.500",
    components: {
      "Base treatment": { price: 4500, inclusion: "included" },
      "Medication": { price: 1500, inclusion: "excluded" },
      "ICSI": { price: 0, inclusion: "included" },
      "Transfer": { price: 0, inclusion: "included" },
      "Vitrification": { price: 450, inclusion: "optional" },
      "Storage": { price: 300, inclusion: "optional" },
      "PGT-A": { price: 1800, inclusion: "excluded" },
      "Guarantee program": { price: 0, inclusion: "unknown" },
    },
    basicMin: 5400, basicMax: 6900,
    premiumMin: 6900, premiumMax: 9200,
    guaranteeMin: 9500, guaranteeMax: 12500,
    confidence: 88,
    explanation: "Precio publicado de FIV+ICSI revisado contra la web oficial. Añadimos rango realista de medicación y vitrificación.",
    status: "draft",
  },
  {
    id: "2",
    clinic: "FIVMadrid",
    treatment: "FIV",
    sourceType: "Official website",
    sourceUrl: "https://fivmadrid.es/tarifas",
    rawText: "Ciclo FIV completo desde 4.200€. Medicación aparte (1.200-1.800€).",
    rawPrice: "€4.200",
    components: {
      "Base treatment": { price: 4200, inclusion: "included" },
      "Medication": { price: 1500, inclusion: "excluded" },
      "ICSI": { price: 600, inclusion: "optional" },
      "Transfer": { price: 0, inclusion: "included" },
      "Vitrification": { price: 500, inclusion: "optional" },
      "Storage": { price: 350, inclusion: "optional" },
      "PGT-A": { price: 1900, inclusion: "excluded" },
      "Guarantee program": { price: 0, inclusion: "unknown" },
    },
    basicMin: 5600, basicMax: 7100,
    premiumMin: 7100, premiumMax: 9500,
    guaranteeMin: 9800, guaranteeMax: 12800,
    confidence: 82,
    explanation: "FIV base + medicación normalizada. ICSI no obligatorio en perfil joven, marcado como opcional.",
    status: "draft",
  },
];

const inclusionMeta: Record<Inclusion, string> = {
  included: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  excluded: "bg-rose-500/10 text-rose-700 border-rose-200",
  optional: "bg-amber-500/10 text-amber-700 border-amber-200",
  unknown:  "bg-muted text-muted-foreground",
};

const statusMeta: Record<Draft["status"], string> = {
  draft: "bg-muted text-muted-foreground",
  reviewed: "bg-blue-500/10 text-blue-700 border-blue-200",
  approved: "bg-amber-500/10 text-amber-700 border-amber-200",
  published: "bg-emerald-600 text-white",
  rejected: "bg-destructive text-destructive-foreground",
};

const fmt = (n: number) => `€${n.toLocaleString()}`;

const AdminNormalizePrices = () => {
  const [drafts, setDrafts] = useState<Draft[]>(SEED);
  const [activeId, setActiveId] = useState(SEED[0].id);
  const draft = drafts.find((d) => d.id === activeId)!;

  const updateDraft = (patch: Partial<Draft>) =>
    setDrafts((arr) => arr.map((d) => (d.id === activeId ? { ...d, ...patch } : d)));

  const updateComponent = (key: string, patch: Partial<{ price: number; inclusion: Inclusion }>) =>
    setDrafts((arr) =>
      arr.map((d) =>
        d.id === activeId
          ? { ...d, components: { ...d.components, [key]: { ...d.components[key], ...patch } } }
          : d,
      ),
    );

  const setStatus = (status: Draft["status"], label: string) => {
    updateDraft({ status });
    toast.success(`${draft.clinic} → ${label}`);
  };

  return (
    <AdminShell
      title="Normalization workbench"
      subtitle="Convierte precios brutos en rangos comparables. Solo lo Publicado llega al paciente."
      actions={
        <div className="flex gap-1.5">
          {drafts.map((d) => (
            <Button
              key={d.id}
              size="sm"
              variant={d.id === activeId ? "default" : "outline"}
              onClick={() => setActiveId(d.id)}
            >
              {d.clinic}
            </Button>
          ))}
        </div>
      }
    >
      <div className="grid lg:grid-cols-3 gap-4">
        {/* LEFT: Source */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2"><FileText className="size-4 text-muted-foreground" /> Source</h2>
            <Badge variant="outline">{draft.sourceType}</Badge>
          </div>
          <div>
            <Label className="text-xs">Clinic</Label>
            <p className="font-semibold">{draft.clinic} · {draft.treatment}</p>
          </div>
          <div>
            <Label className="text-xs">Source URL</Label>
            <a href={draft.sourceUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary hover:underline truncate">
              {draft.sourceUrl} <ExternalLink className="size-3 inline" />
            </a>
          </div>
          <div>
            <Label className="text-xs">Raw price</Label>
            <p className="font-mono">{draft.rawPrice}</p>
          </div>
          <div>
            <Label className="text-xs">Original text</Label>
            <p className="text-sm italic text-muted-foreground bg-muted/40 rounded p-2 mt-1">"{draft.rawText}"</p>
          </div>
          <Badge variant="outline" className={statusMeta[draft.status]}>Status: {draft.status}</Badge>
        </Card>

        {/* MIDDLE: Components */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Extracted components</h2>
          <p className="text-xs text-muted-foreground">Marca qué incluye, excluye u opcional el precio publicado.</p>
          <div className="space-y-2">
            {COMPONENTS.map((c) => {
              const comp = draft.components[c];
              return (
                <div key={c} className="border rounded-lg p-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{c}</span>
                    <Badge variant="outline" className={`text-[10px] ${inclusionMeta[comp.inclusion]}`}>
                      {comp.inclusion}
                    </Badge>
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      type="number"
                      value={comp.price}
                      onChange={(e) => updateComponent(c, { price: Number(e.target.value) })}
                      className="h-8 text-xs"
                      placeholder="€"
                    />
                    <Select value={comp.inclusion} onValueChange={(v) => updateComponent(c, { inclusion: v as Inclusion })}>
                      <SelectTrigger className="h-8 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="included">Included</SelectItem>
                        <SelectItem value="excluded">Excluded</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* RIGHT: Normalized output */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold">Normalized output</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Basic min</Label>
              <Input type="number" value={draft.basicMin} onChange={(e) => updateDraft({ basicMin: Number(e.target.value) })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Basic max</Label>
              <Input type="number" value={draft.basicMax} onChange={(e) => updateDraft({ basicMax: Number(e.target.value) })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Premium min</Label>
              <Input type="number" value={draft.premiumMin} onChange={(e) => updateDraft({ premiumMin: Number(e.target.value) })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Premium max</Label>
              <Input type="number" value={draft.premiumMax} onChange={(e) => updateDraft({ premiumMax: Number(e.target.value) })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Guarantee min</Label>
              <Input type="number" value={draft.guaranteeMin} onChange={(e) => updateDraft({ guaranteeMin: Number(e.target.value) })} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Guarantee max</Label>
              <Input type="number" value={draft.guaranteeMax} onChange={(e) => updateDraft({ guaranteeMax: Number(e.target.value) })} className="h-8" />
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-2 text-sm space-y-1">
            <div className="flex justify-between"><span>Published</span><b>{draft.rawPrice}</b></div>
            <div className="flex justify-between"><span>Basic</span><b>{fmt(draft.basicMin)}–{fmt(draft.basicMax)}</b></div>
            <div className="flex justify-between"><span>Premium</span><b>{fmt(draft.premiumMin)}–{fmt(draft.premiumMax)}</b></div>
            <div className="flex justify-between"><span>Guarantee</span><b>{fmt(draft.guaranteeMin)}–{fmt(draft.guaranteeMax)}</b></div>
          </div>

          <div>
            <Label className="text-xs">Confidence · {draft.confidence}%</Label>
            <input
              type="range" min={0} max={100} value={draft.confidence}
              onChange={(e) => updateDraft({ confidence: Number(e.target.value) })}
              className="w-full"
            />
            <Progress value={draft.confidence} className="h-1.5 mt-1" />
          </div>

          <div>
            <Label className="text-xs">Explanation shown to patient</Label>
            <Textarea
              value={draft.explanation}
              onChange={(e) => updateDraft({ explanation: e.target.value })}
              rows={3} className="text-sm"
            />
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-4 flex flex-wrap gap-2 items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Workflow: <b>Draft → Reviewed → Approved → Published</b>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success("Draft saved")}><Save className="size-4" /> Save draft</Button>
          <Button variant="outline" onClick={() => setStatus("reviewed", "Marked reviewed")}>Mark reviewed</Button>
          <Button variant="outline" onClick={() => setStatus("approved", "Approved")}>
            <ShieldCheck className="size-4" /> Approve
          </Button>
          <Button asChild variant="outline">
            <Link to={`/admin/patient-preview?clinic=${encodeURIComponent(draft.clinic)}`}><Eye className="size-4" /> Preview</Link>
          </Button>
          <Button onClick={() => setStatus("published", "Published to patients")}>
            <Send className="size-4" /> Publish
          </Button>
          <Button variant="destructive" onClick={() => setStatus("rejected", "Rejected")}>
            <X className="size-4" /> Reject
          </Button>
        </div>
      </Card>
    </AdminShell>
  );
};

export default AdminNormalizePrices;
