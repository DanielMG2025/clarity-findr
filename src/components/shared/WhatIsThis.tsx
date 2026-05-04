import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface WhatIsThisProps {
  title?: string;
  children: React.ReactNode;
  learnMoreHref?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Reusable contextual explainer.
 * Use anywhere a user might wonder "what does this mean / why are you asking this?".
 */
export function WhatIsThis({ title = "What is this?", children, learnMoreHref, className, size = "sm" }: WhatIsThisProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={title}
          className={cn(
            "inline-flex items-center gap-1 rounded-full text-muted-foreground hover:text-primary transition-smooth",
            size === "sm" ? "text-xs" : "text-sm",
            className
          )}
        >
          <HelpCircle className={size === "sm" ? "size-3.5" : "size-4"} />
          <span className="underline decoration-dotted underline-offset-2">{title}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm leading-relaxed" side="top">
        <div className="font-semibold mb-1 text-foreground">{title}</div>
        <div className="text-muted-foreground">{children}</div>
        {learnMoreHref && (
          <a
            href={learnMoreHref}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary font-medium mt-2 inline-block hover:underline"
          >
            Learn more →
          </a>
        )}
      </PopoverContent>
    </Popover>
  );
}
