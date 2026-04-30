import { ExternalLink, FileText, Calculator, BarChart3 } from "lucide-react";
import type { MatchResult } from "@/lib/engines/types";

const SOURCE_LABEL: Record<MatchResult["price_source"], { label: string; tag: string }> = {
  scraped: { label: "real data", tag: "from clinic website" },
  crowd: { label: "real data", tag: "community-submitted quotes" },
  listed: { label: "estimated", tag: "from clinic price list" },
};

export const PricingBreakdown = ({ m }: { m: MatchResult }) => {
  const src = SOURCE_LABEL[m.price_source];
  const country = m.clinic.country;
  const delta = m.vs_country_avg_pct;
  return (
    <div className="rounded-xl border border-border bg-card p-4 mb-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/80 mb-3">
        Pricing explanation
      </div>
      <div className="grid sm:grid-cols-3 gap-2.5 text-sm">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/80 mb-1">
            <FileText className="size-3.5" /> Price from clinic website
          </div>
          <div className="text-lg font-bold tabular-nums">€{m.listed_price.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {m.price_source === "scraped" ? "Scraped" : "Public price list"}
            {m.scraped_source_url && (
              <a
                href={m.scraped_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-0.5 text-accent hover:underline"
              >
                source <ExternalLink className="size-2.5" />
              </a>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-primary-soft/60 p-3 border border-primary/20">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-1">
            <Calculator className="size-3.5" /> Estimated total cost
          </div>
          <div className="text-lg font-bold tabular-nums text-primary">
            €{m.estimated_price.toLocaleString()}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            Base + meds + extras · {src.label} ({src.tag})
          </div>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/80 mb-1">
            <BarChart3 className="size-3.5" /> Market comparison
          </div>
          {delta === null ? (
            <div className="text-xs text-muted-foreground">No country-average data yet.</div>
          ) : (
            <>
              <div className={`text-lg font-bold tabular-nums ${delta < -2 ? "text-accent" : delta > 2 ? "text-warning" : "text-foreground"}`}>
                {delta > 0 ? "+" : ""}
                {delta}%
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {delta < -2
                  ? `Below average in ${country}`
                  : delta > 2
                    ? `Above average in ${country}`
                    : `In line with ${country} average`}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
