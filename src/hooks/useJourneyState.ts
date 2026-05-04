import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Persist journey progress (step + form data) in sessionStorage so users can
 * detour to other pages (community, FAQs, "what is this") and resume exactly
 * where they left off — with their data intact.
 *
 * Storage layout:
 *   journey:<key>           -> { step, data, updatedAt, path, label }
 *   journey:active          -> "<key>"  (most recently touched)
 */

const STORAGE_PREFIX = "journey:";
const ACTIVE_KEY = "journey:active";

export interface JourneySnapshot<T> {
  step: number;
  data: T;
  updatedAt: number;
  path: string;
  label: string;
  totalSteps?: number;
}

export interface JourneyMeta {
  /** Stable id, e.g. "explorer", "navigator" */
  key: string;
  /** Route to resume on, e.g. "/explorer" */
  path: string;
  /** Friendly label shown in the resume banner */
  label: string;
  /** Total steps in the journey (for the resume banner) */
  totalSteps?: number;
}

function read<T>(key: string): JourneySnapshot<T> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as JourneySnapshot<T>;
  } catch {
    return null;
  }
}

function write<T>(key: string, snap: JourneySnapshot<T>) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(snap));
    sessionStorage.setItem(ACTIVE_KEY, key);
  } catch {
    /* quota or disabled — fail quietly */
  }
}

export function useJourneyState<T>(meta: JourneyMeta, initialData: T, initialStep = 0) {
  const existing = read<T>(meta.key);
  const [step, setStepState] = useState<number>(existing?.step ?? initialStep);
  const [data, setDataState] = useState<T>(existing?.data ?? initialData);
  const metaRef = useRef(meta);
  metaRef.current = meta;

  // Persist whenever step or data change
  useEffect(() => {
    write<T>(meta.key, {
      step,
      data,
      updatedAt: Date.now(),
      path: metaRef.current.path,
      label: metaRef.current.label,
      totalSteps: metaRef.current.totalSteps,
    });
  }, [step, data, meta.key]);

  const setStep = useCallback((next: number | ((s: number) => number)) => {
    setStepState((prev) => (typeof next === "function" ? (next as (s: number) => number)(prev) : next));
  }, []);

  const setData = useCallback((next: T | ((d: T) => T)) => {
    setDataState((prev) => (typeof next === "function" ? (next as (d: T) => T)(prev) : next));
  }, []);

  const patch = useCallback((partial: Partial<T>) => {
    setDataState((prev) => ({ ...prev, ...partial } as T));
  }, []);

  const reset = useCallback(() => {
    sessionStorage.removeItem(STORAGE_PREFIX + meta.key);
    if (sessionStorage.getItem(ACTIVE_KEY) === meta.key) {
      sessionStorage.removeItem(ACTIVE_KEY);
    }
    setStepState(initialStep);
    setDataState(initialData);
  }, [meta.key, initialStep, initialData]);

  return { step, setStep, data, setData, patch, reset };
}

/** Read the most recently touched journey (for global resume banner). */
export function getActiveJourney(): (JourneySnapshot<unknown> & { key: string }) | null {
  try {
    const key = sessionStorage.getItem(ACTIVE_KEY);
    if (!key) return null;
    const snap = read<unknown>(key);
    if (!snap) return null;
    return { key, ...snap };
  } catch {
    return null;
  }
}

export function clearActiveJourney(key?: string) {
  try {
    if (key) sessionStorage.removeItem(STORAGE_PREFIX + key);
    sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* noop */
  }
}
