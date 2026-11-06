import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isEnabled } from "@/config/features";
import { ArrowRight, Mail, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeEmail } from "@/modules/access/policy";
import { InviteKit } from "@/modules/referrals/InviteKit";
import { CODE_PATTERN, DEFAULT_SEATS, inviteLink } from "@/modules/referrals/referrals";

type Info = { owner_label?: string; active: boolean; has_capacity: boolean };
type Phase = "loading" | "closed" | "open" | "done" | "error";

export default function Unirse() {
  const { language } = useLanguage();
  const es = language === "es";
  const [params] = useSearchParams();
  const code = params.get("ref")?.trim() ?? "";
  const [phase, setPhase] = useState<Phase>(code ? "loading" : "closed");
  const [info, setInfo] = useState<Info | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const direct = isEnabled("noEmailBetaJoin");
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [ownCode, setOwnCode] = useState<string | null>(null);

  useEffect(() => {
    if (!code) { setPhase("closed"); return; }
    if (!CODE_PATTERN.test(code)) { setInfo({ active: false, has_capacity: false }); setPhase("closed"); return; }
    let live = true;
    setPhase("loading");
    supabase.functions.invoke("join-via-referral", { body: { action: "info", code } }).then(({ data, error }) => {
      if (!live) return;
      if (error || !data) { setPhase("error"); return; }
      setInfo(data as Info);
      setPhase(data.active && data.has_capacity ? "open" : "closed");
    });
    return () => { live = false; };
  }, [code]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setReason(null);
    try {
      const { data, error } = await supabase.functions.invoke("join-via-referral", { body: direct
        ? { action: "join_direct", code, name: name.trim(), email: normalizeEmail(email), origin: window.location.origin }
        : { action: "join", code, email: normalizeEmail(email), origin: window.location.origin } });
      if (error || !data) { setReason("error"); return; }
      if (!data.ok) { setReason(data.reason ?? "invalid"); if (data.reason === "full" || data.reason === "invalid") setPhase("closed"); return; }
      setOwnCode(typeof data.ownCode === "string" ? data.ownCode : null);
      if (direct && typeof data.token_hash === "string") {
        const { error: otpError } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: "email" });
        if (otpError) { setReason("error"); return; }
        navigate("/", { replace: true });
        return;
      }
      setPhase("done");
    } catch { setReason("error"); }
    finally { setBusy(false); }
  }

  const invalidMsg = es ? "Este enlace de invitación no es válido o ya está completo." : "This invite link is invalid or already full.";
  const reasonMsg: Record<string, string> = {
    paused: es ? "Las invitaciones están en pausa ahora mismo. Vuelve a intentarlo más adelante." : "Invitations are paused right now. Please try again later.",
    limited: es ? "Demasiados intentos con este correo. Espera un rato y vuelve a probar." : "Too many attempts with this email. Please wait a while and try again.",
    error: es ? "No hemos podido completar tu solicitud. Vuelve a intentarlo." : "We could not complete your request. Please try again.",
    invalid: invalidMsg, full: invalidMsg,
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col px-6 py-14 md:py-20">
      <ShieldCheck className="mb-6 size-9 text-primary" aria-hidden="true" />
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">{es ? "Beta privada · por invitación" : "Private beta · by invitation"}</p>

      {phase === "loading" && <p role="status" className="text-muted-foreground">{es ? "Comprobando tu invitación…" : "Checking your invitation…"}</p>}

      {phase === "error" && <div role="alert" className="space-y-4"><h1 className="font-editorial text-3xl">{es ? "Algo no ha ido bien" : "Something went wrong"}</h1><p>{reasonMsg.error}</p><Button variant="outline" onClick={() => window.location.reload()}>{es ? "Volver a intentar" : "Try again"}</Button></div>}

      {phase === "closed" && <div className="space-y-4">
        <h1 className="font-editorial text-3xl leading-tight">{code ? invalidMsg : (es ? "Necesitas un enlace de invitación" : "You need an invite link")}</h1>
        <p className="text-muted-foreground">{code
          ? (es ? "Pide a la persona que te invitó un enlace nuevo." : "Ask the person who invited you for a new link.")
          : (es ? "Fertility Compass está en beta privada. Para unirte, abre el enlace que te ha enviado alguien que ya participa." : "Fertility Compass is in private beta. To join, open the link someone already taking part sent you.")}</p>
      </div>}

      {phase === "open" && info && <>
        <h1 className="font-editorial text-4xl leading-tight">{es ? `Te invita ${info.owner_label}` : `${info.owner_label} is inviting you`}</h1>
        <p className="mt-5 text-muted-foreground">{es
          ? "Fertility Compass es una beta privada de orientación sobre fertilidad: te ayuda a entender tu situación, opciones, costes y normativa. No es consejo médico ni sustituye a tu equipo sanitario."
          : "Fertility Compass is a private fertility orientation beta: it helps you understand your situation, options, costs and rules. It is not medical advice and does not replace your care team."}</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          {direct && <div className="space-y-2"><Label htmlFor="join-name">{es ? "Tu nombre" : "Your name"}</Label><Input id="join-name" autoComplete="name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} /></div>}
          <div className="space-y-2"><Label htmlFor="join-email">{es ? "Tu correo electrónico" : "Your email"}</Label><Input id="join-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <p className="text-xs text-muted-foreground">{direct ? (es
            ? "Entrarás directamente en este navegador, sin esperar ningún correo. Usamos tu nombre y correo solo para identificar tus comentarios en la beta; no los compartimos con nadie. Si pierdes la sesión, vuelve a este enlace con el mismo correo."
            : "You will get in straight away in this browser, without waiting for any email. We only use your name and email to identify your beta feedback; we do not share them. If you lose your session, come back to this link with the same email.") : es
            ? "Dejas tu propio correo para recibir tu acceso. Solo lo usamos para enviarte el enlace de entrada a la beta; no lo compartimos con nadie, tampoco con quien te invita."
            : "You are leaving your own email to get access. We only use it to send you your beta sign-in link; we do not share it with anyone, including the person who invited you."}</p>
          {reason && <p role="alert" className="text-sm text-destructive">{reasonMsg[reason] ?? reasonMsg.error}</p>}
          <Button type="submit" size="lg" disabled={busy} className="w-full">{busy ? (es ? "Un momento…" : "One moment…") : (es ? "Quiero mi acceso" : "Get my access")}<ArrowRight /></Button>
        </form>
      </>}

      {phase === "done" && <div className="space-y-8">
        <div role="status" className="border-y border-primary/30 py-6"><Mail className="mb-3 size-6 text-primary" aria-hidden="true" /><h1 className="font-editorial text-3xl leading-tight">{es ? "Revisa tu correo para tu enlace de acceso." : "Check your email for your access link."}</h1></div>
        {ownCode ? <section aria-labelledby="own-invite" className="space-y-4">
          <h2 id="own-invite" className="flex items-center gap-2 font-editorial text-2xl"><Users className="size-5 text-primary" aria-hidden="true" />{es ? `Ahora invita tú (hasta ${DEFAULT_SEATS})` : `Now invite others (up to ${DEFAULT_SEATS})`}</h2>
          <p className="text-sm text-muted-foreground">{es ? "Comparte este enlace o el código QR con quien creas que le puede ayudar." : "Share this link or QR code with anyone you think it could help."}</p>
          <InviteKit link={inviteLink(window.location.origin, ownCode)} />
        </section> : <p className="text-sm text-muted-foreground">{es ? "Cuando entres, encontrarás tu propio enlace para invitar en tu cuenta." : "Once you are in, you will find your own invite link in your account."}</p>}
      </div>}
    </div>
  );
}
