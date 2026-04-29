import { useMemo } from "react";
import { Handshake, Dna, TestTube, Banknote, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard, SectionHeader } from "./AdminShared";
import { PARTNERS, type PartnerType } from "@/lib/adminMocks";

const TYPE_ICON: Record<PartnerType, typeof Dna> = {
  genetic: Dna,
  home_kit: TestTube,
  financing: Banknote,
  consultation: Stethoscope,
};

const TYPE_STYLE: Record<PartnerType, string> = {
  genetic: "bg-primary/10 text-primary border-primary/30",
  home_kit: "bg-accent/15 text-accent border-accent/30",
  financing: "bg-foreground/10 text-foreground border-foreground/30",
  consultation: "bg-warning/15 text-warning border-warning/30",
};

export const PartnersTab = () => {
  const totals = useMemo(() => {
    const refs = PARTNERS.reduce((s, p) => s + p.referrals_mtd, 0);
    const rev = PARTNERS.reduce((s, p) => s + p.revenue_share_eur, 0);
    const avgConv = Math.round(
      PARTNERS.reduce((s, p) => s + p.conversion_rate, 0) / PARTNERS.length,
    );
    return { refs, rev, avgConv, count: PARTNERS.length };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Partner management"
        description="Genetic labs, home test kits, financing and consultation partners. Commissions subsidize patient costs."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active partners" value={totals.count} icon={<Handshake className="size-5" />} />
        <KpiCard label="Referrals MTD" value={totals.refs} icon={<Handshake className="size-5" />} accent="accent" />
        <KpiCard label="Commission MTD" value={`€${totals.rev.toLocaleString()}`} icon={<Handshake className="size-5" />} accent="accent" />
        <KpiCard label="Avg conv. rate" value={`${totals.avgConv}%`} icon={<Handshake className="size-5" />} />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Partner roster · usage and revenue</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Referrals MTD</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead>Commission MTD</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PARTNERS.map((p) => {
                const Icon = TYPE_ICON[p.type];
                return (
                  <TableRow key={p.name}>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.category_label}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${TYPE_STYLE[p.type]}`}>
                        <Icon className="size-3 mr-1" /> {p.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums text-sm">{p.referrals_mtd}</TableCell>
                    <TableCell className="tabular-nums text-sm">{p.conversion_rate}%</TableCell>
                    <TableCell className="tabular-nums text-sm font-semibold">
                      €{p.revenue_share_eur.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-[10px]">{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-5 bg-card border-2 border-dashed">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Partner subsidy in action: </span>
          Partners pay us a referral fee. We pass part of that value back to patients by waiving the
          advanced-questionnaire fee — making accurate matching free when a partner test is ordered.
        </p>
      </Card>
    </div>
  );
};

export default PartnersTab;
