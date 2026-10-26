import { useState, type FormEvent } from "react";
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitch } from "@/i18n/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeEmail } from "./policy";

export function GatePage({ denied = false, unavailable = false, retry }: { denied?: boolean; unavailable?: boolean; retry?: () => void }) {
  const { language } = useLanguage();
  const es = language === "es";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordMode, setPasswordMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setFailed(false);
    try {
      if (passwordMode) {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
        if (error) setFailed(true);
      } else {
        await supabase.functions.invoke("request-access", { body: { email: normalizeEmail(email), origin: window.location.origin } });
        setSent(true);
      }
    } catch { if (passwordMode) setFailed(true); else setSent(true); }
    finally { setBusy(false); }
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-6 py-4 text-sidebar-foreground">
        <span className="font-editorial text-xl text-sidebar-primary">Fertility Compass</span><LanguageSwitch />
      </header>
      <main className="mx-auto flex max-w-lg flex-col px-6 py-16 md:py-24">
        <ShieldCheck className="mb-6 size-9 text-primary" aria-hidden="true" />
        <p className="mb-3 text-xs uppercase text-muted-foreground">{es ? "Un espacio de confianza" : "A trusted space"}</p>
        <h1 className="font-editorial text-4xl leading-tight">{es ? "Bienvenida a Fertility Compass" : "Welcome to Fertility Compass"}</h1>
        {denied && <p role="alert" className="mt-6 border-l-2 border-primary pl-4 text-sm">{es ? "No tienes acceso o se ha retirado tu autorización. Contacta con quien te invitó." : "You do not have access, or your access was removed. Contact the person who invited you."}</p>}
        {unavailable ? <div className="mt-6 space-y-4"><p role="alert">{es ? "No podemos comprobar tu acceso ahora. Vuelve a intentarlo." : "We cannot check your access right now. Please try again."}</p><Button onClick={retry}>{es ? "Volver a intentar" : "Try again"}</Button><Button variant="ghost" onClick={() => supabase.auth.signOut()}>{es ? "Cerrar sesión" : "Sign out"}</Button></div> : <>
          <p className="mt-5 text-muted-foreground">{es ? "Introduce tu correo para recibir un enlace de acceso." : "Enter your email to get an access link."}</p>
          {sent ? <div role="status" className="mt-8 border-y border-primary/30 py-6"><Mail className="mb-3 size-6 text-primary" /><p>{es ? "Si tu correo está autorizado, recibirás un enlace de acceso." : "If your email is authorized, you'll receive an access link."}</p><Button variant="link" className="mt-3 px-0" onClick={() => setSent(false)}>{es ? "Usar otro correo" : "Use another email"}</Button></div> :
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="space-y-2"><Label htmlFor="access-email">{es ? "Correo electrónico" : "Email"}</Label><Input id="access-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              {passwordMode && <div className="space-y-2"><Label htmlFor="access-password">{es ? "Contraseña" : "Password"}</Label><Input id="access-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>}
              {failed && <p role="alert" className="text-sm text-destructive">{es ? "No se ha podido iniciar sesión. Revisa tus datos." : "Could not sign in. Please check your details."}</p>}
              <Button type="submit" size="lg" disabled={busy} className="w-full">{busy ? (es ? "Un momento…" : "One moment…") : passwordMode ? (es ? "Entrar" : "Sign in") : (es ? "Enviar enlace de acceso" : "Send access link")}<ArrowRight /></Button>
            </form>}
          <Button variant="ghost" className="mt-6 self-start px-0 text-muted-foreground" onClick={() => { setPasswordMode(!passwordMode); setSent(false); setFailed(false); }}><KeyRound />{passwordMode ? (es ? "Entrar con un enlace" : "Use an access link") : (es ? "Administración · Entrar con contraseña" : "Admin · Sign in with password")}</Button>
        </>}
      </main>
    </div>
  );
}