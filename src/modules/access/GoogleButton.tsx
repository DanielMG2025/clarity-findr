import { useState } from "react";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

/** Google's official light-theme button (brand colours are fixed by Google's guidelines). */
export function GoogleButton() {
  const { language } = useLanguage();
  const es = language === "es";
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function signIn() {
    setBusy(true); setFailed(false);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) setFailed(true);
      if (result.redirected) return;
    } catch { setFailed(true); }
    // On success the session is already set; AccessGate's auth listener lets the person in.
    setBusy(false);
  }
  return (
    <div className="space-y-2">
      <Button type="button" onClick={signIn} disabled={busy}
        className="h-11 w-full gap-[10px] rounded-md border border-[#747775] bg-[#FFFFFF] px-3 text-[14px] font-medium leading-5 text-[#1F1F1F] shadow-none hover:bg-[#F8F9FA] [font-family:'Google_Sans',var(--font-sans,inherit)]">
        <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-[18px] shrink-0"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
        {busy ? (es ? "Un momento…" : "One moment…") : (es ? "Continuar con Google" : "Continue with Google")}
      </Button>
      {failed && <p role="alert" className="text-sm text-destructive">{es ? "No se ha podido entrar con Google. Vuelve a intentarlo o usa tu correo." : "Could not sign in with Google. Try again or use your email."}</p>}
    </div>
  );
}
