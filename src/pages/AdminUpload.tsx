import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, EyeOff, Database, ArrowRight, BookOpen, FileText } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type DatasetKey =
  | "discovery"
  | "pricing_sources"
  | "review_signals"
  | "patient_quotes"
  | "normalized_draft"
  | "price_components";

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
  price_components: {
    label: "Price components",
    description: "Componentes individuales (medicación, ICSI, PGT-A, vitrificación, extras).",
    required: ["clinic_name", "treatment", "component", "amount"],
    optional: ["currency", "included_by_default", "notes"],
  },
};

// Sheet name → dataset key auto-detection
const SHEET_DATASET_MAP: Record<string, DatasetKey> = {
  clinic_discovery_candidates: "discovery",
  pricing_sources: "pricing_sources",
  review_signals: "review_signals",
  normalized_prices_draft: "normalized_draft",
  price_components: "price_components",
  patient_quotes: "patient_quotes",
};

const DOC_SHEETS = new Set(["readme", "import_mapping", "instructions", "docs"]);

const isDocSheet = (name: string) => DOC_SHEETS.has(name.trim().toLowerCase());

type SheetData = { name: string; headers: string[]; rows: Record<string, string>[] };

function parseWorkbook(file: File): Promise<SheetData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheets: SheetData[] = wb.SheetNames.map((name) => {
          const sheet = wb.Sheets[name];
          const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
          const headers = json.length ? Object.keys(json[0]) : [];
          const rows = json.map((r) => {
            const out: Record<string, string> = {};
            headers.forEach((h) => (out[h] = String(r[h] ?? "")));
            return out;
          });
          return { name, headers, rows };
        });
        resolve(sheets);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

const AdminUpload = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [dataset, setDataset] = useState<DatasetKey>("pricing_sources");
  const [dragOver, setDragOver] = useState(false);

  const current = sheets.find((s) => s.name === selectedSheet) ?? null;
  const headers = current?.headers ?? [];
  const rows = current?.rows ?? [];

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
      const parsed = await parseWorkbook(file);
      setFileName(file.name);
      setSheets(parsed);
      setSelectedSheet(null);
      toast.success(`Loaded ${parsed.length} sheet(s) from ${file.name}`);
    } catch {
      toast.error("Could not parse file. Use .xlsx, .xls or .csv");
    }
  };

  const selectSheet = (name: string) => {
    if (isDocSheet(name)) {
      toast.warning(`"${name}" is a documentation sheet and cannot be imported.`);
      return;
    }
    setSelectedSheet(name);
    const detected = SHEET_DATASET_MAP[name.trim().toLowerCase()];
    if (detected) {
      setDataset(detected);
      toast.success(`Detected dataset: ${SCHEMAS[detected].label}`);
    }
  };

  const reset = () => {
    setFileName(null);
    setSheets([]);
    setSelectedSheet(null);
  };

  const handleImport = () => {
    if (!valid || !current) return;
    toast.success(`Queued ${validRowsCount} rows from "${current.name}" to staging — pending review.`);
    setSelectedSheet(null);
  };

  return (
    <AdminShell
      title="Upload dataset"
      subtitle="Sube workbooks Excel multi-hoja. Elegí qué hoja importar; README y documentación se ignoran."
    >
      <div className="rounded-lg p-3 text-sm flex items-start gap-2 border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 text-amber-800">
        <EyeOff className="size-4 mt-0.5 shrink-0" />
        Imported data is <b>not visible to patients</b> until reviewed and published.
      </div>

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
                <p className="text-xs text-muted-foreground">
                  {sheets.length} sheet(s) · {sheets.filter((s) => !isDocSheet(s.name)).length} importable
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={reset}>Choose another</Button>
          </Card>

          <Card className="p-5 space-y-3">
            <div>
              <h3 className="font-semibold">Workbook detected</h3>
              <p className="text-sm text-muted-foreground">Pick the sheet to import. Documentation sheets are skipped.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {sheets.map((s) => {
                const doc = isDocSheet(s.name);
                const detected = SHEET_DATASET_MAP[s.name.trim().toLowerCase()];
                const isSelected = selectedSheet === s.name;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => selectSheet(s.name)}
                    disabled={doc}
                    className={cn(
                      "text-left rounded-lg border p-3 transition-colors",
                      doc && "bg-muted/40 cursor-not-allowed opacity-70",
                      !doc && "hover:border-primary/60",
                      isSelected && "border-primary ring-2 ring-primary/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {doc ? <BookOpen className="size-4 text-muted-foreground" /> : <FileText className="size-4 text-primary" />}
                          <span className="font-mono text-sm truncate">{s.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {s.rows.length} rows · {s.headers.length} cols
                        </p>
                      </div>
                      {doc ? (
                        <Badge variant="secondary">Documentation only</Badge>
                      ) : detected ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600">Auto-detected</Badge>
                      ) : (
                        <Badge variant="outline">Manual mapping</Badge>
                      )}
                    </div>
                    {doc && (
                      <p className="text-xs text-muted-foreground mt-2">
                        This sheet contains workbook instructions and should not be imported.
                      </p>
                    )}
                    {!doc && detected && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Detected: <b>{SCHEMAS[detected].label}</b>
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {current && (
            <>
              <Card className="p-5 space-y-4">
                <div className="grid sm:grid-cols-[260px_1fr] gap-4 items-start">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Dataset type</label>
                    <Select value={dataset} onValueChange={(v) => setDataset(v as DatasetKey)}>
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
                          <Badge
                            key={c}
                            variant={headers.includes(c) ? "default" : "destructive"}
                            className="font-mono text-[11px]"
                          >
                            {c}
                          </Badge>
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

              <div className="grid sm:grid-cols-4 gap-3">
                <Card className="p-4"><p className="text-xs text-muted-foreground">Rows detected</p><p className="text-2xl font-bold">{rows.length}</p></Card>
                <Card className="p-4"><p className="text-xs text-muted-foreground">Missing columns</p><p className="text-2xl font-bold text-destructive">{missingCols.length}</p></Card>
                <Card className="p-4"><p className="text-xs text-muted-foreground text-emerald-700">Valid rows</p><p className="text-2xl font-bold text-emerald-700">{validRowsCount}</p></Card>
                <Card className="p-4"><p className="text-xs text-muted-foreground text-amber-700">Invalid rows</p><p className="text-2xl font-bold text-amber-700">{invalidRows.length}</p></Card>
              </div>

              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {valid ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600"><CheckCircle2 className="size-3 mr-1" />Schema valid</Badge>
                  ) : (
                    <Badge variant="destructive"><AlertTriangle className="size-3 mr-1" />Missing columns</Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Sheet: <span className="font-mono">{current.name}</span>
                  </span>
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
                  Import selected sheet ({validRowsCount} rows)
                </Button>
              </div>
            </>
          )}
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
