import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { decodeReturn, RETURN_KEY, takeReturn } from "./policy";
import { readCallback } from "./authCallback";

type View = "ready" | "busy" | "in" | "failed" | "expired" | "invalid";

function peekReturn(): string {
  try { return decodeReturn(localStorage.getItem(RETURN_KEY), Date.now()) ?? "/"; } catch { return "/"; }
}

function isExpired(error: { status?: number; code?: string; message?: string }): boolean {
  return error.code === "otp_expired" || error.status === 403 || /expired|invalid/i.test(error.message ?? "");
}

/**
 * /auth/confirmar — where sign-in links land. With a token in the address it
 * waits for a tap before verifying (a scanner that pre-opens links cannot spend
 * it); after the auth server's own redirect it confirms the session or explains
 * why the link no longer works. Then it goes back to where the person was.
 */
export function AuthConfirm() {
  const { language } = useLanguage();
  const es = language === "es";
  const navigate = useNavigate();
  const params = useMemo(() => readCallback(window.location.search, window.location.hash), []);
  const [view, setView] = useState<View>(params.kind === "token" ? "ready" : params.kind === "error" ? "expired" : "busy");

  useEffect(() => {
    if (params.kind !== "session" && params.kind !== "none") return;
    let alive = true;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return;
      setView(session ? "in" : params.kind === "session" ? "failed" : "invalid");
    });
    return () => { alive = false; };
  }, [params.kind]);

  const goBack = () => navigate(takeReturn() ?? peekReturn(), { replace: true });

  const verify = async () => {
    if (params.kind !== "token") return;
    setView("busy");
    const { error } = await supabase.auth.verifyOtp({ token_hash: params.tokenHash, type: params.type });
    if (error) { setView(isExpired(error) ? "expired" : "failed"); return; }
    // Drop the token from the address so a reload cannot reuse it.
    window.history.replaceState(window.history.state, "", window.location.pathname);
    goBack();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-6 py-4 text-sidebar-foreground">
        <span className="font-editorial text-xl text-sidebar-primary">Fertility Compass</span><LanguageSwitch />
      </header>
      <main className="mx-auto flex max-w-md flex-col px-6 py-16" data-testid="auth-confirm">
        {view === "ready" && (
          <>
            <h1 className="font-display text-4xl leading-tight">{es ? "Pulsa para entrar" : "Tap to sign in"}</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {es ? "Tu enlace está listo. La entrada se hace solo al pulsar el botón, aquí, en este navegador." : "Your link is ready. Signing in happens only when you tap the button, here in this browser."}
            </p>
            <Button className="mt-8 w-full" size="lg" onClick={() => void verify()} data-testid="auth-confirm-enter">
              {es ? "Pulsa para entrar" : "Tap to sign in"}
            </Button>
          </>
        )}
        {view === "busy" && <p role="status" className="font-editorial text-lg italic">{es ? "Comprobando acceso…" : "Checking access…"}</p>}
        {view === "in" && (
          <>
            <h1 className="font-display text-4xl leading-tight">{es ? "Ya has entrado" : "You're in"}</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {es ? "La próxima vez que abras Fertility Compass en este navegador ya tendrás la sesión iniciada." : "Next time you open Fertility Compass in this browser, you'll already be signed in."}
            </p>
            <Button className="mt-8 w-full" size="lg" onClick={goBack}>{es ? "Continuar" : "Continue"}</Button>
          </>
        )}
        {(view === "expired" || view === "failed" || view === "invalid") && (
          <>
            <h1 className="font-display text-3xl leading-tight">
              {view === "expired"
                ? (es ? "Este enlace ya se ha usado o ha caducado" : "This link has already been used or has expired")
                : (es ? "No hemos podido iniciar la sesión con este enlace" : "We couldn't sign you in with this link")}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground" data-testid="auth-confirm-why">
              {view === "expired"
                ? (es ? "Cada enlace sirve una vez y durante un tiempo limitado. Algunos programas de correo abren los enlaces por adelantado para revisarlos, y eso puede gastarlos. Pide uno nuevo o entra con Google." : "Each link works once and for a limited time. Some email apps open links in advance to check them, which can use them up. Ask for a new one, or continue with Google.")
                : (es ? "Pide un enlace nuevo y ábrelo en el mismo navegador donde lo pediste, o entra con Google." : "Ask for a new link and open it in the same browser where you requested it, or continue with Google.")}
            </p>
            <Button asChild className="mt-8 w-full" size="lg"><Link to="/cuenta">{es ? "Pedir un enlace nuevo" : "Ask for a new link"}</Link></Button>
          </>
        )}
      </main>
    </div>
  );
}
