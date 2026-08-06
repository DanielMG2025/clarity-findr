import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type ProvenanceConfidence = "high" | "medium" | "low";

const CONFIDENCE_LABEL: Record<ProvenanceConfidence, string> = {
  high: "high confidence",
  medium: "medium confidence",
  low: "low confidence",
};

/**
 * Small, consistent "source · date · confidence" affordance for any figure that
 * is not an evidence citation (prices, regulatory facts, reported rates).
 * For clinical evidence figures use <EvidencePopover /> instead.
 */
export function SourceChip({
  source,
  date,
  confidence,
  detail,
}: {
  source: string;
  date: string;
  confidence: ProvenanceConfidence;
  detail?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground cursor-help align-middle">
          <Info className="size-2.5 shrink-0" aria-hidden />
          {source} · {date} · {CONFIDENCE_LABEL[confidence]}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {detail ??
          `Figure derived from ${source}, last reviewed ${date}. We show it with ${CONFIDENCE_LABEL[confidence]} because of how complete and recent the underlying data is.`}
      </TooltipContent>
    </Tooltip>
  );
}
