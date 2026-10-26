import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

export const accessBody = z.object({ email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()), origin: z.string().optional() });
export const neutral = { message: "If your email is authorized, you'll receive an access link." };
export const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
export function clients() {
  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !service || !anon) throw new Error("Auth configuration unavailable");
  return { admin: createClient(url, service), sender: createClient(url, anon) };
}
export function accessOrigin(candidate?: string) {
  const fallback = "https://clarity-findr.lovable.app";
  if (!candidate) return fallback;
  try {
    const u = new URL(candidate);
    const preview = /^id-preview(?:[^.]*)--4fda3506-d608-461c-b6cf-e4e0499d7c41(?:\.[a-z0-9-]+)?\.lovable\.app$/.test(u.hostname);
    return (u.origin === fallback || u.origin === "http://localhost:8080" || (u.protocol === "https:" && preview)) ? u.origin : fallback;
  } catch { return fallback; }
}