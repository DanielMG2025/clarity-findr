import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { accessBody, clients, neutral, reply, sendAccessLink } from "../_shared/access.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(neutral);
  try {
    const parsed = accessBody.safeParse(await req.json());
    if (!parsed.success) return reply(neutral);
    const { email, origin } = parsed.data;
    await sendAccessLink(clients(), email, origin);
  } catch { console.error("Access request unavailable"); }
  // Never expose membership, delivery errors, or credentials to a public caller.
  return reply(neutral);
});
