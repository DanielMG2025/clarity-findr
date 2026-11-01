import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { InviteKit } from "./InviteKit";
import { inviteLink, seatsLeft } from "./referrals";

/** "Invite a friend" card for the signed-in tester; hidden when they have no code. */
export function InvitePanel() {
  const { language } = useLanguage();
  const es = language === "es";
  const mine = useQuery({
    queryKey: ["my-referral-code"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_referral_code");
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
  const row = mine.data;
  if (!row || !row.active) return null;
  const left = seatsLeft(row);
  const full = left !== null && left <= 0;
  return (
    <Card className="p-5">
      <h3 className="mb-1 flex items-center gap-2 font-semibold"><Users className="size-4 text-primary" aria-hidden="true" />{es ? "Invita a una amiga" : "Invite a friend"}</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {left === null ? (es ? "Invitaciones sin límite." : "Unlimited invitations.")
          : es ? `Quedan ${left} de ${row.seats_cap} invitaciones.` : `${left} of ${row.seats_cap} invitations left.`}
      </p>
      {full ? <p className="text-sm">{es ? "Ya has usado todas tus invitaciones. ¡Gracias por compartir!" : "You have used all your invitations. Thank you for sharing!"}</p>
        : <InviteKit link={inviteLink(window.location.origin, row.code)} size={128} />}
    </Card>
  );
}
