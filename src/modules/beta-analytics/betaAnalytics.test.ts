import { describe, expect, it } from "vitest";
import { dropOffs, recentEvents, sessionCount, topLabels, topPages, type BetaEventRow } from "./aggregate";
import { isTrackedPath, sanitizeLabel, sanitizeMeta, sanitizePath } from "./sanitize";

let n = 0;
const ev = (session_id: string, t: string, event_type: string, path: string, label: string | null = null): BetaEventRow =>
  ({ id: String(++n), created_at: `2026-11-02T10:${t}:00Z`, session_id, user_email: null, event_type, path, label });

const rows = [
  ev("s1", "00", "page_view", "/"),
  ev("s1", "01", "page_view", "/situacion"),
  ev("s1", "02", "click", "/situacion", "start_case"),
  ev("s1", "03", "page_view", "/clinicas"),
  ev("s2", "00", "page_view", "/"),
  ev("s2", "05", "page_view", "/descubre"),
  ev("s3", "00", "page_view", "/"),
  ev("s3", "04", "click", "/clinicas", "contact_clinic_blocked"),
  ev("s3", "01", "page_view", "/clinicas"),
];

describe("beta navigation aggregates", () => {
  it("counts sessions", () => expect(sessionCount(rows)).toBe(3));
  it("ranks pages by page views only", () => {
    expect(topPages(rows)).toEqual([
      { key: "/", count: 3 }, { key: "/clinicas", count: 2 }, { key: "/descubre", count: 1 }, { key: "/situacion", count: 1 },
    ]);
  });
  it("ranks clicked elements", () => {
    expect(topLabels(rows)).toEqual([{ key: "contact_clinic_blocked", count: 1 }, { key: "start_case", count: 1 }]);
  });
  it("drop-off is each session's latest path, regardless of row order", () => {
    expect(dropOffs(rows)).toEqual([{ key: "/clinicas", count: 2 }, { key: "/descubre", count: 1 }]);
  });
  it("recent events are newest first", () => {
    expect(recentEvents(rows, 2).map((e) => e.created_at)).toEqual(["2026-11-02T10:05:00Z", "2026-11-02T10:04:00Z"]);
  });
});

describe("beta event privacy guard", () => {
  it("drops query strings and hashes (typed search text)", () => {
    expect(sanitizePath("/descubre?q=my%20diagnosis#conversacion")).toBe("/descubre");
  });
  it("keeps only allow-listed meta keys", () => {
    expect(sanitizeMeta({ module: "Medical context", answer: "AMH 0.4", email: "a@b.c" })).toEqual({ module: "Medical context" });
    expect(sanitizeMeta({ notes: "free text" })).toBeNull();
  });
  it("labels become identifiers", () => {
    expect(sanitizeLabel("Contact Clinic!")).toBe("contact_clinic_");
  });
  it("never tracks widget routes", () => {
    expect(isTrackedPath("/widgets/fiv-madrid")).toBe(false);
    expect(isTrackedPath("/situacion")).toBe(true);
  });
});
