import type { ReactNode } from "react";
import { Compass } from "lucide-react";
import { BetaBanner } from "@/components/beta/BetaBanner";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { SessionChip } from "@/components/nav/SessionChip";
import { useL } from "./ui";

/** Journey v2 landing chrome: beta ribbon, a thin bar and a minimal footer (legal + contact). */
export function MinimalLayout({ children }: { children: ReactNode }) {
  const { es } = useL();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BetaBanner />
      <header className="no-print flex h-10 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground">
        <span className="inline-flex items-center gap-2 font-display text-sm tracking-[0.08em] text-sidebar-primary">
          <Compass aria-hidden className="size-4" /> Fertility Compass
        </span>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3"><SessionChip /><LanguageSwitch /></div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-border/70 px-6 py-5 text-xs leading-relaxed text-muted-foreground" data-testid="minimal-footer">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-[70ch]">
            <strong className="font-semibold text-foreground">{es ? "Aviso legal" : "Legal notice"}</strong> ·{" "}
            {es
              ? "Fertility Compass ofrece orientación basada en datos públicos y en lo que eliges compartir. No sustituye una consulta médica. Los precios son estimaciones."
              : "Fertility Compass provides orientation based on public data and on what you choose to share. It does not replace a medical consultation. Prices are estimates."}
          </p>
          <p className="shrink-0"><strong className="font-semibold text-foreground">{es ? "Contacto" : "Contact"}</strong> · {es ? "en preparación" : "in preparation"}</p>
        </div>
        <p className="mx-auto mt-2 max-w-5xl">© {new Date().getFullYear()} Fertility Compass</p>
      </footer>
    </div>
  );
}
