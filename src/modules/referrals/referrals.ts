export const REFERRAL_TYPES = ["tester", "ambassador", "association", "partner"] as const;
export type ReferralType = (typeof REFERRAL_TYPES)[number];
export const DEFAULT_SEATS = 5;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const CODE_PATTERN = /^[A-Za-z0-9_-]{4,32}$/;

/** Short URL-safe slug; `taken` lets callers retry until the code is unique. */
export function mintReferralCode(taken: ReadonlySet<string> = new Set(), length = 8, random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const bytes = random(length);
    const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
    if (!taken.has(code)) return code;
  }
  throw new Error("Could not mint a unique code");
}

/** A null cap never blocks; otherwise seats_used must stay below the cap. */
export function hasCapacity(row: { active?: boolean; seats_cap: number | null; seats_used: number }) {
  if (row.active === false) return false;
  return row.seats_cap === null || row.seats_used < row.seats_cap;
}

export const seatsLeft = (row: { seats_cap: number | null; seats_used: number }) =>
  row.seats_cap === null ? null : Math.max(0, row.seats_cap - row.seats_used);

export const inviteLink = (origin: string, code: string) => `${origin}/unirse?ref=${encodeURIComponent(code)}`;

type Node = { code: string; parent_code: string | null };

export function childrenIndex(rows: readonly Node[]) {
  const map = new Map<string, string[]>();
  for (const r of rows) if (r.parent_code) map.set(r.parent_code, [...(map.get(r.parent_code) ?? []), r.code]);
  return map;
}

/** All codes below `code` in the invite tree (cycle-safe). */
export function descendants(code: string, rows: readonly Node[], index = childrenIndex(rows)): string[] {
  const out: string[] = [];
  const seen = new Set([code]);
  const stack = [...(index.get(code) ?? [])];
  while (stack.length) {
    const next = stack.pop()!;
    if (seen.has(next)) continue;
    seen.add(next); out.push(next);
    stack.push(...(index.get(next) ?? []));
  }
  return out;
}

export const directJoins = (code: string, rows: readonly Node[]) => rows.filter((r) => r.parent_code === code).length;
export const branchTotal = (code: string, rows: readonly Node[], index?: Map<string, string[]>) => descendants(code, rows, index).length;
