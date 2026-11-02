export interface BetaEventRow {
  id: string;
  created_at: string;
  session_id: string;
  user_email: string | null;
  event_type: string;
  path: string;
  label: string | null;
}

export interface CountRow { key: string; count: number }

const top = (counts: Map<string, number>, limit: number): CountRow[] =>
  [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);

export function topPages(events: BetaEventRow[], limit = 10): CountRow[] {
  const m = new Map<string, number>();
  for (const e of events) if (e.event_type === "page_view") m.set(e.path, (m.get(e.path) ?? 0) + 1);
  return top(m, limit);
}

export function topLabels(events: BetaEventRow[], limit = 10): CountRow[] {
  const m = new Map<string, number>();
  for (const e of events) if (e.event_type === "click" && e.label) m.set(e.label, (m.get(e.label) ?? 0) + 1);
  return top(m, limit);
}

/** Last recorded path of each session, counted: "where people stop". */
export function dropOffs(events: BetaEventRow[], limit = 10): CountRow[] {
  const last = new Map<string, BetaEventRow>();
  for (const e of events) {
    const prev = last.get(e.session_id);
    if (!prev || e.created_at > prev.created_at) last.set(e.session_id, e);
  }
  const m = new Map<string, number>();
  for (const e of last.values()) m.set(e.path, (m.get(e.path) ?? 0) + 1);
  return top(m, limit);
}

export const sessionCount = (events: BetaEventRow[]) => new Set(events.map((e) => e.session_id)).size;

export function recentEvents(events: BetaEventRow[], limit = 50): BetaEventRow[] {
  return [...events].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, limit);
}
