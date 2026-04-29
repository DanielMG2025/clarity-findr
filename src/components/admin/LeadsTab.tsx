import { useMemo, useState } from "react";
import { Users, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard, SectionHeader } from "./AdminShared";
import { LEADS, type LeadQuality, type LeadStatus } from "@/lib/adminMocks";

const QUALITY_STYLE: Record<LeadQuality, string> = {
  high: "bg-accent/15 text-accent border-accent/40",
  medium: "bg-warning/15 text-warning border-warning/30",
  low: "bg-muted text-muted-foreground border-border",
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-primary border-primary/30",
  contacted: "bg-accent-soft text-accent border-accent/30",
  consultation: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  lost: "bg-muted text-muted-foreground border-border",
};

export const LeadsTab = () => {
  const [qFilter, setQFilter] = useState<LeadQuality | "all">("all");

  const filtered = useMemo(
    () => LEADS.filter((l) => qFilter === "all" || l.quality === qFilter),
    [qFilter],
  );

  const totals = useMemo(() => {
    const high = LEADS.filter((l) => l.quality === "high").length;
    const consult = LEADS.filter((l) => l.status === "consultation").length;
    const fees = LEADS.reduce((s, l) => s + l.fee_eur, 0);
    return { total: LEADS.length, high, consult, fees };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Lead management"
        description="All patient leads across all clinics. Pre-qualified, pre-scored, and tagged with predicted conversion probability."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Leads MTD" value={totals.total} icon={<Users className="size-5" />} />
        <KpiCard label="High-quality" value={totals.high} icon={<Users className="size-5" />} accent="accent" />
        <KpiCard label="Consultations" value={totals.consult} icon={<Users className="size-5" />} accent="accent" />
        <KpiCard label="Lead fees MTD" value={`€${totals.fees.toLocaleString()}`} icon={<Users className="size-5" />} />
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="size-4 text-muted-foreground" />
          <Select value={qFilter} onValueChange={(v) => setQFilter(v as LeadQuality | "all")}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All qualities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Assigned clinic</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Conv. prob.</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{l.id}</div>
                    <div className="text-xs text-muted-foreground">{l.received_days_ago}d ago</div>
                  </TableCell>
                  <TableCell className="text-sm">{l.patient_ref}</TableCell>
                  <TableCell className="text-sm">{l.clinic_name}</TableCell>
                  <TableCell className="text-sm">{l.treatment}</TableCell>
                  <TableCell className="tabular-nums text-sm font-semibold">{l.match_score}%</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-primary" style={{ width: `${l.conversion_probability}%` }} />
                      </div>
                      <span className="text-xs tabular-nums">{l.conversion_probability}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize text-[10px] ${QUALITY_STYLE[l.quality]}`}>
                      {l.quality}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {l.source === "free_referral" && "Free referral"}
                    {l.source === "paid_unlock" && "Paid unlock"}
                    {l.source === "premium_referral" && "Premium referral"}
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">€{l.fee_eur}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize text-[10px] ${STATUS_STYLE[l.status]}`}>
                      {l.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default LeadsTab;
