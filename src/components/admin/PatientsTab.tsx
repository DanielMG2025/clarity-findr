import { useMemo, useState } from "react";
import { Users, Filter, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { PATIENTS, FUNNEL_LABEL, type FunnelStage, type PatientStatus } from "@/lib/adminMocks";

const STAGE_STYLE: Record<FunnelStage, string> = {
  free_discovery: "bg-muted text-muted-foreground border-border",
  intent_decision: "bg-primary/10 text-primary border-primary/30",
  full_access: "bg-primary/15 text-primary border-primary/40",
  advanced: "bg-accent/15 text-accent border-accent/30",
  premium_referral: "bg-foreground/10 text-foreground border-foreground/30",
};

const STATUS_STYLE: Record<PatientStatus, string> = {
  active: "bg-primary/10 text-primary border-primary/30",
  converted: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  dormant: "bg-warning/15 text-warning border-warning/30",
  lost: "bg-muted text-muted-foreground border-border",
};

export const PatientsTab = () => {
  const [stageFilter, setStageFilter] = useState<FunnelStage | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return PATIENTS.filter((p) => {
      if (stageFilter !== "all" && p.funnel_stage !== stageFilter) return false;
      if (q && !`${p.ref} ${p.country} ${p.treatment}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [stageFilter, q]);

  const totals = useMemo(() => {
    const total = PATIENTS.length;
    const advanced = PATIENTS.filter((p) => p.funnel_stage === "advanced" || p.funnel_stage === "premium_referral").length;
    const converted = PATIENTS.filter((p) => p.status === "converted").length;
    const avgScore =
      Math.round(
        PATIENTS.filter((p) => p.match_score > 0).reduce((s, p) => s + p.match_score, 0) /
          PATIENTS.filter((p) => p.match_score > 0).length,
      ) || 0;
    return { total, advanced, converted, avgScore };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Patient management"
        description="Anonymized patient profiles, questionnaire results, funnel stage and matching scores. No personal identifiers stored."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Patients" value={totals.total} icon={<Users className="size-5" />} hint="all stages" />
        <KpiCard label="Advanced + premium" value={totals.advanced} icon={<Users className="size-5" />} accent="accent" />
        <KpiCard label="Converted" value={totals.converted} icon={<Users className="size-5" />} accent="accent" />
        <KpiCard label="Avg match score" value={`${totals.avgScore}%`} icon={<Users className="size-5" />} />
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ref, country, treatment…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as FunnelStage | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All funnel stages</SelectItem>
                {(Object.keys(FUNNEL_LABEL) as FunnelStage[]).map((s) => (
                  <SelectItem key={s} value={s}>{FUNNEL_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Funnel stage</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Conv. prob.</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.ref}>
                  <TableCell>
                    <div className="font-medium">{p.ref}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.joined_days_ago === 0 ? "today" : `${p.joined_days_ago}d ago`}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{p.age}y · {p.country}</div>
                    <div className="text-muted-foreground">{p.treatment} · {p.budget_band}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${STAGE_STYLE[p.funnel_stage]}`}>
                      {FUNNEL_LABEL[p.funnel_stage]}
                    </Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm font-semibold">
                    {p.match_score === 0 ? <span className="text-muted-foreground">—</span> : `${p.match_score}%`}
                  </TableCell>
                  <TableCell>
                    {p.conversion_probability === 0 ? (
                      <span className="text-muted-foreground text-xs">—</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-primary" style={{ width: `${p.conversion_probability}%` }} />
                        </div>
                        <span className="text-xs tabular-nums">{p.conversion_probability}%</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-[11px]">
                    <div className="flex flex-wrap gap-1">
                      {p.modules.advanced && <Badge variant="outline" className="text-[10px]">Adv</Badge>}
                      {p.modules.genetic && <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/30">Gen</Badge>}
                      {p.modules.home_kit && <Badge variant="outline" className="text-[10px] bg-accent/10 text-accent border-accent/30">Kit</Badge>}
                      {!p.modules.advanced && !p.modules.genetic && !p.modules.home_kit && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">€{p.spent_eur}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize text-[10px] ${STATUS_STYLE[p.status]}`}>
                      {p.status}
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

export default PatientsTab;
