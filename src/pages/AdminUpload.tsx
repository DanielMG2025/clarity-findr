import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, EyeOff, Database, ArrowRight } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type DatasetKey =
  | "discovery"
  | "pricing_sources"
  | "review_signals"
  | "patient_quotes"
  | "normalized_draft";

const SCHEMAS: Record<DatasetKey, { label: string; description: string; required: string[]; optional: string[] }> = {
  discovery: {
    label: "Clinic discovery candidates",
    description: "Public clinics detected through research, not yet imported.",
    required: ["clinic_name", "country", "city", "pricing_url"],
    optional: ["pricing_depth", "treatments_detected", "notes"],
  },
  pricing_sources: {
    label: "Pricing sources",
    description: "Raw pricing references (official pages, dossiers, benchmarks).",
    required: ["clinic_name", "treatment", "source_type", "source_url", "raw_text"],
    optional: ["confidence", "normalization_rule", "currency", "extracted_price"],
  },
  review_signals: {
    label: "Review signals",
    description: "External rating signals (Google, Trustpilot, FindBestClinic, Birdeye).",
    required: ["clinic_name", "platform", "rating", "review_count"],
    optional: ["url", "captured_at"],
  },
  patient_quotes: {
    label: "Patient quotes",
    description: "Presupuestos enviados por pacientes para enriquecer la base.",
    required: ["clinic_name", "treatment", "total_price"],
    optional: ["medication_cost", "extras_cost", "country", "date_received", "notes"],
  },
  normalized_draft: {
    label: "Normalized prices draft",
    description: "Borrador de precios normalizados pendientes de revisión interna.",
    required: ["clinic_name", "treatment", "basic_min", "basic_max"],
    optional: ["premium_min", "premium_max", "guarantee_min", "guarantee_max", "confidence", "includes", "excludes"],
  },
};

function parseFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
        const headers = json.length ? Object.keys(json[0]) : [];
        const rows = json.map((r) => {
          const out: Record<string, string> = {};
          headers.forEach((h) => (out[h] = String(r[h] ?? "")));
          return out;
        });
        resolve({ headers, rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

const AdminUpload = () => {
  const [dataset, setDataset] = useState<DatasetKey>("pricing_sources");
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const schema = SCHEMAS[dataset];
  const missingCols = useMemo(() => schema.required.filter((c) => !headers.includes(c)), [headers, schema]);
  const valid = headers.length > 0 && missingCols.length === 0;

  const invalidRows = useMemo(() => {
    if (!valid) return [];
    return rows
      .map((r, i) => ({ i, missing: schema.required.filter((c) => !r[c] || r[c].trim() === "") }))
      .filter((x) => x.missing.length);
  }, [rows, schema, valid]);

  const validRowsCount = rows.length - invalidRows.length;

  const handleFile = async (file: File) => {
    try {
      const { headers, rows } = await parseFile(file);
      setFileName(file.name);
      setHeaders(headers);
      setRows(rows);
      toast.success(`Loaded ${rows.length} rows from ${file.name}`);
    } catch {
      toast.error("Could not parse file. Use .xlsx, .xls or .csv");
    }
  };

  const reset = () => { setFileName(null); setHeaders([]); setRows([]); };

  const handleImport = () => {
    if (!valid) return;
    toast.success(`Queued ${validRowsCount} rows to staging — pending review.`);
    reset();
  };

  return (
    <AdminShell
      title="Upload dataset"
      subtitle="Sube Excel o CSV. Los datos quedan en staging y no son visibles para pacientes hasta aprobación."
    >
      <div className="rounded-lg p-3 text-sm flex items-start gap-2 border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 text-amber-800">
        <EyeOff className="size-4 mt-0.5 shrink-0" />
        Imported data is <b>not visible to patients</b> until reviewed and published.
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid sm:grid-cols-[260px_1fr] gap-4 items-start">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground">Dataset type</label>
            <Select value={dataset} onValueChange={(v) => { setDataset(v as DatasetKey); reset(); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(SCHEMAS) as DatasetKey[]).map((k) => (
                  <SelectItem key={k} value={k}>{SCHEMAS[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">{schema.description}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Required columns</p>
              <div className="flex flex-wrap gap-1.5">
                {schema.required.map((c) => (
                  <Badge key={c} variant="outline" className="font-mono text-[11px]">{c}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Optional columns</p>
              <div className="flex flex-wrap gap-1.5">
                {schema.optional.map((c) => (
                  <Badge key={c} variant="secondary" className="font-mono text-[11px]">{c}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {!fileName ? (
        <Card
          className={`p-12 border-2 border-dashed cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}
          onClick={() => document.getElementById("file-input")?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        >
          <div className="text-center space-y-3">
            <div className="inline-grid place-items-center size-14 rounded-2xl bg-primary/10 text-primary mx-auto">
              <Upload className="size-6" />
            </div>
            <h3 className="font-semibold">Drop a file here</h3>
            <p className="text-sm text-muted-foreground">or click to browse · .xlsx, .xls, .csv</p>
            <input
              id="file-input" type="file" className="hidden"
              accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileSpreadsheet className="size-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold truncate">{fileName}</p>
                <p className="text-xs text-muted-foreground">{rows.length} rows · {headers.length} columns</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>Choose another</Button>
          </Card>

          <div className="grid sm:grid-cols-4 gap-3">
            <Card className="p-4"><p className="text-xs text-muted-foreground">Rows detected</p><p className="text-2xl font-bold">{rows.length}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground">Missing columns</p><p className="text-2xl font-bold text-destructive">{missingCols.length}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground text-emerald-700">Valid rows</p><p className="text-2xl font-bold text-emerald-700">{validRowsCount}</p></Card>
            <Card className="p-4"><p className="text-xs text-muted-foreground text-amber-700">Invalid rows</p><p className="text-2xl font-bold text-amber-700">{invalidRows.length}</p></Card>
          </div>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              {valid ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600"><CheckCircle2 className="size-3 mr-1" />Schema valid</Badge>
              ) : (
                <Badge variant="destructive"><AlertTriangle className="size-3 mr-1" />Missing columns</Badge>
              )}
            </div>
            {!valid && (
              <p className="text-sm text-destructive">Missing required columns: {missingCols.join(", ")}</p>
            )}
            {valid && invalidRows.length > 0 && (
              <p className="text-sm text-amber-700">{invalidRows.length} rows are missing required values and will be skipped.</p>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold">Preview · first 10 rows</h3>
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((h) => <TableHead key={h} className="font-mono text-xs">{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 10).map((r, i) => (
                    <TableRow key={i}>
                      {headers.map((h) => <TableCell key={h} className="text-xs">{r[h]}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" disabled={!valid} onClick={handleImport}>
              <Database className="size-4" />
              Import {validRowsCount} rows to staging
            </Button>
          </div>
        </>
      )}

      <Card className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-semibold">Next steps</h3>
          <p className="text-sm text-muted-foreground">Review staged records before they reach patients.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline"><Link to="/admin/pricing-sources">Pricing sources <ArrowRight className="size-4" /></Link></Button>
          <Button asChild variant="outline"><Link to="/admin/normalize-prices">Normalize <ArrowRight className="size-4" /></Link></Button>
        </div>
      </Card>
    </AdminShell>
  );
};

export default AdminUpload;
