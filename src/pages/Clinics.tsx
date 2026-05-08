import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClinicCardV2 } from "@/components/shared/ClinicCardV2";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfileStore } from "@/modules/profile/store";
import { usePatientProfileStore } from "@/modules/patient-profile/store";
import { overallCompletion, profileConfidence } from "@/modules/patient-profile/blocks";

const MOCK_CLINICS = [
  { id: "c1", name: "IVI Barcelona",  city: "Barcelona", country: "Spain",          estimatedPrice: 7800, priceLow: 6800, priceHigh: 9200, matchScore: 92, successRate: 58, distance: 320,  highlights: ["Strong IVF success", "English speaking", "Genetic testing on-site"], reason: "Top clinical fit for your age, with prices within 8% of your budget.", badge: "best-match" as const },
  { id: "c2", name: "Reprofit Brno",  city: "Brno",      country: "Czech Republic", estimatedPrice: 5400, priceLow: 4900, priceHigh: 6100, matchScore: 87, successRate: 54, distance: 1450, highlights: ["Excellent value", "Donor program", "Multilingual staff"],          reason: "Best value in your shortlist — 31% below your country average.",      badge: "best-value" as const },
  { id: "c3", name: "Eugin Madrid",   city: "Madrid",    country: "Spain",          estimatedPrice: 8200, priceLow: 7400, priceHigh: 9800, matchScore: 84, successRate: 56, distance: 90,   highlights: ["Closest to you", "Modern lab", "Donor bank"],                       reason: "Closest match geographically with solid clinical history.",            badge: "closest" as const },
];

export default function Clinics() {
  const profile = useProfileStore();
  const pp = usePatientProfileStore();
  const completion = overallCompletion(profile, pp);
  const confidence = profileConfidence(completion);

  return (
    <div className="container max-w-6xl py-10 space-y-6">
      <header className="space-y-2 max-w-2xl">
        <Badge variant="secondary" className="text-[11px]">Clínicas</Badge>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Clínicas que pueden encajar con tu caso</h1>
        <p className="text-muted-foreground">
          Precios normalizados, encaje clínico y cercanía — con un <em>por qué</em> transparente
          para cada sugerencia. Tú decides si contactas, y cuándo.
        </p>
        <p className="text-xs text-muted-foreground">
          Esto no es una recomendación médica. Es información orientativa para preparar mejores
          conversaciones con cada clínica.
        </p>
      </header>

      {completion < 60 && (
        <Card className="p-5 bg-primary-soft/30 border-primary/20">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Cuánto sabemos de ti</div>
              <div className="font-semibold">Comparte un poco más para afinar esta lista (confianza actual: {confidence})</div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/profile">Completar mi situación <ArrowRight className="size-3.5 ml-1" /></Link>
            </Button>
          </div>
          <Progress value={completion} className="h-2" />
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clinic</TableHead>
              <TableHead className="text-right">Match</TableHead>
              <TableHead className="text-right">Est. price</TableHead>
              <TableHead className="text-right">Success</TableHead>
              <TableHead className="text-right">Distance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_CLINICS.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city}, {c.country}</div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary tabular-nums">{c.matchScore}</TableCell>
                <TableCell className="text-right tabular-nums">€{c.estimatedPrice.toLocaleString()}</TableCell>
                <TableCell className="text-right tabular-nums">{c.successRate}%</TableCell>
                <TableCell className="text-right tabular-nums">{c.distance} km</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <TransparencyBlock variant="method" title="Why these clinics, in this order">
        We weight clinical fit (50%), value-for-money (30%) and distance (20%) for your profile
        (age {profile.age}, budget €{profile.budget.toLocaleString()}). You decide what matters most.
      </TransparencyBlock>

      <div className="grid lg:grid-cols-2 gap-5">
        {MOCK_CLINICS.map((c) => <ClinicCardV2 key={c.id} clinic={c} />)}
      </div>

      <Card className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <div>
            <div className="font-semibold">Want a tighter shortlist?</div>
            <div className="text-sm text-muted-foreground">Complete your medical context to unlock high-confidence matching.</div>
          </div>
        </div>
        <Button asChild><Link to="/profile">Open my profile <ArrowRight className="size-4 ml-1" /></Link></Button>
      </Card>
    </div>
  );
}
