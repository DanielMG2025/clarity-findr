import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, ShieldPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAdminSession } from "./PillsTab";
import { interpretManageAdmins, MIN_PASSWORD_LENGTH, validateNewPassword, type AdminEntry, type ManageAdminsOutcome } from "@/modules/admin-accounts/logic";

async function callManageAdmins(body: Record<string, unknown>): Promise<ManageAdminsOutcome> {
  const { data, error } = await supabase.functions.invoke("manage-admins", { body });
  if (error) return { kind: "error" };
  return interpretManageAdmins(data);
}

function PasswordCard({ es }: { es: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const issue = validateNewPassword(password, confirm);
    if (issue === "too_short") return toast.error(es ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` : `The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    if (issue === "mismatch") return toast.error(es ? "Las dos contraseñas no coinciden." : "The two passwords don't match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(es ? "No se ha podido guardar la contraseña. Prueba con otra más segura o vuelve a entrar e inténtalo de nuevo." : "Could not save the password. Try a stronger one, or sign in again and retry.");
      return;
    }
    setPassword(""); setConfirm("");
    toast.success(es ? "Contraseña guardada" : "Password saved");
  }
  return <section className="space-y-4 rounded-xl border bg-card p-5 md:p-6">
    <div>
      <h2 className="flex items-center gap-2 font-editorial text-2xl"><KeyRound className="size-5" />{es ? "Contraseña de administrador" : "Admin password"}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {es
          ? "Es la contraseña que sirve para «Administración · Entrar con contraseña» en la pantalla de acceso. El enlace mágico sigue funcionando igual. Solo tú la conoces: aquí no se puede ver, solo fijar una nueva."
          : "This is the password for \"Admin · Sign in with password\" on the access screen. The magic link keeps working as before. Only you know it: it can't be shown here, only replaced."}
      </p>
    </div>
    <form onSubmit={submit} className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="space-y-2"><Label htmlFor="admin-new-password">{es ? "Contraseña nueva" : "New password"}</Label><Input id="admin-new-password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} maxLength={128} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="admin-confirm-password">{es ? "Repite la contraseña" : "Confirm password"}</Label><Input id="admin-confirm-password" type="password" autoComplete="new-password" minLength={MIN_PASSWORD_LENGTH} maxLength={128} required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
      <Button type="submit" disabled={busy}>{busy ? (es ? "Guardando…" : "Saving…") : (es ? "Guardar contraseña" : "Save password")}</Button>
    </form>
    <p className="text-xs text-muted-foreground">{es ? `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.` : `At least ${MIN_PASSWORD_LENGTH} characters.`}</p>
  </section>;
}

function AdminsSection({ es }: { es: boolean }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [noAccount, setNoAccount] = useState<string | null>(null);
  const [target, setTarget] = useState<AdminEntry | null>(null);
  const list = useQuery({
    queryKey: ["manage-admins-list"],
    queryFn: async () => {
      const r = await callManageAdmins({ action: "list" });
      if (r.kind !== "list") throw new Error("list failed");
      return r;
    },
  });
  const grant = useMutation({
    mutationFn: (value: string) => callManageAdmins({ action: "grant", email: value }),
    onSuccess: (r) => {
      if (r.kind === "no_account") { setNoAccount(r.email); return; }
      setNoAccount(null);
      if (r.kind === "granted") { setEmail(""); toast.success(es ? "Ahora es administrador" : "They're now an admin"); }
      else if (r.kind === "already_admin") toast.info(es ? "Esta persona ya es administradora" : "This person is already an admin");
      else toast.error(es ? "No se ha podido completar. Inténtalo de nuevo." : "Could not complete. Please try again.");
      void qc.invalidateQueries({ queryKey: ["manage-admins-list"] });
    },
    onError: () => toast.error(es ? "No se ha podido completar. Inténtalo de nuevo." : "Could not complete. Please try again."),
  });
  const revoke = useMutation({
    mutationFn: (row: AdminEntry) => callManageAdmins({ action: "revoke", user_id: row.user_id, confirm_self: row.user_id === list.data?.selfId }),
    onSuccess: (r) => {
      setTarget(null);
      if (r.kind === "revoked") toast.success(es ? "Rol de administrador retirado" : "Admin role removed");
      else if (r.kind === "last_admin") toast.error(es ? "No se puede retirar al último administrador: la plataforma se quedaría sin nadie al mando." : "You can't remove the last admin: nobody would be left in charge.");
      else if (r.kind === "not_admin") toast.info(es ? "Esta persona ya no era administradora" : "This person was no longer an admin");
      else toast.error(es ? "No se ha podido completar. Inténtalo de nuevo." : "Could not complete. Please try again.");
      void qc.invalidateQueries({ queryKey: ["manage-admins-list"] });
      void qc.invalidateQueries({ queryKey: ["is-admin"] });
    },
    onError: () => toast.error(es ? "No se ha podido completar. Inténtalo de nuevo." : "Could not complete. Please try again."),
  });
  const date = (v: string | null) => v ? new Intl.DateTimeFormat(es ? "es-ES" : "en-GB", { dateStyle: "medium" }).format(new Date(v)) : "—";
  const isSelf = !!target && target.user_id === list.data?.selfId;
  const isLast = (list.data?.admins.length ?? 0) <= 1;

  return <section className="space-y-5 rounded-xl border bg-card p-5 md:p-6">
    <div>
      <h2 className="flex items-center gap-2 font-editorial text-2xl"><ShieldPlus className="size-5" />{es ? "Administradores" : "Admins"}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {es
          ? "Para un administrador nuevo: primero dale acceso en la pestaña Usuarios y que entre una vez con su enlace. Después ya puedes hacerle administrador aquí."
          : "For a new admin: first give them access in the Users tab and have them sign in once with their link. Then you can make them an admin here."}
      </p>
    </div>
    <form onSubmit={(e) => { e.preventDefault(); grant.mutate(email); }} className="grid items-end gap-3 border-y py-5 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="space-y-2"><Label htmlFor="grant-admin-email">{es ? "Correo electrónico" : "Email"}</Label><Input id="grant-admin-email" type="email" required maxLength={254} value={email} onChange={(e) => { setEmail(e.target.value); setNoAccount(null); }} /></div>
      <Button type="submit" disabled={grant.isPending}><ShieldPlus />{es ? "Hacer administrador" : "Make admin"}</Button>
    </form>
    {noAccount && <div role="alert" className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
      {es
        ? <><strong className="break-all">{noAccount}</strong> todavía no tiene cuenta. Esta persona debe entrar una vez primero con su enlace de acceso; después podrás hacerla administradora.</>
        : <><strong className="break-all">{noAccount}</strong> doesn't have an account yet. They need to sign in once with their access link first; then you can make them an admin.</>}
    </div>}
    {list.isLoading && <p role="status">{es ? "Cargando…" : "Loading…"}</p>}
    {list.isError && <div role="alert"><p>{es ? "No se ha podido cargar la lista de administradores." : "Could not load the admin list."}</p><Button variant="link" onClick={() => list.refetch()}>{es ? "Volver a intentar" : "Try again"}</Button></div>}
    <ul className="divide-y">
      {list.data?.admins.map((a) => <li key={a.user_id} className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="min-w-0 flex-1 basis-56">
          <p className="break-all font-semibold">{a.email ?? (es ? "(sin correo)" : "(no email)")} {a.user_id === list.data?.selfId && <Badge variant="outline" className="ml-1 align-middle text-[10px]">{es ? "Tú" : "You"}</Badge>}</p>
          <p className="text-xs text-muted-foreground">{es ? "Cuenta desde" : "Account since"} {date(a.created_at)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setTarget(a)} disabled={isLast} title={isLast ? (es ? "No se puede retirar al último administrador" : "The last admin can't be removed") : undefined}>
          <UserMinus />{es ? "Retirar" : "Revoke"}
        </Button>
      </li>)}
    </ul>
    <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{isSelf ? (es ? "¿Quitarte a ti el rol de administrador?" : "Remove your own admin role?") : (es ? "¿Retirar el rol de administrador?" : "Remove admin role?")}</AlertDialogTitle>
          <AlertDialogDescription>
            {isSelf
              ? (es ? "Perderás el acceso a este panel en cuanto confirmes. Otro administrador tendría que devolverte el rol." : "You'll lose access to this panel as soon as you confirm. Another admin would have to give the role back.")
              : (es ? `${target?.email ?? ""} dejará de ver el panel de administración. Su acceso normal a la app no cambia.` : `${target?.email ?? ""} will no longer see the admin panel. Their normal app access doesn't change.`)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{es ? "Cancelar" : "Cancel"}</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => { e.preventDefault(); if (target) revoke.mutate(target); }} disabled={revoke.isPending}>{es ? "Sí, retirar" : "Yes, remove"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}

export default function AccountTab() {
  const { language } = useLanguage();
  const es = language === "es";
  const { isAdmin, checking } = useAdminSession();
  if (checking) return <p role="status">{es ? "Comprobando acceso…" : "Checking access…"}</p>;
  if (!isAdmin) return <p>{es ? "Solo los administradores pueden ver esta sección." : "Only admins can see this section."}</p>;
  return <div className="space-y-6"><PasswordCard es={es} /><AdminsSection es={es} /></div>;
}
