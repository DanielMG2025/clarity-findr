import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AggregatedRow } from "@/lib/fertility";

interface QuoteRow {
  country: string;
  treatment_type: string;
  total_price: number;
}

const Insights = () => {
  const [agg, setAgg] = useState<AggregatedRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: a }, { data: q }] = await Promise.all([
        supabase.from("aggregated_pricing").select("*").order("avg_price", { ascending: true }),
        supabase.from("user_submitted_quotes").select("country, treatment_type, total_price"),
      ]);
      setAgg((a ?? []) as AggregatedRow[]);
      setQuotes((q ?? []) as QuoteRow[]);
    })();
  }, []);

  // Avg IVF price by country
  const ivfByCountry = (() => {
    const map = new Map<string, number[]>();
    quotes
      .filter((q) => q.treatment_type === "IVF")
      .forEach((q) => {
        if (!map.has(q.country)) map.set(q.country, []);
        map.get(q.country)!.push(q.total_price);
      });
    return Array.from(map.entries()).map(([country, vals]) => ({
      country,
      avg: Math.round(vals.reduce((s, n) => s + n, 0) / vals.length),
      samples: vals.length,
    }));
  })();

  const spainQuotes = quotes.filter((q) => q.country === "Spain" && q.treatment_type === "IVF");
  const variability = (() => {
    if (spainQuotes.length < 2) return 0;
    const min = Math.min(...spainQuotes.map((q) => q.total_price));
    const max = Math.max(...spainQuotes.map((q) => q.total_price));
    return Math.round((max - min) / 2);
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-hero">
          <div className="container py-12">
            <h1 className="text-3xl md:text-4xl font-bold">Market insights</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Aggregated, anonymized pricing data from {quotes.length} community-submitted quotes.
            </p>
          </div>
        </section>

        <section className="container py-10 grid lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 shadow-card">
            <h2 className="text-lg font-bold mb-1">Average IVF cost by country</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Total cycle cost incl. medication and extras
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ivfByCountry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="country" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                    }}
                    formatter={(v: number) => `€${v.toLocaleString()}`}
                  />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Price variability in Spain
            </div>
            <div className="text-5xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
              ±€{variability.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Spread between cheapest and most expensive IVF cycle reported.
            </p>
            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Spain quotes</span>
                <span className="font-semibold">{spainQuotes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Clinics tracked</span>
                <span className="font-semibold">{agg.length}</span>
              </div>
            </div>
          </Card>
        </section>

        <section className="container pb-16">
          <Card className="p-6 shadow-card">
            <h2 className="text-lg font-bold mb-4">Clinic price ranges</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                    <th className="py-3 pr-4">Clinic</th>
                    <th className="py-3 pr-4">Treatment</th>
                    <th className="py-3 pr-4 text-right">Min</th>
                    <th className="py-3 pr-4 text-right">Avg</th>
                    <th className="py-3 pr-4 text-right">Max</th>
                    <th className="py-3 pr-4 text-right">Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {agg.map((row) => (
                    <tr key={row.clinic_name + row.treatment_type} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{row.clinic_name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{row.treatment_type}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        €{row.min_price.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums">
                        €{Math.round(Number(row.avg_price)).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        €{row.max_price.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">
                        {row.sample_size}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Based on anonymized user-submitted quotes. Quote dataset refreshes as the community
              contributes.
            </p>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Insights;
