import { useMemo, useState } from "react";
import { Search, Egg, Building2, Globe, Sparkles, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Batch = {
  id: string;
  clinic: string;
  country: string;
  donor_age: number;
  ethnicity: string;
  eggs_available: number;
  ready_in_days: number;
  match_score: number;
  price_eur: number;
  csm_negative: boolean;
};

const FAKE_INVENTORY: Batch[] = [
  { id: "EB-2041", clinic: "IVI Madrid", country: "Spain", donor_age: 24, ethnicity: "Caucasian", eggs_available: 12, ready_in_days: 7, match_score: 94, price_eur: 7800, csm_negative: true },
  { id: "EB-2042", clinic: "Instituto Bernabeu", country: "Spain", donor_age: 26, ethnicity: "Mediterranean", eggs_available: 9, ready_in_days: 14, match_score: 89, price_eur: 8200, csm_negative: true },
  { id: "EB-2043", clinic: "Eugin Barcelona", country: "Spain", donor_age: 22, ethnicity: "Latin", eggs_available: 14, ready_in_days: 4, match_score: 91, price_eur: 7600, csm_negative: true },
  { id: "EB-2044", clinic: "Reprofit", country: "Czech Republic", donor_age: 25, ethnicity: "Slavic", eggs_available: 10, ready_in_days: 10, match_score: 86, price_eur: 5400, csm_negative: true },
  { id: "EB-2045", clinic: "Care Fertility", country: "United Kingdom", donor_age: 28, ethnicity: "Caucasian", eggs_available: 6, ready_in_days: 21, match_score: 78, price_eur: 11200, csm_negative: true },
  { id: "EB-2046", clinic: "Newlife IVF", country: "Greece", donor_age: 23, ethnicity: "Mediterranean", eggs_available: 11, ready_in_days: 9, match_score: 87, price_eur: 6100, csm_negative: true },
  { id: "EB-2047", clinic: "Gennet", country: "Czech Republic", donor_age: 27, ethnicity: "East Asian", eggs_available: 8, ready_in_days: 18, match_score: 82, price_eur: 5900, csm_negative: true },
  { id: "EB-2048", clinic: "Clinica Tambre", country: "Spain", donor_age: 25, ethnicity: "African", eggs_available: 7, ready_in_days: 12, match_score: 84, price_eur: 8400, csm_negative: true },
  { id: "EB-2049", clinic: "Vitanova", country: "Denmark", donor_age: 24, ethnicity: "Nordic", eggs_available: 9, ready_in_days: 6, match_score: 90, price_eur: 9100, csm_negative: true },
  { id: "EB-2050", clinic: "IVI Lisboa", country: "Portugal", donor_age: 26, ethnicity: "Latin", eggs_available: 10, ready_in_days: 11, match_score: 85, price_eur: 7300, csm_negative: true },
];

const EggBank = () => {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string>("All");

  const countries = ["All", ...Array.from(new Set(FAKE_INVENTORY.map((b) => b.country)))];

  const filtered = useMemo(() => {
    return FAKE_INVENTORY.filter((b) => {
      const matchesQ =
        !q ||
        b.clinic.toLowerCase().includes(q.toLowerCase()) ||
        b.ethnicity.toLowerCase().includes(q.toLowerCase());
      const matchesC = country === "All" || b.country === country;
      return matchesQ && matchesC;
    });
  }, [q, country]);

  const totalEggs = filtered.reduce((s, b) => s + b.eggs_available, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-gradient-hero">
        <div className="container py-16 md:py-20">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent bg-accent-soft px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="size-3" /> Concept preview · B2B
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl">
            Egg Bank Network
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Clinic-to-clinic donor matching, in real time.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            A neutral marketplace where fertility clinics share donor egg availability and demand —
            shortening waitlists for patients and balancing supply across borders.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {[
              { icon: Building2, label: "Partner clinics", value: "42" },
              { icon: Egg, label: "Eggs available now", value: totalEggs.toString() },
              { icon: Globe, label: "Countries covered", value: (countries.length - 1).toString() },
            ].map((s) => (
              <Card key={s.label} className="p-5 shadow-card flex items-center gap-4">
                <div className="grid place-items-center size-12 rounded-xl bg-primary-soft text-primary">
                  <s.icon className="size-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                  <div className="text-2xl font-bold">{s.value}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* INVENTORY */}
      <section className="container py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Live inventory</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Mock data shown for demonstration purposes.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Clinic or ethnicity"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-md border bg-background px-3 text-sm"
            >
              {countries.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <Card className="overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Batch</th>
                  <th className="text-left px-4 py-3">Clinic</th>
                  <th className="text-left px-4 py-3">Country</th>
                  <th className="text-left px-4 py-3">Donor age</th>
                  <th className="text-left px-4 py-3">Profile</th>
                  <th className="text-right px-4 py-3">Eggs</th>
                  <th className="text-right px-4 py-3">Ready</th>
                  <th className="text-right px-4 py-3">Match</th>
                  <th className="text-right px-4 py-3">Price</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t hover:bg-muted/30 transition-smooth">
                    <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                    <td className="px-4 py-3 font-medium">{b.clinic}</td>
                    <td className="px-4 py-3">{b.country}</td>
                    <td className="px-4 py-3 tabular-nums">{b.donor_age}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.ethnicity}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      {b.eggs_available}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {b.ready_in_days}d
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge
                        variant="secondary"
                        className={
                          b.match_score >= 90
                            ? "bg-accent-soft text-accent border-accent/30"
                            : "bg-primary-soft text-primary border-primary/30"
                        }
                      >
                        {b.match_score}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">
                      €{b.price_eur.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" disabled>
                        Reserve
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-muted-foreground py-10">
                      No batches match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="size-4" /> Conceptual prototype. No real donor data is shown or
          transacted. This module illustrates a future clinic-to-clinic broker layer.
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default EggBank;
