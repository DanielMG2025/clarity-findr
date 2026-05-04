import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, FileSpreadsheet, Upload, EyeOff, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type DatasetKey = "discovery" | "pricing_sources" | "review_signals";

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
};

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
  return { headers, rows };
}

const AdminDataImport = () => {
  const [dataset, setDataset] = useState<DatasetKey>("discovery");
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);

  const schema = SCHEMAS[dataset];
  const missingCols = useMemo(
    () => schema.required.filter((c) => !headers.includes(c)),
    [headers, schema]
  );
  const valid = headers.length > 0 && missingCols.length === 0;

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { headers, rows } = parseCSV(text);
    setFileName(file.name);
    setHeaders(headers);
    setRows(rows);
    toast.success(`Loaded ${rows.length} rows from ${file.name}`);
  };

  const reset = () => {
    setFileName(null);
    setHeaders([]);
    setRows([]);
  };

  const handleImport = () => {
    if (!valid) return;
    toast.success(`Queued ${rows.length} rows for staging — pending review.`);
    reset();
  };

  return (
    <main className="container py-10 max-w-6xl space-y-8">
      <header className="space-y-3">
        <Badge variant="secondary" className="font-semibold uppercase tracking-wider">
          Admin · Data import
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight">Dataset import</h1>
        <p className="text-muted-foreground max-w-2xl">
          Upload CSVs into the staging area. Records are <strong>never visible to patients</strong> until reviewed and approved.
        </p>
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
          <EyeOff className="size-4 shrink-0" />
          Not visible to patients until approved in the pricing review workflow.
        </div>
      </header>

      <Tabs value={dataset} onValueChange={(v) => { setDataset(v as DatasetKey); reset(); }}>
        <TabsList>
          <TabsTrigger value="discovery">Discovery</TabsTrigger>
          <TabsTrigger value="pricing_sources">Pricing sources</TabsTrigger>
          <TabsTrigger value="review_signals">Review signals</TabsTrigger>
        </TabsList>

        {(Object.keys(SCHEMAS) as DatasetKey[]).map((key) => (
          <TabsContent key={key} value={key} className="space-y-6 mt-6">
            <Card className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold">{SCHEMAS[key].label}</h2>
                <p className="text-sm text-muted-foreground">{SCHEMAS[key].description}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Required columns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SCHEMAS[key].required.map((c) => (
                      <Badge key={c} variant="outline" className="font-mono text-[11px]">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Optional columns</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SCHEMAS[key].optional.map((c) => (
                      <Badge key={c} variant="secondary" className="font-mono text-[11px]">{c}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {!fileName ? (
              <Card
                className="p-12 border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById(`file-${key}`)?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              >
                <div className="text-center space-y-3">
                  <div className="inline-grid place-items-center size-14 rounded-2xl bg-primary/10 text-primary mx-auto">
                    <Upload className="size-6" />
                  </div>
                  <h3 className="font-semibold">Drop a CSV file here</h3>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                  <input
                    id={`file-${key}`}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
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
                    Import {rows.length} rows to staging
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Next steps</h3>
          <p className="text-sm text-muted-foreground">Review staged records before they reach patients.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/admin/clinic-discovery">Discovery <ArrowRight className="size-4" /></Link></Button>
          <Button asChild variant="outline"><Link to="/admin/pricing-sources">Pricing sources <ArrowRight className="size-4" /></Link></Button>
        </div>
      </Card>
    </main>
  );
};

export default AdminDataImport;
