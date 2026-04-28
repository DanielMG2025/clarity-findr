import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { CheckCircle2, FileSpreadsheet, Upload, AlertCircle, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  TARGET_FIELDS,
  TargetKey,
  autoMapColumns,
  transformRow,
  RowOutcome,
} from "@/lib/quoteImport";

type RawRow = Record<string, unknown>;

const Import = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<RawRow[]>([]);
  const [mapping, setMapping] = useState<Record<TargetKey, string | null>>(
    {} as Record<TargetKey, string | null>
  );
  const [submitting, setSubmitting] = useState(false);
  const [imported, setImported] = useState<number | null>(null);

  const outcomes: RowOutcome[] = useMemo(
    () => rows.map((r, i) => transformRow(r, mapping, i)),
    [rows, mapping]
  );
  const valid = outcomes.filter((o) => o.ok) as Extract<RowOutcome, { ok: true }>[];
  const invalid = outcomes.filter((o) => !o.ok) as Extract<RowOutcome, { ok: false }>[];

  const handleFile = async (file: File) => {
    setImported(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "", raw: true });
      if (!json.length) {
        toast.error("File is empty");
        return;
      }
      const hdrs = Object.keys(json[0]);
      setFileName(file.name);
      setHeaders(hdrs);
      setRows(json);
      setMapping(autoMapColumns(hdrs));
      toast.success(`Loaded ${json.length} rows from ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not parse file. Use CSV or Excel.");
    }
  };

  const handleImport = async () => {
    if (!valid.length) {
      toast.error("No valid rows to import");
      return;
    }
    setSubmitting(true);
    try {
      const payload = valid.map((v) => ({ ...v.data, is_verified: false }));
      // chunk insert (RLS allows anonymous insert per existing policy)
      const chunkSize = 200;
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        const { error } = await supabase.from("user_submitted_quotes").insert(chunk);
        if (error) throw error;
      }
      // refresh aggregated pricing
      await supabase.rpc("refresh_aggregated_pricing");
      setImported(payload.length);
      toast.success(`Imported ${payload.length} quotes`);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Import failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFileName(null);
    setHeaders([]);
    setRows([]);
    setMapping({} as Record<TargetKey, string | null>);
    setImported(null);
  };

  const requiredMissing = TARGET_FIELDS.filter((f) => f.required && !mapping[f.key]).map((f) => f.label);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container py-12 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="space-y-3">
            <Badge variant="secondary" className="font-semibold uppercase tracking-wider">
              Admin · Bulk import
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">Import quotes from CSV or Excel</h1>
            <p className="text-muted-foreground max-w-2xl">
              Drop a spreadsheet — we auto-detect columns like <em>clinic name</em>, <em>country</em>,{" "}
              <em>treatment</em>, and <em>price</em>. Review, fix mappings, and import in one click.
            </p>
          </header>

          {!fileName && (
            <DropZone onFile={handleFile} />
          )}

          {fileName && (
            <>
              <Card className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet className="size-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {rows.length} rows · {headers.length} columns detected
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={reset}>
                  Choose another file
                </Button>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Column mapping</h2>
                  <Badge variant="outline" className="text-xs">
                    Auto-detected · adjust if needed
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {TARGET_FIELDS.map((f) => (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-sm font-medium flex items-center gap-2">
                        {f.label}
                        {f.required && <span className="text-destructive text-xs">*required</span>}
                      </label>
                      <Select
                        value={mapping[f.key] ?? "__none__"}
                        onValueChange={(v) =>
                          setMapping((m) => ({ ...m, [f.key]: v === "__none__" ? null : v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="— Not mapped —" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Not mapped —</SelectItem>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                {requiredMissing.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                    <AlertCircle className="size-4 mt-0.5 shrink-0" />
                    <span>Missing required mapping: {requiredMissing.join(", ")}</span>
                  </div>
                )}
              </Card>

              <Card className="p-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">Preview</h2>
                  <Badge className="bg-accent text-accent-foreground">
                    <CheckCircle2 className="size-3 mr-1" /> {valid.length} valid
                  </Badge>
                  <Badge variant="destructive">
                    <AlertCircle className="size-3 mr-1" /> {invalid.length} invalid
                  </Badge>
                </div>

                <Tabs defaultValue="valid">
                  <TabsList>
                    <TabsTrigger value="valid">Valid ({valid.length})</TabsTrigger>
                    <TabsTrigger value="invalid">Invalid ({invalid.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="valid" className="mt-4">
                    <PreviewValid rows={valid.slice(0, 50)} />
                    {valid.length > 50 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Showing first 50 of {valid.length} valid rows.
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="invalid" className="mt-4">
                    <PreviewInvalid rows={invalid.slice(0, 50)} />
                    {invalid.length > 50 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Showing first 50 of {invalid.length} invalid rows.
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>

              <div className="flex items-center justify-between gap-4 sticky bottom-4 bg-background/80 backdrop-blur p-4 rounded-xl border shadow-lg">
                <div className="text-sm text-muted-foreground">
                  {imported !== null ? (
                    <span className="flex items-center gap-2 text-accent font-medium">
                      <CheckCircle2 className="size-4" /> Imported {imported} quotes & refreshed market prices.
                    </span>
                  ) : (
                    <>Ready to import <strong>{valid.length}</strong> quotes.</>
                  )}
                </div>
                <Button
                  size="lg"
                  variant="hero"
                  disabled={submitting || valid.length === 0 || requiredMissing.length > 0}
                  onClick={handleImport}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Importing…
                    </>
                  ) : (
                    <>
                      <Database className="size-4" /> Import {valid.length} quotes
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

const DropZone = ({ onFile }: { onFile: (f: File) => void }) => {
  const [drag, setDrag] = useState(false);
  return (
    <Card
      className={`p-12 border-2 border-dashed transition-smooth cursor-pointer ${
        drag ? "border-primary bg-primary-soft" : "border-border hover:border-primary/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <div className="text-center space-y-4">
        <div className="inline-grid place-items-center size-16 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mx-auto">
          <Upload className="size-7" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Drag & drop a CSV or Excel file</h2>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse · .csv, .xlsx, .xls supported
          </p>
        </div>
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </div>
    </Card>
  );
};

const PreviewValid = ({ rows }: { rows: Extract<RowOutcome, { ok: true }>[] }) => {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No valid rows yet.</p>;
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Clinic</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Treatment</TableHead>
            <TableHead className="text-right">Base €</TableHead>
            <TableHead className="text-right">Meds €</TableHead>
            <TableHead className="text-right">Extras €</TableHead>
            <TableHead className="text-right">Total €</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const total = r.data.base_price + r.data.medication_cost + r.data.extras_cost;
            return (
              <TableRow key={r.index}>
                <TableCell className="text-muted-foreground">{r.index + 2}</TableCell>
                <TableCell className="font-medium">{r.data.clinic_name}</TableCell>
                <TableCell>{r.data.country}</TableCell>
                <TableCell>{r.data.treatment_type}</TableCell>
                <TableCell className="text-right tabular-nums">{r.data.base_price.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{r.data.medication_cost.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{r.data.extras_cost.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums font-semibold">{total.toLocaleString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const PreviewInvalid = ({ rows }: { rows: Extract<RowOutcome, { ok: false }>[] }) => {
  if (!rows.length) return <p className="text-sm text-muted-foreground">No invalid rows. 🎉</p>;
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Row</TableHead>
            <TableHead>Errors</TableHead>
            <TableHead>Raw data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.index}>
              <TableCell className="text-muted-foreground">{r.index + 2}</TableCell>
              <TableCell className="text-destructive text-xs space-y-1">
                {r.errors.map((e, i) => (
                  <div key={i}>• {e}</div>
                ))}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                {Object.entries(r.raw)
                  .map(([k, v]) => `${k}: ${String(v)}`)
                  .join(" | ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Import;
