import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { clients, reply } from "../_shared/access.ts";
import { decideRevoke, findUserByEmail, manageAdminsBody } from "./logic.ts";

// Admin-only management of the `admin` role. Runs with the service role; the
// caller's identity and role are verified here on every request.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const { admin } = clients();
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return reply({ error: "Not signed in" }, 401);
    const { data: identity, error: authError } = await admin.auth.getUser(token);
    if (authError || !identity.user) return reply({ error: "Not signed in" }, 401);
    const callerId = identity.user.id;
    const { data: isAdmin, error: roleError } = await admin.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (roleError || !isAdmin) return reply({ error: "Admin role required" }, 403);

    let raw: unknown;
    try { raw = await req.json(); } catch { return reply({ error: "Invalid JSON" }, 400); }
    const parsed = manageAdminsBody.safeParse(raw);
    if (!parsed.success) return reply({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400);
    const body = parsed.data;

    const adminRows = async () => {
      const { data, error } = await admin.from("user_roles").select("user_id").eq("role", "admin");
      if (error) throw error;
      return (data ?? []).map((r) => r.user_id as string);
    };

    if (body.action === "list") {
      const ids = await adminRows();
      const admins = await Promise.all(ids.map(async (id) => {
        const { data } = await admin.auth.admin.getUserById(id);
        return { user_id: id, email: data.user?.email ?? null, created_at: data.user?.created_at ?? null };
      }));
      admins.sort((a, b) => (a.created_at ?? "").localeCompare(b.created_at ?? ""));
      return reply({ status: "ok", admins, self_id: callerId });
    }

    if (body.action === "grant") {
      let user: { id: string; email?: string | null } | undefined;
      for (let page = 1; page <= 50 && !user; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        user = findUserByEmail(data.users, body.email);
        if (data.users.length < 1000) break;
      }
      if (!user) return reply({ status: "no_account", email: body.email });
      const ids = await adminRows();
      if (ids.includes(user.id)) return reply({ status: "already_admin", email: body.email });
      const { error: accessError } = await admin.from("allowed_users").upsert({ email: body.email, active: true }, { onConflict: "email" });
      if (accessError) throw accessError;
      const { error: roleInsertError } = await admin.from("user_roles")
        .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });
      if (roleInsertError) throw roleInsertError;
      return reply({ status: "granted", email: body.email });
    }

    // revoke
    const decision = decideRevoke({ adminIds: await adminRows(), targetId: body.user_id, callerId, confirmSelf: body.confirm_self });
    if (decision !== "revoke") return reply({ status: decision });
    const { error: deleteError } = await admin.from("user_roles").delete().eq("user_id", body.user_id).eq("role", "admin");
    if (deleteError) throw deleteError;
    // Guard against two simultaneous revokes leaving nobody in charge.
    if ((await adminRows()).length === 0) {
      await admin.from("user_roles").insert({ user_id: body.user_id, role: "admin" });
      return reply({ status: "last_admin" });
    }
    return reply({ status: "revoked" });
  } catch (e) {
    console.error("manage-admins failed", e instanceof Error ? e.message : "unknown");
    return reply({ error: "Could not complete the request" }, 503);
  }
});
