import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";

/** Shareable invite link with copy button and QR code. */
export function InviteKit({ link, size = 148 }: { link: string; size?: number }) {
  const { language } = useLanguage();
  const es = language === "es";
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* the field stays selectable */ }
  }
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="w-fit shrink-0 rounded-md border border-border bg-card p-3 text-card-foreground">
        <QRCodeSVG value={link} size={size} fgColor="currentColor" bgColor="transparent" title={es ? "Código QR de tu enlace de invitación" : "QR code of your invite link"} />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <Input readOnly value={link} aria-label={es ? "Enlace de invitación" : "Invite link"} onFocus={(e) => e.target.select()} className="font-mono text-xs" />
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? <Check /> : <Copy />}{copied ? (es ? "Copiado" : "Copied") : (es ? "Copiar enlace" : "Copy link")}
        </Button>
      </div>
    </div>
  );
}
