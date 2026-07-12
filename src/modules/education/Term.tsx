// Term & AutoGlossary — ubiquitous explainability UI
// ---------------------------------------------------------------------------
// <Term>        : wraps a concept → clickable, shows a light popover with the
//                 20-second definition + "Learn more" that opens the full guide.
// <AutoGlossary>: wraps any text/children → auto-detects glossary terms and
//                 makes them <Term>s. Disable per zone with `disabled` or by
//                 wrapping in <NoGlossary>.
//
// Depends on shadcn primitives already in the repo (popover). The "Learn more"
// action calls an injected handler so this stays routing-agnostic.

import React, { createContext, useContext } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { articleForTerm, findTerms, type Match } from "./glossaryIndex";
import type { Article } from "./contentLibrary";

// --- context: how to open the full guide + global on/off -------------------
interface GlossaryCtx {
  openGuide?: (slug: string) => void; // e.g. navigate(`/learn/${slug}`)
  enabled: boolean;
}
const Ctx = createContext<GlossaryCtx>({ enabled: true });

export function GlossaryProvider({
  openGuide,
  enabled = true,
  children,
}: {
  openGuide?: (slug: string) => void;
  enabled?: boolean;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ openGuide, enabled }}>{children}</Ctx.Provider>;
}

/** Disable auto-glossary for a subtree (titles, inputs, delicate zones). */
const NoCtx = createContext(false);
export function NoGlossary({ children }: { children: React.ReactNode }) {
  return <NoCtx.Provider value={true}>{children}</NoCtx.Provider>;
}

// --- single term -----------------------------------------------------------
export function Term({
  children,
  term,
}: {
  children: React.ReactNode;
  /** explicit term to resolve; defaults to the visible text */
  term?: string;
}) {
  const { openGuide, enabled } = useContext(Ctx);
  const label = term ?? (typeof children === "string" ? children : "");
  const article = enabled ? articleForTerm(label) : undefined;

  if (!article) return <>{children}</>;
  return <TermPopover article={article} openGuide={openGuide}>{children}</TermPopover>;
}

function TermPopover({
  article,
  openGuide,
  children,
}: {
  article: Article;
  openGuide?: (slug: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="underline decoration-dotted underline-offset-2 cursor-help text-inherit font-medium"
          aria-label={`What is: ${article.title}`}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">
        <div className="font-semibold mb-1">{article.title}</div>
        <p className="text-muted-foreground mb-2">{article.hook}</p>
        <p className="mb-3">{article.summary}</p>
        {openGuide && (
          <button
            type="button"
            onClick={() => openGuide(article.slug)}
            className="text-primary font-medium hover:underline"
          >
            Learn more →
          </button>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">{article.disclaimer}</p>
      </PopoverContent>
    </Popover>
  );
}

// --- automatic detection over text -----------------------------------------
/**
 * Wraps plain text (or children whose text nodes are strings) and turns any
 * detected glossary term into a <Term>. Set `disabled` to skip a zone.
 */
export function AutoGlossary({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { enabled } = useContext(Ctx);
  const noZone = useContext(NoCtx);
  if (!enabled || disabled || noZone) return <>{children}</>;

  return <>{React.Children.map(children, (c) => decorate(c))}</>;
}

function decorate(node: React.ReactNode): React.ReactNode {
  if (typeof node === "string") return splitAndWrap(node);
  return node; // only decorate raw string nodes; leave elements untouched
}

function splitAndWrap(text: string): React.ReactNode {
  const matches: Match[] = findTerms(text);
  if (!matches.length) return text;
  const out: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.start > cursor) out.push(text.slice(cursor, m.start));
    out.push(
      <Term key={`t-${i}-${m.start}`} term={m.entry.aliases[0]}>
        {m.text}
      </Term>,
    );
    cursor = m.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}
