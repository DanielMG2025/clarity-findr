import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { MIN_MENTIONS, CURRENT_DAYS, neutralTitle, parseFeed, safeUrl, supportedTopics, marketFields } from "../_shared/rssSignals.ts";
Deno.test("RSS intake never stores usernames or personal narratives", () => {
  const xml = '<rss><channel><item><title>Respuesta a: IVF with Alice aged 42 in Madrid</title><link>https://example.org/thread/#post-1</link><pubDate>Thu, 29 Oct 2026 10:00:00 GMT</pubDate><author>Alice42</author><description>I am Alice42 and this is my private story.</description></item></channel></rss>';
  const rows = parseFeed(xml, "es");
  assertEquals(rows[0].title, "Planificación del tratamiento de reproducción asistida");
  assertEquals(JSON.stringify(rows).includes("Alice"), false);
  assertEquals(JSON.stringify(rows).includes("private story"), false);
  assertEquals(neutralTitle("Reply To: sperm question", "en"), "Sperm health and male fertility");
});
Deno.test("Topics require 2 valid supporting items from one source and language", () => {
  assertEquals(MIN_MENTIONS, 2);
  const signals = [{ id: "a", source_name: "A", lang: "es" }, { id: "b", source_name: "A", lang: "es" }, { id: "c", source_name: "B", lang: "en" }];
  const topic = (signal_ids: string[]) => ({ signal_ids, source_forum: "A", source_lang: "es" });
  assertEquals(supportedTopics([topic(["a"])], signals).length, 0);
  assertEquals(supportedTopics([topic(["a", "a"])], signals).length, 0);
  assertEquals(supportedTopics([topic(["a", "c"])], signals).length, 0);
  assertEquals(supportedTopics([topic(["a", "b"]), topic(["a", "b"])], signals).length, 1);
});
Deno.test("Weekly freshness is limited to 7 days, not fetch date", () => assertEquals(CURRENT_DAYS, 7));
Deno.test("Feed URLs reject private addresses and non HTTPS", () => {
  assertEquals(safeUrl("http://example.org/feed"), null);
  assertEquals(safeUrl("https://127.0.0.1/feed"), null);
  assertEquals(safeUrl("https://example.org/feed"), "https://example.org/feed");
});
Deno.test("Structured market fields do not invent dollar currency or country", () => {
  assertEquals(marketFields("IVF costs $4000").prices[0], { amount: 4000, currency: "unspecified dollar", country: null });
  assertEquals(marketFields("FIV 2500 EUR in Spain").prices[0], { amount: 2500, currency: "EUR", country: "Spain" });
});
