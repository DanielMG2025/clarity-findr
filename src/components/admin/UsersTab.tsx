import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAdminSession } from "./PillsTab";
import { normalizeEmail } from "@/modules/access/policy";
import type { Database } from "@/integrations/supabase/types";

type AllowedUser = Database["public"]["Tables"]["allowed_users"]["Row"];
export default function UsersTab() {
  const { language } = useLanguage();
  const es = language === "es";
  const { isAdmin, userId, checking } = useAdminSession();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [remove, setRemove] = useState<AllowedUser | null>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const rows = useQuery({
    queryKey: ["allowed-users", userId], enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("allowed_users").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const save = useMutation({
    mutationFn: async (action: { kind: "add" } | { kind: "toggle"; row: AllowedUser; active: boolean } | { kind: "delete"; row: AllowedUser }) => {
      const result = action.kind === "add" ? await supabase.from("allowed_users").insert({ email: normalizeEmail(email), name: name.trim() || null })
        : action.kind === "toggle" ? await supabase.from("allowed_users").update({ active: action.active }).eq("id", action.row.id)
        : await supabase.from("allowed_users").delete().eq("id", action.row.id);
      if (result.error) throw result.error;
      if (action.kind === "add") { setEmail(""); setName(""); }
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ["allowed-users"] }); setRemove(null); toast.success(es ? "Acceso actualizado" : "Access updated"); },
    onError: () => toast.error(es ? "No se ha podido guardar. Comprueba si el correo ya existe." : "Could not save. Check whether the email already exists."),
  });
  async function copy(row: AllowedUser) {
    setCopying(row.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-access-link", { body: { email: row.email, origin: window.location.origin } });
      if (error || typeof data?.link !== "string") throw new Error("Link unavailable");
      try { await navigator.clipboard.writeText(data.link); toast.success(es ? "Enlace de acceso copiado" : "Access link copied"); }
      catch { setManualLink(data.link); }
      void qc.invalidateQueries({ queryKey: ["allowed-users"] });
    } catch { toast.error(es ? "No se ha podido crear el enlace. Comprueba que el acceso esté activo." : "Could not create the link. Check that access is active."); }
    finally { setCopying(null); }
  }
  function add(event: FormEvent) { event.preventDefault(); save.mutate({ kind: "add" }); }
  const date = (value: string | null) => value ? new Intl.DateTimeFormat(es ? "es-ES" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
  if (checking) return <p role="status">{es ? "Comprobando acceso…" : "Checking access…"}</p>;
  if (!isAdmin) return <p>{es ? "Solo los administradores pueden gestionar el acceso." : "Only admins can manage access."}</p>;
  return <section className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-editorial text-2xl">{es ? "Personas autorizadas" : "Authorized people"}</h2><p className="mt-1 text-sm text-muted-foreground">{es ? "Al desactivar el acceso, se bloqueará la siguiente carga de página. Los administradores siempre tienen acceso." : "Deactivating access blocks the next page load. Admins always have access."}</p></div><Button variant="outline" onClick={() => supabase.auth.signOut()}><LogOut />{es ? "Cerrar sesión" : "Sign out"}</Button></div>
    <form onSubmit={add} className="grid items-end gap-3 border-y py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
      <div className="space-y-2"><Label htmlFor="user-email">{es ? "Correo electrónico" : "Email"}</Label><Input id="user-email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="user-name">{es ? "Nombre (opcional)" : "Name (optional)"}</Label><Input id="user-name" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} /></div>
      <Button type="submit" disabled={save.isPending}><Plus />{es ? "Añadir persona" : "Add user"}</Button>
    </form>
    {rows.isLoading && <p role="status">{es ? "Cargando…" : "Loading…"}</p>}
    {rows.isError && <div role="alert"><p>{es ? "No se ha podido cargar la lista." : "Could not load the list."}</p><Button variant="link" onClick={() => rows.refetch()}>{es ? "Volver a intentar" : "Try again"}</Button></div>}
    {rows.data?.length === 0 && <p className="text-muted-foreground">{es ? "Aún no hay personas en la lista." : "No people in the list yet."}</p>}
    <div className="divide-y">{rows.data?.map((row) => <article key={row.id} className="flex flex-wrap items-start justify-between gap-4 py-5" aria-label={row.email}>
      <div className="min-w-0 flex-1 basis-64"><h3 className="break-all font-semibold">{row.email}</h3>{row.name && <p className="text-sm">{row.name}</p>}<dl className="mt-2 text-xs text-muted-foreground"><div><dt className="inline">{es ? "Creación: " : "Created: "}</dt><dd className="inline">{date(row.created_at)}</dd></div><div><dt className="inline">{es ? "Último enlace: " : "Last link: "}</dt><dd className="inline">{date(row.last_link_sent_at)}</dd></div></dl></div>
      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto"><Badge variant={row.active ? "default" : "outline"}>{row.active ? (es ? "Activo" : "Active") : (es ? "Inactivo" : "Inactive")}</Badge><Switch aria-label={`${es ? "Acceso de" : "Access for"} ${row.email}`} checked={row.active} disabled={save.isPending} onCheckedChange={(active) => save.mutate({ kind: "toggle", row, active })} /><Button variant="outline" size="sm" disabled={copying !== null || !row.active} onClick={() => copy(row)}><Copy />{es ? "Copiar enlace de acceso" : "Copy access link"}</Button><Button variant="ghost" size="icon" aria-label={`${es ? "Eliminar" : "Delete"} ${row.email}`} title={es ? "Eliminar persona" : "Delete user"} disabled={save.isPending} onClick={() => setRemove(row)}><Trash2 /></Button></div>
    </article>)}</div>
    <AlertDialog open={remove !== null} onOpenChange={(open) => { if (!open) setRemove(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{es ? "¿Eliminar acceso?" : "Delete access?"}</AlertDialogTitle><AlertDialogDescription className="break-all">{remove?.email}<br />{es ? "Esta persona ya no podrá entrar, salvo que sea administradora." : "This person will no longer be able to enter, unless they are an admin."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{es ? "Cancelar" : "Cancel"}</AlertDialogCancel><AlertDialogAction onClick={() => { if (remove) save.mutate({ kind: "delete", row: remove }); }}>{es ? "Eliminar" : "Delete"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <Dialog open={manualLink !== null} onOpenChange={(open) => { if (!open) setManualLink(null); }}><DialogContent><DialogHeader><DialogTitle>{es ? "Enlace de acceso" : "Access link"}</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">{es ? "Copia este enlace para enviarlo en privado." : "Copy this link to send it privately."}</p><Input aria-label={es ? "Enlace de acceso" : "Access link"} readOnly value={manualLink ?? ""} onFocus={(e) => e.target.select()} /></DialogContent></Dialog>
  </section>;
}