// Orchestrator — runs a source through fetch → parse → normalize → validate → store.
//
// Two hard guardrails live here:
//   1. A source with allowlisted = false is NEVER run (throws).
//   2. The default fetcher is INERT: it refuses to touch the network. A real,
//      robots-aware, rate-limited fetcher must be injected explicitly, and only
//      after the source passes legal + human review. This file ships no crawler.

import type { Source } from "../types";
import type { Fetcher, PipelineDeps, PipelineResult } from "./types";

export class SourceNotAllowlistedError extends Error {
  constructor(sourceId: string) {
    super(`Source ${sourceId} is not allowlisted — refusing to crawl. A human must review robots.txt + terms first.`);
    this.name = "SourceNotAllowlistedError";
  }
}

export class FetcherNotImplementedError extends Error {
  constructor() {
    super(
      "No fetcher is implemented. Network fetching is intentionally absent from the cold-start scaffolding; " +
        "inject a reviewed, robots-aware, rate-limited Fetcher per source before running the pipeline.",
    );
    this.name = "FetcherNotImplementedError";
  }
}

/** Default fetcher: does nothing but refuse. Keeps the scaffolding non-operational. */
export const inertFetcher: Fetcher = {
  async fetch(): Promise<never> {
    throw new FetcherNotImplementedError();
  },
};

/**
 * Run the pipeline for one source over a set of paths. Guards on allowlisting
 * before doing anything. Per-path errors are collected, not thrown, so one bad
 * page doesn't abort the run.
 */
export async function runSourcePipeline(
  source: Source,
  paths: string[],
  deps: PipelineDeps,
): Promise<PipelineResult> {
  if (!source.allowlisted) {
    throw new SourceNotAllowlistedError(source.id);
  }

  const result: PipelineResult = {
    source_id: source.id,
    fetched: 0,
    parsed: 0,
    stored: 0,
    skipped: 0,
    errors: [],
  };

  const collected = [];
  for (const path of paths) {
    try {
      const doc = await deps.fetcher.fetch(source, path);
      result.fetched += 1;
      const parsed = deps.parser.parse(source, doc);
      result.parsed += parsed.length;
      for (const p of parsed) {
        const obs = deps.normalizer.normalize(source, p);
        if (!obs) {
          result.skipped += 1;
          continue;
        }
        const check = deps.validator.validate(obs);
        if (!check.ok) {
          result.skipped += 1;
          continue;
        }
        collected.push(obs);
      }
    } catch (err) {
      result.errors.push(`${path}: ${(err as Error).message}`);
    }
  }

  if (collected.length > 0) {
    result.stored = await deps.store.save(collected);
  }
  return result;
}
