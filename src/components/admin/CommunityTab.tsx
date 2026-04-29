import { useEffect, useMemo, useState } from "react";
import { MessagesSquare, Flag, ShieldCheck, Eye } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";

interface Story {
  id: string;
  age_band: string;
  treatment_type: string;
  country: string;
  clinic_name: string | null;
  estimated_price: number | null;
  outcome: string | null;
  flagged: boolean;
  is_verified: boolean;
  created_at: string;
}

interface Discussion {
  id: string;
  category: string;
  prompt: string;
  reply: string;
  age_band: string | null;
  country: string | null;
  flagged: boolean;
  created_at: string;
}

export const CommunityTab = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [disc, setDisc] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: d }] = await Promise.all([
        supabase
          .from("community_stories")
          .select("id, age_band, treatment_type, country, clinic_name, estimated_price, outcome, flagged, is_verified, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("community_discussions")
          .select("id, category, prompt, reply, age_band, country, flagged, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      setStories((s as Story[]) || []);
      setDisc((d as Discussion[]) || []);
      setLoading(false);
    })();
  }, []);

  const totals = useMemo(() => {
    const flaggedStories = stories.filter((s) => s.flagged).length;
    const flaggedDisc = disc.filter((d) => d.flagged).length;
    const verified = stories.filter((s) => s.is_verified).length;
    return {
      stories: stories.length,
      disc: disc.length,
      flagged: flaggedStories + flaggedDisc,
      verified,
    };
  }, [stories, disc]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Community moderation"
        description="Privacy-first by design — only age band, country and treatment are stored. No personal identifiers, ever. Read-only moderation view."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Stories" value={totals.stories} icon={<MessagesSquare className="size-5" />} />
        <KpiCard label="Discussions" value={totals.disc} icon={<MessagesSquare className="size-5" />} />
        <KpiCard label="Flagged" value={totals.flagged} icon={<Flag className="size-5" />} accent={totals.flagged > 0 ? "warning" : "muted"} />
        <KpiCard label="Verified stories" value={totals.verified} icon={<ShieldCheck className="size-5" />} accent="accent" />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Anonymized stories</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Flags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">Loading…</TableCell></TableRow>
              )}
              {!loading && stories.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">No stories yet.</TableCell></TableRow>
              )}
              {stories.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs">
                    <div className="font-medium">{s.age_band} · {s.country}</div>
                    <div className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="text-sm">{s.treatment_type}</TableCell>
                  <TableCell className="text-sm">{s.clinic_name || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="tabular-nums text-sm">
                    {s.estimated_price ? `€${s.estimated_price.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-xs">{s.outcome || "—"}</TableCell>
                  <TableCell>
                    {s.flagged ? (
                      <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30">
                        <Flag className="size-3 mr-1" /> flagged
                      </Badge>
                    ) : s.is_verified ? (
                      <Badge variant="outline" className="text-[10px] bg-accent/15 text-accent border-accent/30">
                        <ShieldCheck className="size-3 mr-1" /> verified
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">clean</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Discussions</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Reply</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">Loading…</TableCell></TableRow>
              )}
              {!loading && disc.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">No discussions yet.</TableCell></TableRow>
              )}
              {disc.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-sm">
                    <Badge variant="outline" className="text-[10px]">{d.category}</Badge>
                    <div className="text-xs text-muted-foreground mt-1 max-w-[180px] truncate">{d.prompt}</div>
                  </TableCell>
                  <TableCell className="text-xs max-w-[360px]">
                    <p className="line-clamp-2">{d.reply}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {d.age_band || "—"} · {d.country || "—"}
                  </TableCell>
                  <TableCell>
                    {d.flagged ? (
                      <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30">
                        <Flag className="size-3 mr-1" /> flagged
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Eye className="size-3" /> visible
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-5 bg-card border-2 border-dashed">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-5 text-accent mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Privacy-first by schema. </span>
            The community tables only store age band, country and treatment type. No names, emails or
            account links. Moderation is read-only in this build — flag/unflag write actions require
            an authenticated admin role.
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CommunityTab;
