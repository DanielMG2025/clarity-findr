import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Chromeless layout for embeddable widgets.
 * No sidebar, no header. Posts iframe height to parent via postMessage.
 * Co-branding via ?partner=<slug>&color=<hex>.
 */
export function WidgetLayout({ children }: { children: ReactNode }) {
  const [params] = useSearchParams();
  const partner = params.get("partner");
  const accent = params.get("color");

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={accent ? ({ ["--primary" as string]: accent } as React.CSSProperties) : undefined}
    >
      {partner && (
        <div className="border-b bg-muted/40">
          <div className="container py-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Powered by <b className="text-foreground">Fertility Compass</b> · for{" "}
              <span className="capitalize text-foreground">{partner.replace(/-/g, " ")}</span>
            </span>
            <a
              href="https://clarity-findr.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              fertilitycompass.com
            </a>
          </div>
        </div>
      )}
      <main className="container max-w-4xl py-6">{children}</main>
      <footer className="container max-w-4xl pb-6 text-[11px] text-muted-foreground">
        Información orientativa, no consejo médico. Los precios son estimaciones; el coste real puede variar
        según clínica y caso. Consulta a un profesional sanitario antes de tomar decisiones.
      </footer>
    </div>
  );
}
