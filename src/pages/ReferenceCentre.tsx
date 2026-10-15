import { useMemo, useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/patient/PageHeader";
import {
  CATEGORY_LABEL,
  REFERENCE_LIBRARY,
  SCOPE_LABEL,
  type RefCategory,
  type RefScope,
  type ReferenceEntry,
} from "@/modules/evidence/referenceLibrary";

const SCOPES: Array<RefScope | "all"> = ["all", "ES", "EU", "UK", "US", "World"];

const SCOPE_FILTER_LABEL: Record<(typeof SCOPES)[number], string> = {
  all: "All",
  ES: "Spain",
  EU: "Europe",
  UK: "United Kingdom",
  US: "US",
  World: "Worldwide",
};

const CATEGORY_ORDER: RefCategory[] = ["outcomes", "legal", "guidelines", "terminology", "context", "costs"];

function EntryCard({ entry }: { entry: ReferenceEntry }) {
  return (
    <Card className="space-y-4 rounded-none border-0 border-t border-border/70 bg-transparent px-0 pb-2 pt-6 shadow-none">
      <div className="space-y-2">
        <h3 className="font-display text-xl font-medium leading-snug">{entry.title}</h3>
        <p className="text-xs text-muted-foreground">
          {entry.publisher} · {entry.year}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-primary-soft text-primary">
            {SCOPE_LABEL[entry.scope]}
          </Badge>
          {entry.status === "pending" && (
            <Badge variant="outline" className="border-warning/30 bg-warning/15 text-warning-foreground">
              Pending verification
            </Badge>
          )}
          {entry.status === "verified" && (
            <Badge variant="outline" className="border-border bg-muted/40 text-muted-foreground">
              <ShieldCheck className="size-3" /> Verified
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-[65ch] space-y-4 text-sm leading-7">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">What it is</div>
          <p className="mt-1 text-foreground/90">{entry.what_it_is}</p>
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Key figure</div>
          <p className="mt-1 font-display text-base font-medium leading-7 text-foreground/90">{entry.key_datum}</p>
        </div>
        <div className="rounded-none border-y border-warning/30 bg-warning/10 px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warning-foreground/90">
            What it doesn't tell you
          </div>
          <p className="mt-1 text-xs leading-relaxed text-warning-foreground/90">{entry.limitation}</p>
        </div>
      </div>

      {entry.url && (
        <a
          href={entry.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline decoration-border underline-offset-2 hover:text-primary"
        >
          Open the source <ExternalLink className="size-3" />
        </a>
      )}
    </Card>
  );
}

export default function ReferenceCentre() {
  const [scope, setScope] = useState<RefScope | "all">("all");

  const filtered = useMemo(
    () => (scope === "all" ? REFERENCE_LIBRARY : REFERENCE_LIBRARY.filter((entry) => entry.scope === scope)),
    [scope],
  );

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        entries: filtered.filter((entry) => entry.category === category),
      })).filter((group) => group.entries.length > 0),
    [filtered],
  );

  return (
    <div className="container max-w-5xl space-y-8 py-10">
      <PageHeader
        eyebrow="Reference library"
        title="The sources behind everything here"
        subtitle={`A curated, growing library of the public references we rely on — each one pre-digested so you don't have to hunt for it. ${REFERENCE_LIBRARY.length} references and growing.`}
      />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by scope">
        {SCOPES.map((option) => {
          const active = scope === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setScope(option)}
              aria-pressed={active}
              className={
                active
                  ? "inline-flex items-center rounded-full border border-primary/30 bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary"
                  : "inline-flex items-center rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }
            >
              {SCOPE_FILTER_LABEL[option]}
            </button>
          );
        })}
      </div>

      <div className="space-y-14">
        {grouped.map(({ category, entries }) => (
          <section key={category} className="space-y-6">
            <div className="border-b border-accent/40 pb-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {CATEGORY_LABEL[category]}
                <span className="ml-2 text-border">·</span>
                <span className="ml-2 font-normal">{entries.length}</span>
              </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
