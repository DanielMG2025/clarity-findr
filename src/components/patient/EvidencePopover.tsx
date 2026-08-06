import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Info, ExternalLink, AlertTriangle, FlaskConical } from "lucide-react";
import {
  citation,
  formatValue,
  DENOMINATOR_EXPLAINER,
  type SourceKind,
} from "@/modules/evidence/citations";

const KIND_LABEL: Record<SourceKind, string> = {
  registry: "National registry",
  guideline: "Clinical guideline",
  survey: "Patient survey",
  policy_dataset: "Policy dataset",
};

export function EvidencePopover({
  citationId,
  children,
}: {
  citationId: string;
  children?: React.ReactNode;
}) {
  const c = citation(citationId);
  if (!c) return <>{children}</>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-baseline gap-1 rounded font-semibold text-primary underline decoration-dotted underline-offset-2 hover:bg-primary/5"
          aria-label={`Evidence for: ${c.claim}`}
        >
          {children ?? formatValue(c)}
          <Info className="size-3 shrink-0 translate-y-0.5" aria-hidden />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[26rem] max-w-[92vw] p-0 text-sm">
        <div className="border-b bg-muted/40 px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-2xl font-bold text-primary">{formatValue(c)}</span>
            {c.pending_review && (
              <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-700">
                <FlaskConical className="size-3" /> Pending clinical review
              </Badge>
            )}
          </div>
          <p className="mt-0.5 font-medium leading-snug">{c.claim}</p>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Who this applies to</p>
            <p className="mt-0.5 leading-snug text-foreground/80">{c.cohort}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">How it was measured</p>
            <p className="mt-0.5 leading-snug text-foreground/80">{DENOMINATOR_EXPLAINER[c.denominator]}</p>
          </div>

          <div className="flex gap-2 rounded-md bg-amber-500/10 p-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">What this figure does not tell you</p>
              <p className="mt-0.5 leading-snug text-foreground/80">{c.caveat}</p>
            </div>
          </div>

          <div className="border-t pt-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Source</p>
            <p className="mt-0.5 font-medium leading-snug">{c.source.title}</p>
            <p className="text-xs text-muted-foreground">{c.source.publisher} · {c.source.year} · {KIND_LABEL[c.source.kind]}</p>
            <p className="mt-1 text-xs italic text-muted-foreground">{c.source.scope}</p>
            <p className="mt-1.5 text-xs"><span className="font-medium">Exact location: </span><span className="text-muted-foreground">{c.locator}</span></p>
            {c.source.url && (
              <a href={c.source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                Open the report <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          <p className="border-t pt-2 text-[11px] leading-relaxed text-muted-foreground">
            Population averages, not a personal prognosis. This is informational and does not replace a clinician's assessment.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
