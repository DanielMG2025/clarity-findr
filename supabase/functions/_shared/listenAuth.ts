import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/** Returns a service-role client when the caller is an admin (or the service role itself); otherwise a 401/403 Response. */
export async function requireAdmin(req: Request): Promise<SupabaseClient | Response> {
  const url = Deno.env.get("SUPABASE_URL")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Not signed in" }, 401);
  const admin = createClient(url, service);
  if (token === service) return admin;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return json({ error: "Not signed in" }, 401);
  const { data: ok } = await admin.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  if (!ok) return json({ error: "Admin role required" }, 403);
  return admin;
}
