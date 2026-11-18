import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { FEATURES } from "@/config/features";
import { isJourneyPath } from "@/modules/journey-v2/paths";
import { GatePage } from "./GatePage";
import { isDefiniteRejection, isOpenPath, takeReturn } from "./policy";
import { legacyToConfirm } from "./authCallback";

type State = "checking" | "out" | "allowed" | "denied" | "error";
const RETRY_MS = [3000, 8000, 20000, 60000];

export function AccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const denied = useRef(false);
  const allowed = useRef(false);
  const sequence = useRef(0);
  const retries = useRef(0);
  const retryTimer = useRef<number | undefined>(undefined);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { language } = useLanguage();

  const check = useCallback(async () => {
    const run = ++sequence.current;
    window.clearTimeout(retryTimer.current);
    // Someone already in is not blanked out by a re-check on navigation or focus.
    if (!allowed.current) setState("checking");
    // A dropped connection is not a "no": keep the local session (and access) and try again shortly.
    const transient = () => {
      if (run !== sequence.current) return;
      if (!allowed.current) setState("error");
      const wait = RETRY_MS[Math.min(retries.current++, RETRY_MS.length - 1)];
      retryTimer.current = window.setTimeout(() => void check(), wait);
    };
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (run !== sequence.current) return;
      if (sessionError && !isDefiniteRejection(sessionError)) return transient();
      if (!session) { allowed.current = false; setState(denied.current ? "denied" : "out"); return; }
      const { data, error } = await supabase.auth.getUser();
      if (run !== sequence.current) return;
      if (!data.user) {
        if (error && !isDefiniteRejection(error)) return transient();
        allowed.current = false; setState(denied.current ? "denied" : "out"); return;
      }
      const { data: hasAccess, error: accessError } = await supabase.rpc("current_user_has_access");
      if (run !== sequence.current) return;
      if (accessError) return transient();
      retries.current = 0;
      if (hasAccess) {
        denied.current = false; allowed.current = true; setState("allowed");
        const back = takeReturn();
        if (back && back !== window.location.pathname + window.location.search) navigate(back, { replace: true });
      } else {
        denied.current = true; allowed.current = false; setState("denied"); qc.clear();
        await supabase.auth.signOut();
      }
    } catch { transient(); }
  }, [qc, navigate]);

  useEffect(() => {
    let disposed = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { sequence.current++; allowed.current = false; qc.clear(); setState(denied.current ? "denied" : "out"); }
      else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        // Auth operations must run outside the auth callback to avoid a client-lock deadlock.
        setTimeout(() => { if (!disposed) void check(); }, 0);
      }
    });
    // Links made before /auth/confirmar existed carry ?access_token_hash=; send them there to verify on tap.
    const legacy = legacyToConfirm(window.location.search);
    if (legacy) navigate(legacy, { replace: true });
    else void check();
    const focus = () => void check();
    const online = () => void check();
    window.addEventListener("focus", focus);
    window.addEventListener("online", online);
    return () => {
      disposed = true; sequence.current++; window.clearTimeout(retryTimer.current); sub.subscription.unsubscribe();
      window.removeEventListener("focus", focus); window.removeEventListener("online", online);
    };
  }, [check, navigate, qc]);
  useEffect(() => { void check(); }, [pathname, check]);

  // Open without access: the invite page, the sign-in link page, and (journey v2) the whole patient journey.
  if (isOpenPath(pathname) || (FEATURES.recorridoV2 && isJourneyPath(pathname))) return <>{children}</>;
  if (state === "checking") return <div role="status" className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">{language === "es" ? "Comprobando acceso…" : "Checking access…"}</div>;
  if (state !== "allowed") return <GatePage denied={state === "denied"} unavailable={state === "error"} retry={() => void check()} />;
  return <>{children}</>;
}
