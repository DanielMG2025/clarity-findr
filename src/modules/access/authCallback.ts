// The sign-in link's landing page (/auth/confirmar), as pure helpers.
//  - ?token_hash=…&type=…  nothing is spent yet: we verify only when the person
//    taps "Pulsa para entrar", so a mail scanner that pre-opens links cannot use it up.
//  - #access_token=… / #error_code=…  the auth server already verified the link
//    (default email template) and redirected here.
import type { EmailOtpType } from "@supabase/supabase-js";

const OTP_TYPES: readonly EmailOtpType[] = ["magiclink", "signup", "email", "invite", "email_change"];

export type CallbackParams =
  | { kind: "token"; tokenHash: string; type: EmailOtpType }
  | { kind: "error"; code: string }
  | { kind: "session" }
  | { kind: "none" };

export function readCallback(search: string, hash: string): CallbackParams {
  const q = new URLSearchParams(search);
  const h = new URLSearchParams(hash.replace(/^#/, ""));
  const tokenHash = q.get("token_hash");
  if (tokenHash) {
    const raw = q.get("type") as EmailOtpType | null;
    return { kind: "token", tokenHash, type: raw && OTP_TYPES.includes(raw) ? raw : "email" };
  }
  const code = h.get("error_code") ?? q.get("error_code") ?? (h.get("error") || q.get("error"));
  if (code) return { kind: "error", code };
  if (h.get("access_token")) return { kind: "session" };
  return { kind: "none" };
}

/** A legacy admin link (`?access_token_hash=`) becomes a tap-to-enter link instead of verifying on load. */
export function legacyToConfirm(search: string): string | null {
  const hash = new URLSearchParams(search).get("access_token_hash");
  return hash ? `/auth/confirmar?token_hash=${encodeURIComponent(hash)}&type=email` : null;
}
