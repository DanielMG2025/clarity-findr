import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/patient/PageHeader";
import { SourceChip } from "@/components/patient/SourceChip";
import { ClinicCardV2 } from "@/components/shared/ClinicCardV2";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";
import { RegulatoryGateNotice } from "@/components/patient/RegulatoryGateNotice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMasterRecord, usePatientJourney } from "@/modules/master-record";
import { overallCompletionMPR, profileConfidence } from "@/modules/patient-profile/blocks";
import { COUNTRIES } from "@/modules/regulatory";

const MOCK_CLINICS = [
  { id: "c1", name: "IVI Barcelona",  displayLabel: "Clinic 1", city: "Barcelona", country: "Spain",          estimatedPrice: 7800, priceLow: 6800, priceHigh: 9200, matchScore: 92, successRate: 58, distance: 320,  highlights: ["Strong IVF success", "English speaking", "Genetic testing on-site"], reason: "Top clinical fit for your age, with prices within 8% of your budget.", badge: "best-match" as const },
  { id: "c2", name: "Reprofit Brno",  displayLabel: "Clinic 2", city: "Brno",      country: "Czech Republic", estimatedPrice: 5400, priceLow: 4900, priceHigh: 6100, matchScore: 87, successRate: 54, distance: 1450, highlights: ["Excellent value", "Donor program", "Multilingual staff"],          reason: "Best value in your shortlist — 31% below your country average.",      badge: "best-value" as const },
  { id: "c3", name: "Eugin Madrid",   displayLabel: "Clinic 3", city: "Madrid",    country: "Spain",          estimatedPrice: 8200, priceLow: 7400, priceHigh: 9800, matchScore: 84, successRate: 56, distance: 90,   highlights: ["Closest to you", "Modern lab", "Donor bank"],                       reason: "Closest match geographically with solid clinical history.",            badge: "closest" as const },
];

const nameToCode = (name: string) => COUNTRIES.find((c) => c.label === name)?.code;

export default function Clinics() {
  const mpr = useMasterRecord();
  const orientation = usePatientJourney().step0_regulatory;
  const completion = overallCompletionMPR(mpr);
  const confidence = profileConfidence(completion);

  const { identity, intent } = mpr;

  // Regulatory GATE: when we know the legal framework, only show clinics in
  // countries that are viable for this patient's situation.
  const viable = orientation ? new Set(orientation.viable_countries) : null;
  const clinics = viable
    ? MOCK_CLINICS.filter((c) => {
        const code = nameToCode(c.country);
        return code ? viable.has(code) : true;
      })
    : MOCK_CLINICS;

  return (
    <div className="container max-w-6xl py-10 space-y-6">
      <PageHeader
        eyebrow="Clinics"
        title="Clinics that may fit your case"
        subtitle="Normalized prices, clinical fit and proximity — with a transparent why for every suggestion. You decide whether and when to reach out."
        note="This is not a medical recommendation. It's orientation to help you have better conversations with each clinic."
      />

      <RegulatoryGateNotice orientation={orientation} />

      <Card className="p-6 text-sm text-muted-foreground border-dashed leading-relaxed">
        Clinic identities are shown once you choose to connect. This keeps our guidance neutral
        and free for you.
      </Card>

      {completion < 60 && (
        <Card className="p-6 bg-primary-soft/30 border-primary/20">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-primary">How much we know about you</div>
              <div className="font-semibold">Share a little more to refine this list (current confidence: {confidence})</div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/situacion">Complete my situation <ArrowRight className="size-3.5 ml-1" /></Link>
            </Button>
          </div>
          <Progress value={completion} className="h-2" />
        </Card>
      )}

      {clinics.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground leading-relaxed">
          None of our reference clinics are in a country that's legally viable for your situation yet.
          As we add clinics in the viable countries, they'll appear here.
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead className="text-right">Fit</TableHead>
                <TableHead className="text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    Indicative price
                    <SourceChip
                      source="Public price lists"
                      date="2026-Q1"
                      confidence="medium"
                      detail="Normalized from published clinic price lists and patient-shared quotes, last reviewed in Q1 2026. Ranges are indicative until a clinic confirms your own quote."
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    Reported success
                    <SourceChip
                      source="Clinic-reported"
                      date="2026-Q1"
                      confidence="low"
                      detail="Self-reported by each clinic, with cohorts that are not directly comparable. Use it as context, never as a prediction for your case."
                    />
                  </div>
                </TableHead>
                <TableHead className="text-right">Distance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-semibold">{c.displayLabel}</div>
                    <div className="text-xs text-muted-foreground">{c.country}</div>
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
      )}

      {clinics.length > 0 && (
        <>
          <TransparencyBlock variant="method" title="Why these clinics, in this order">
            We weight clinical fit (50%), value for money (30%) and proximity (20%) based on your
            situation (age {identity.age ?? "—"}, budget €{intent.budget_eur ? intent.budget_eur.toLocaleString() : "—"})
            {viable ? ", filtered to countries your legal framework allows" : ""}. You decide what
            matters most.
          </TransparencyBlock>

          <div className="grid lg:grid-cols-2 gap-5">
            {clinics.map((c) => <ClinicCardV2 key={c.id} clinic={c} />)}
          </div>
        </>
      )}

      <Card className="p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <div>
            <div className="font-semibold">Want a more tailored shortlist?</div>
            <div className="text-sm text-muted-foreground">Complete your medical context to improve the fit. Only what you want to share.</div>
          </div>
        </div>
        <Button asChild><Link to="/situacion">Open my situation <ArrowRight className="size-4 ml-1" /></Link></Button>
      </Card>
    </div>
  );
}
