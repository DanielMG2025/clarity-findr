// Pipeline contracts. The stages are wired but the network-touching stage
// (Fetcher) has NO real implementation here — see orchestrator.inertFetcher.
// Each stage is an interface so a real, reviewed fetcher/parser can be injected
// per source once it passes legal + human sign-off.

import type { PriceObservation, Source } from "../types";

/** Raw document fetched from a source URL. */
export interface FetchedDocument {
  url: string;
  contentType: string;
  body: string;
  fetchedAt: string;
}

/** A price parsed out of a document, before normalization. */
export interface ParsedPrice {
  treatmentLabel: string;
  amount: number;
  currency: string;
  marketHint?: string;
  observedAt: string;
}

export interface Fetcher {
  /** MUST honor robots.txt, rate limits and Retry-After. Only public content. */
  fetch(source: Source, path: string): Promise<FetchedDocument>;
}

export interface Parser {
  parse(source: Source, doc: FetchedDocument): ParsedPrice[];
}

export interface Normalizer {
  normalize(source: Source, parsed: ParsedPrice): PriceObservation | null;
}

export interface Validator {
  validate(obs: PriceObservation): { ok: boolean; reason?: string };
}

export interface ObservationStore {
  /** Persist observations (e.g. into price_observations). Returns rows stored. */
  save(observations: PriceObservation[]): Promise<number>;
}

export interface PipelineDeps {
  fetcher: Fetcher;
  parser: Parser;
  normalizer: Normalizer;
  validator: Validator;
  store: ObservationStore;
}

export interface PipelineResult {
  source_id: string;
  fetched: number;
  parsed: number;
  stored: number;
  skipped: number;
  errors: string[];
}
