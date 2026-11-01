import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Plus, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAdminSession } from "./PillsTab";
import { normalizeEmail } from "@/modules/access/policy";
import { InviteKit } from "@/modules/referrals/InviteKit";
import { branchTotal, childrenIndex, descendants, directJoins, inviteLink, mintReferralCode, REFERRAL_TYPES, type ReferralType } from "@/modules/referrals/referrals";
import type { Database } from "@/integrations/supabase/types";

type Code = Database["public"]["Tables"]["referral_codes"]["Row"];
const TYPE_LABEL: Record<ReferralType, { es: string; en: string }> = {
  tester: { es: "Tester", en: "Tester" }, ambassador: { es: "Embajadora", en: "Ambassador" },
  association: { es: "Asociación", en: "Association" }, partner: { es: "Socio", en: "Partner" },
};

export default function InvitesTab() {
  const { language } = useLanguage();
  const es = language === "es";
  const { isAdmin, userId, checking } = useAdminSession();
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [type, setType] = useState<ReferralType>("association");
  const [cap, setCap] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [note, setNote] = useState("");
  const [shown, setShown] = useState<Code | null>(null);
  const [branch, setBranch] = useState<Code | null>(null);

  const codes = useQuery({
    queryKey: ["referral-codes", userId], enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("referral_codes").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  const settings = useQuery({
    queryKey: ["referral-settings", userId], enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("referral_settings").select("paused").eq("id", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const rows = useMemo(() => codes.data ?? [], [codes.data]);
  const index = useMemo(() => childrenIndex(rows), [rows]);
  const byCode = useMemo(() => new Map(rows.map((r) => [r.code, r])), [rows]);

  const done = () => { void qc.invalidateQueries({ queryKey: ["referral-codes"] }); void qc.invalidateQueries({ queryKey: ["referral-settings"] }); };
  const fail = () => toast.error(es ? "No se ha podido guardar." : "Could not save.");

  const pause = useMutation({
    mutationFn: async (paused: boolean) => {
      const { error } = await supabase.from("referral_settings").upsert({ id: true, paused, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: (_d, paused) => { done(); toast.success(paused ? (es ? "Invitaciones en pausa" : "Invitations paused") : (es ? "Invitaciones activas" : "Invitations resumed")); },
    onError: fail,
  });
  const setActive = useMutation({
    mutationFn: async ({ codes: list, active }: { codes: string[]; active: boolean }) => {
      const { error } = await supabase.from("referral_codes").update({ active }).in("code", list);
      if (error) throw error;
    },
    onSuccess: () => { done(); setBranch(null); toast.success(es ? "Invitaciones actualizadas" : "Invites updated"); },
    onError: fail,
  });
  const mint = useMutation({
    mutationFn: async () => {
      const seats = cap.trim() === "" ? null : Math.max(0, Math.floor(Number(cap)));
      if (seats !== null && !Number.isFinite(seats)) throw new Error("cap");
      const row = { code: mintReferralCode(new Set(byCode.keys())), owner_label: label.trim(), type, seats_cap: seats, owner_email: ownerEmail.trim() ? normalizeEmail(ownerEmail) : null, revshare_note: note.trim() || null };
      const { data, error } = await supabase.from("referral_codes").insert(row).select("*").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (row) => { done(); setShown(row); setLabel(""); setCap(""); setOwnerEmail(""); setNote(""); },
    onError: fail,
  });

  if (checking) return <p role="status">{es ? "Comprobando acceso…" : "Checking access…"}</p>;
  if (!isAdmin) return <p>{es ? "Solo los administradores pueden gestionar las invitaciones." : "Only admins can manage invitations."}</p>;
  const paused = settings.data?.paused ?? false;
  const branchCodes = branch ? [branch.code, ...descendants(branch.code, rows, index)] : [];

  return <section className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="font-editorial text-2xl">{es ? "Invitaciones" : "Invites"}</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{es ? "Cada persona invitada recibe su propio código. Desactivar un código impide nuevas altas con él; no retira el acceso de quien ya entró." : "Each invited person gets their own code. Deactivating a code stops new joins through it; it does not remove access from people already in."}</p></div>
      <label className="flex items-center gap-3 rounded-md border px-4 py-2 text-sm"><Switch checked={paused} disabled={pause.isPending || settings.isLoading} onCheckedChange={(v) => pause.mutate(v)} aria-label={es ? "Pausar todas las invitaciones" : "Pause all invitations"} /><span>{paused ? (es ? "Altas en pausa" : "Joins paused") : (es ? "Pausar todas las altas" : "Pause all joins")}</span></label>
    </div>

    <form onSubmit={(e: FormEvent) => { e.preventDefault(); if (label.trim()) mint.mutate(); }} className="grid items-end gap-3 border-y py-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="mint-label">{es ? "Nombre visible" : "Display name"}</Label><Input id="mint-label" required maxLength={120} value={label} onChange={(e) => setLabel(e.target.value)} placeholder={es ? "p. ej. Asociación Red Fértil" : "e.g. Fertility Network"} /></div>
      <div className="space-y-2"><Label htmlFor="mint-type">{es ? "Tipo" : "Type"}</Label><Select value={type} onValueChange={(v) => setType(v as ReferralType)}><SelectTrigger id="mint-type"><SelectValue /></SelectTrigger><SelectContent>{REFERRAL_TYPES.map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t][language]}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="mint-cap">{es ? "Plazas (vacío = sin límite)" : "Seats (empty = unlimited)"}</Label><Input id="mint-cap" type="number" min={0} inputMode="numeric" value={cap} onChange={(e) => setCap(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="mint-email">{es ? "Correo de la titular (opcional)" : "Owner email (optional)"}</Label><Input id="mint-email" type="email" maxLength={254} value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="mint-note">{es ? "Reparto de ingresos (nota)" : "Revenue share (note)"}</Label><Input id="mint-note" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></div>
      <Button type="submit" disabled={mint.isPending || !label.trim()}><Plus />{es ? "Crear código" : "Mint code"}</Button>
    </form>

    {codes.isLoading && <p role="status">{es ? "Cargando…" : "Loading…"}</p>}
    {codes.isError && <div role="alert"><p>{es ? "No se ha podido cargar la lista." : "Could not load the list."}</p><Button variant="link" onClick={() => codes.refetch()}>{es ? "Volver a intentar" : "Try again"}</Button></div>}
    {codes.data?.length === 0 && <p className="text-muted-foreground">{es ? "Aún no hay códigos." : "No codes yet."}</p>}
    {rows.length > 0 && <div className="overflow-x-auto rounded-md border"><Table>
      <TableHeader><TableRow>
        <TableHead>{es ? "Titular" : "Owner"}</TableHead><TableHead>{es ? "Tipo" : "Type"}</TableHead><TableHead>{es ? "Invitada por" : "Invited by"}</TableHead>
        <TableHead className="text-right">{es ? "Plazas" : "Seats"}</TableHead><TableHead className="text-right">{es ? "Directas" : "Direct"}</TableHead><TableHead className="text-right">{es ? "Rama" : "Branch"}</TableHead>
        <TableHead>{es ? "Activo" : "Active"}</TableHead><TableHead><span className="sr-only">{es ? "Acciones" : "Actions"}</span></TableHead>
      </TableRow></TableHeader>
      <TableBody>{rows.map((r) => <TableRow key={r.id}>
        <TableCell><p className="font-medium">{r.owner_label}</p><p className="font-mono text-xs text-muted-foreground">{r.code}{r.owner_email ? ` · ${r.owner_email}` : ""}</p>{r.revshare_note && <p className="text-xs text-muted-foreground">{r.revshare_note}</p>}</TableCell>
        <TableCell><Badge variant="outline">{TYPE_LABEL[r.type as ReferralType]?.[language] ?? r.type}</Badge></TableCell>
        <TableCell className="text-sm">{r.parent_code ? byCode.get(r.parent_code)?.owner_label ?? r.parent_code : ""}</TableCell>
        <TableCell className="text-right tabular-nums">{r.seats_used} / {r.seats_cap ?? "∞"}</TableCell>
        <TableCell className="text-right tabular-nums">{directJoins(r.code, rows)}</TableCell>
        <TableCell className="text-right tabular-nums">{branchTotal(r.code, rows, index)}</TableCell>
        <TableCell><Switch checked={r.active} disabled={setActive.isPending} aria-label={`${es ? "Código activo de" : "Code active for"} ${r.owner_label}`} onCheckedChange={(active) => setActive.mutate({ codes: [r.code], active })} /></TableCell>
        <TableCell><div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title={es ? "Enlace y QR" : "Link and QR"} aria-label={`${es ? "Enlace y QR de" : "Link and QR for"} ${r.owner_label}`} onClick={() => setShown(r)}><QrCode /></Button>
          <Button variant="ghost" size="icon" title={es ? "Revocar rama" : "Revoke branch"} aria-label={`${es ? "Revocar rama de" : "Revoke branch of"} ${r.owner_label}`} disabled={setActive.isPending} onClick={() => setBranch(r)}><Ban /></Button>
        </div></TableCell>
      </TableRow>)}</TableBody>
    </Table></div>}

    <Dialog open={shown !== null} onOpenChange={(o) => { if (!o) setShown(null); }}><DialogContent><DialogHeader><DialogTitle>{shown?.owner_label}</DialogTitle></DialogHeader>{shown && <InviteKit link={inviteLink(window.location.origin, shown.code)} />}</DialogContent></Dialog>
    <AlertDialog open={branch !== null} onOpenChange={(o) => { if (!o) setBranch(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{es ? "¿Revocar toda la rama?" : "Revoke the whole branch?"}</AlertDialogTitle><AlertDialogDescription>{es ? `Se desactivarán ${branchCodes.length} códigos: el de ${branch?.owner_label} y todos los que cuelgan de él. Nadie podrá unirse con ellos. Quien ya tiene acceso lo conserva.` : `${branchCodes.length} codes will be deactivated: ${branch?.owner_label}'s and every code below it. No one can join through them. People already in keep their access.`}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{es ? "Cancelar" : "Cancel"}</AlertDialogCancel><AlertDialogAction onClick={() => setActive.mutate({ codes: branchCodes, active: false })}>{es ? "Revocar rama" : "Revoke branch"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </section>;
}
