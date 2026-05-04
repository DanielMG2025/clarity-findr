import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EyeOff, FileSearch, ShieldCheck, AlertTriangle, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type SourceType = "official" | "benchmark" | "inferred" | "pending_dossier";
type ExtractionStatus = "raw" | "extracting" | "extracted" | "reviewed" | "published" | "rejected";

type Source = {
  id: string;
  clinic: string;
  treatment: string;
  sourceType: SourceType;
  sourceUrl: string;
  rawText: string;
  status: ExtractionStatus;
  confidence: number;
  extractedPrice?: string;
};

const SOURCES: Source[] = [
  { id: "1", clinic: "Fertility Madrid", treatment: "FIV", sourceType: "official", sourceUrl: "https://fertilitymadrid.es/precios", rawText: "FIV con ICSI: 4.500€ (incluye laboratorio, no incluye medicación)", status: "published", confidence: 92, extractedPrice: "€4.500" },
  { id: "2", clinic: "FIVMadrid", treatment: "FIV", sourceType: "official", sourceUrl: "https://fivmadrid.es/tarifas", rawText: "Ciclo FIV completo desde 4.200€. Medicación aparte (1.200-1.800€).", status: "reviewed", confidence: 88, extractedPrice: "€4.200" },
  { id: "3", clinic: "IVI Madrid", treatment: "FIV", sourceType: "official", sourceUrl: "https://ivi.es/tratamientos/fiv", rawText: "Tratamiento FIV-ICSI. Solicita presupuesto personalizado.", status: "extracted", confidence: 55, extractedPrice: "€5.800 (estimado)" },
  { id: "4", clinic: "Instituto Bernabeu", treatment: "FIV", sourceType: "benchmark", sourceUrl: "https://findbestclinic.com/bernabeu", rawText: "Reported FIV pricing: €5,200 - €6,000 base", status: "extracting", confidence: 62, extractedPrice: "€5.600" },
  { id: "5", clinic: "Tambre", treatment: "FIV", sourceType: "pending_dossier", sourceUrl: "—", rawText: "Awaiting clinic dossier upload", status: "raw", confidence: 30 },
  { id: "6", clinic: "Ginefiv", treatment: "FIV", sourceType: "inferred", sourceUrl: "internal://benchmark-2024", rawText: "Inferred from regional Madrid benchmark + clinic tier", status: "raw", confidence: 45, extractedPrice: "€4.900" },
];

const sourceMeta: Record<SourceType, { label: string; cls: string }> = {
  official: { label: "Fuente oficial", cls: "bg-emerald-600 hover:bg-emerald-600" },
  benchmark: { label: "Benchmark externo", cls: "bg-blue-600 hover:bg-blue-600" },
  inferred: { label: "Inferido", cls: "bg-amber-500 hover:bg-amber-500" },
  pending_dossier: { label: "Pendiente dossier", cls: "bg-muted text-muted-foreground" },
};

const statusMeta: Record<ExtractionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  raw: { label: "Raw", variant: "outline" },
  extracting: { label: "Extracting", variant: "secondary" },
  extracted: { label: "Extracted", variant: "secondary" },
  reviewed: { label: "Reviewed", variant: "default" },
  published: { label: "Published", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const ConfidenceBadge = ({ score }: { score: number }) => {
  const tone = score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-destructive";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <Progress value={score} className="h-1.5 w-16" />
      <span className={`text-xs font-semibold tabular-nums ${tone}`}>{score}%</span>
    </div>
  );
};

const AdminPricingSources = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExtractionStatus | "all">("all");

  const filtered = useMemo(
    () =>
      SOURCES.filter(
        (s) =>
          (statusFilter === "all" || s.status === statusFilter) &&
          (query === "" ||
            s.clinic.toLowerCase().includes(query.toLowerCase()) ||
            s.treatment.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, statusFilter],
  );

  const stats = {
    total: SOURCES.length,
    raw: SOURCES.filter((s) => s.status === "raw").length,
    review: SOURCES.filter((s) => s.status === "extracted" || s.status === "extracting").length,
    published: SOURCES.filter((s) => s.status === "published").length,
  };

  const action = (id: string, label: string) => toast.success(`${label} → ${id}`);

  return (
    <main className="container py-10 max-w-7xl space-y-8">
      <header className="space-y-3">
        <Badge variant="secondary" className="font-semibold uppercase tracking-wider">Admin · Pricing sources</Badge>
        <h1 className="text-3xl font-bold tracking-tight">Pricing source pipeline</h1>
        <p className="text-muted-foreground max-w-2xl">
          Raw, extracted and reviewed pricing references. <strong>Only “Published” sources reach patients.</strong>
        </p>
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
          <EyeOff className="size-4 shrink-0" />
          Sources in raw/extracting/extracted state are not visible to patients until approved.
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total sources</p><p className="text-2xl font-bold">{stats.total}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Raw</p><p className="text-2xl font-bold">{stats.raw}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Needs review</p><p className="text-2xl font-bold">{stats.review}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground text-emerald-700">Published</p><p className="text-2xl font-bold text-emerald-700">{stats.published}</p></Card>
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <Filter className="size-4 text-muted-foreground" />
        <Input placeholder="Search clinic or treatment…" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="max-w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(statusMeta).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/admin/data-import">Import dataset</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/admin/clinic-discovery">Discovery</Link></Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Source type</TableHead>
                <TableHead>Source URL</TableHead>
                <TableHead>Raw text</TableHead>
                <TableHead>Extracted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.clinic}</TableCell>
                  <TableCell>{s.treatment}</TableCell>
                  <TableCell><Badge className={sourceMeta[s.sourceType].cls}>{sourceMeta[s.sourceType].label}</Badge></TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {s.sourceUrl.startsWith("http") ? (
                      <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                        {new URL(s.sourceUrl).hostname} <ExternalLink className="size-3" />
                      </a>
                    ) : <span className="text-xs text-muted-foreground">{s.sourceUrl}</span>}
                  </TableCell>
                  <TableCell className="max-w-[260px] text-xs text-muted-foreground italic">"{s.rawText}"</TableCell>
                  <TableCell className="text-sm font-semibold">{s.extractedPrice ?? "—"}</TableCell>
                  <TableCell><Badge variant={statusMeta[s.status].variant}>{statusMeta[s.status].label}</Badge></TableCell>
                  <TableCell><ConfidenceBadge score={s.confidence} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => action(s.id, "Extract")}>
                        <FileSearch className="size-3.5" /> Extract
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => action(s.id, "Review")}>
                        <ShieldCheck className="size-3.5" /> Review
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="size-4 inline mr-2" /> No sources match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
};

export default AdminPricingSources;
