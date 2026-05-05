import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, ExternalLink, EyeOff, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PartnerRow {
  slug: string;
  name: string;
  widget: string;
  visits: number;
  starts: number;
  completions: number;
  quotes: number;
  leads: number;
  revenue: number;
  status: "active" | "pilot" | "paused";
}

const PARTNERS: PartnerRow[] = [
  { slug: "red-infertiles",  name: "Red Nacional de Infértiles", widget: "fiv-madrid",       visits: 1240, starts: 612, completions: 287, quotes: 42, leads: 88,  revenue: 1320, status: "pilot"  },
  { slug: "endoinfo",        name: "Endoinfo",                    widget: "fiv-madrid",       visits: 940,  starts: 410, completions: 198, quotes: 31, leads: 54,  revenue: 810,  status: "pilot"  },
  { slug: "ra-org",          name: "Reproducción Asistida ORG",   widget: "fiv-madrid",       visits: 5200, starts: 2480, completions: 1190, quotes: 188, leads: 322, revenue: 4830, status: "active" },
  { slug: "fertility-road",  name: "Fertility Road",              widget: "fiv-madrid",       visits: 0,    starts: 0,   completions: 0,   quotes: 0,  leads: 0,   revenue: 0,    status: "paused" },
];

const totals = PARTNERS.reduce(
  (a, p) => ({
    visits: a.visits + p.visits,
    starts: a.starts + p.starts,
    completions: a.completions + p.completions,
    quotes: a.quotes + p.quotes,
    leads: a.leads + p.leads,
    revenue: a.revenue + p.revenue,
  }),
  { visits: 0, starts: 0, completions: 0, quotes: 0, leads: 0, revenue: 0 },
);

const statusStyles: Record<PartnerRow["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  pilot:  "bg-blue-500/10 text-blue-700 border-blue-200",
  paused: "bg-muted text-muted-foreground",
};

export default function AdminPartners() {
  const [slug, setSlug] = useState("red-infertiles");
  const [color, setColor] = useState("");

  const widgetUrl = `${window.location.origin}/widgets/fiv-madrid?partner=${encodeURIComponent(slug)}${color ? `&color=${encodeURIComponent(color)}` : ""}`;
  const embedSnippet = `<iframe src="${widgetUrl}" width="100%" height="1400" frameborder="0" style="border:0;border-radius:12px" title="Calculadora FIV Madrid · Fertility Compass"></iframe>`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado` });
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Partner Panel · Widgeting</h1>
          <p className="text-sm text-muted-foreground">
            Distribución de Fertility Compass como capa embebible en comunidades y medios.
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <EyeOff className="size-3" /> Vista interna · no visible para pacientes
        </Badge>
      </header>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Visitas", value: totals.visits },
          { label: "Starts", value: totals.starts },
          { label: "Completions", value: totals.completions },
          { label: "Presupuestos", value: totals.quotes },
          { label: "Leads", value: totals.leads },
          { label: "Revenue", value: `€${totals.revenue.toLocaleString("es-ES")}` },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="text-xl font-bold tabular-nums">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="embed">Generar embed</TabsTrigger>
          <TabsTrigger value="compliance">Compliance pack</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Partners activos</CardTitle>
              <CardDescription>Métricas agregadas por partner y widget.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Widget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Visitas</TableHead>
                    <TableHead className="text-right">Completions</TableHead>
                    <TableHead className="text-right">Conv.</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PARTNERS.map((p) => {
                    const conv = p.starts ? Math.round((p.completions / p.starts) * 100) : 0;
                    return (
                      <TableRow key={p.slug}>
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">/{p.slug}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{p.widget}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={statusStyles[p.status]}>{p.status}</Badge></TableCell>
                        <TableCell className="text-right tabular-nums">{p.visits.toLocaleString("es-ES")}</TableCell>
                        <TableCell className="text-right tabular-nums">{p.completions.toLocaleString("es-ES")}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className="inline-flex items-center gap-1">
                            <TrendingUp className="size-3 text-emerald-600" /> {conv}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{p.leads}</TableCell>
                        <TableCell className="text-right tabular-nums">€{p.revenue.toLocaleString("es-ES")}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="outline">
                            <a href={`/widgets/${p.widget}?partner=${p.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="size-3.5" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generador de embed</CardTitle>
              <CardDescription>Crea el snippet iframe co-branded para un partner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Partner slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="red-infertiles" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color de acento (HSL, opcional)</Label>
                  <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="262 83% 58%" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">URL del widget</Label>
                <div className="flex gap-2">
                  <Input readOnly value={widgetUrl} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={() => copy(widgetUrl, "URL")}>
                    <Copy className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={widgetUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Snippet iframe</Label>
                <div className="rounded-lg border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                  {embedSnippet}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => copy(embedSnippet, "Snippet")}>
                  <Copy className="size-3.5 mr-1" /> Copiar snippet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance pack para partners</CardTitle>
              <CardDescription>Qué hace y qué no hace la herramienta.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <b>Qué hace:</b> estima coste real de tratamientos de fertilidad, normaliza componentes
                (medicación, ICSI, PGT-A, vitrificación), permite subir presupuestos y comparar clínicas
                revisadas.
              </div>
              <div>
                <b>Qué NO hace:</b> no da diagnóstico ni consejo médico, no sustituye a una consulta clínica,
                no garantiza tasas de éxito.
              </div>
              <div>
                <b>Datos recogidos:</b> edad, opciones de tratamiento, email solo si el usuario lo aporta
                voluntariamente. Base legal: consentimiento explícito.
              </div>
              <div>
                <b>Datos compartidos con el partner:</b> métricas agregadas (visitas, completions, leads).
                Nunca datos personales identificables.
              </div>
              <div>
                <b>Modelo de monetización:</b> licencia SaaS, sponsorship educativo o revenue share por lead
                cualificado, según acuerdo. Siempre etiquetado de forma transparente.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
