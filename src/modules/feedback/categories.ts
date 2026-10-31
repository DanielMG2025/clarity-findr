import type { Language } from "@/i18n/translate";

export const FEEDBACK_CATEGORIES = ["improve", "missing", "excess", "broken", "idea"] as const;
export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export const FEEDBACK_STATUSES = ["new", "reviewed", "actioned"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const CATEGORY_LABEL: Record<FeedbackCategory, Record<Language, string>> = {
  improve: { es: "Mejoraría", en: "Improve" },
  missing: { es: "Falta", en: "Missing" },
  excess: { es: "Sobra", en: "Too much" },
  broken: { es: "No funciona", en: "Broken" },
  idea: { es: "Idea", en: "Idea" },
};

export const STATUS_LABEL: Record<FeedbackStatus, Record<Language, string>> = {
  new: { es: "Nuevo", en: "New" },
  reviewed: { es: "Revisado", en: "Reviewed" },
  actioned: { es: "Resuelto", en: "Actioned" },
};

export interface FeedbackLike {
  category: string | null;
  status: string;
  user_email: string;
  message: string;
}

export interface FeedbackFilters {
  category: FeedbackCategory | "all";
  status: FeedbackStatus | "all";
  email: string | "all";
  query: string;
}

const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function filterFeedback<T extends FeedbackLike>(rows: T[], f: FeedbackFilters): T[] {
  const q = fold(f.query.trim());
  return rows.filter((r) =>
    (f.category === "all" || r.category === f.category) &&
    (f.status === "all" || r.status === f.status) &&
    (f.email === "all" || r.user_email === f.email) &&
    (!q || fold(r.message).includes(q)));
}

export function countByCategory(rows: FeedbackLike[]): Record<FeedbackCategory, number> {
  const counts = { improve: 0, missing: 0, excess: 0, broken: 0, idea: 0 };
  for (const r of rows) if (r.category && r.category in counts) counts[r.category as FeedbackCategory]++;
  return counts;
}

/** The widget is shown on every gated page except chromeless embeds. */
export const showsFeedbackLauncher = (pathname: string) => !pathname.startsWith("/widgets/");
