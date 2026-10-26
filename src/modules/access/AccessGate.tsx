import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { GatePage } from "./GatePage";

type State = "checking" | "out" | "allowed" | "denied" | "error";
export function AccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const denied = useRef(false);
  const sequence = useRef(0);
  const qc = useQueryClient();
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const check = useCallback(async () => {
    const run = ++sequence.current;
    setState("checking");
    try {
      const { data, error } = await supabase.auth.getUser();
      if (run !== sequence.current) return;
      if (error || !data.user) { setState(denied.current ? "denied" : "out"); return; }
      const { data: allowed, error: accessError } = await supabase.rpc("current_user_has_access");
      if (run !== sequence.current) return;
      if (accessError) { setState("error"); return; }
      if (allowed) { denied.current = false; setState("allowed"); }
      else {
        denied.current = true; setState("denied"); qc.clear();
        await supabase.auth.signOut();
      }
    } catch { if (run === sequence.current) setState("error"); }
  }, [qc]);
  useEffect(() => {
    let disposed = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") { sequence.current++; qc.clear(); setState(denied.current ? "denied" : "out"); }
      else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        // Auth operations must run outside the auth callback to avoid a client-lock deadlock.
        setTimeout(() => { if (!disposed) void check(); }, 0);
      }
    });
    async function start() {
      const url = new URL(window.location.href);
      const hash = url.searchParams.get("access_token_hash");
      if (hash) {
        url.searchParams.delete("access_token_hash");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
        const { error } = await supabase.auth.verifyOtp({ token_hash: hash, type: "magiclink" });
        if (error && !disposed) { setState("out"); return; }
      }
      if (!disposed) await check();
    }
    void start();
    const focus = () => void check();
    window.addEventListener("focus", focus);
    return () => { disposed = true; sequence.current++; sub.subscription.unsubscribe(); window.removeEventListener("focus", focus); };
  }, [check]);
  useEffect(() => { void check(); }, [pathname, check]);
  if (state === "checking") return <div role="status" className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">{language === "es" ? "Comprobando acceso…" : "Checking access…"}</div>;
  if (state !== "allowed") return <GatePage denied={state === "denied"} unavailable={state === "error"} retry={() => void check()} />;
  return <>{children}</>;
}