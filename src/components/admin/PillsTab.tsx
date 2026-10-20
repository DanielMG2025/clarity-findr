import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, Eye, EyeOff, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { AUDIENCE_LABEL, MOLD_LABEL, type Audience, type Mold, type PillRow } from "@/modules/content";

const MOLDS = Object.keys(MOLD_LABEL) as Mold[];
const AUDIENCES = Object.keys(AUDIENCE_LABEL) as Audience[];
type Draft = Omit<PillRow, "created_at" | "updated_at">;

const empty = (): Draft => ({
  id: "", date: new Date().toISOString().slice(0, 10), mold: "stat", audiences: [],
  title_en: "", title_es: "", body_en: "", body_es: "",
  source_name: "", source_url: null, source_date: null, source_confidence: "medium",
  source_note_en: null, source_note_es: null, status: "draft",
});

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);

function useAdminSession() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user.id ?? null));
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId!, _role: "admin" });
      if (error) throw error;
      return !!data;
    },
  });
  return { userId, isAdmin: !!isAdmin, checking: userId === undefined || (!!userId && isLoading) };
}

function SignIn({ es }: { es: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const go = async (mode: "in" | "up") => {
    setBusy(true);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === "up") toast.success(es ? "Revisa tu correo para confirmar la cuenta." : "Check your email to confirm your account.");
  };
  return (
    <Card className="p-6 max-w-md space-y-4">
      <div>
        <h3 className="font-semibold">{es ? "Acceso de administración" : "Admin sign-in"}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {es ? "Gestionar píldoras requiere una cuenta con rol de administrador." : "Managing pills requires an account with the admin role."}
        </p>
      </div>
      <div className="space-y-2"><Label htmlFor="pe">Email</Label><Input id="pe" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="pp">{es ? "Contraseña" : "Password"}</Label><Input id="pp" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <div className="flex gap-2">
        <Button disabled={busy} onClick={() => go("in")}>{es ? "Entrar" : "Sign in"}</Button>
        <Button disabled={busy} variant="outline" onClick={() => go("up")}>{es ? "Crear cuenta" : "Create account"}</Button>
      </div>
    </Card>
  );
}

function PillForm({ initial, isNew, onClose, es }: { initial: Draft; isNew: boolean; onClose: () => void; es: boolean }) {
  const qc = useQueryClient();
  const [d, setD] = useState<Draft>(initial);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const nul = (v: string) => (v.trim() ? v : null);
  const save = useMutation({
    mutationFn: async () => {
      const row = { ...d, id: d.id || slugify(d.title_en || d.title_es) };
      if (!row.id) throw new Error(es ? "Falta un título." : "A title is required.");
      const { error } = isNew
        ? await supabase.from("pills").insert(row)
        : await supabase.from("pills").update(row).eq("id", initial.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pills"] }); toast.success(es ? "Píldora guardada" : "Pill saved"); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const field = (k: keyof Draft, label: string, area = false) => {
    const v = (d[k] as string | null) ?? "";
    const on = (x: string) => set(k, (["source_url", "source_date", "source_note_en", "source_note_es"].includes(k) ? nul(x) : x) as never);
    return (
      <div className="space-y-1.5 min-w-0">
        <Label className="text-xs">{label}</Label>
        {area ? <Textarea rows={4} value={v} onChange={(e) => on(e.target.value)} /> : <Input value={v} onChange={(e) => on(e.target.value)} />}
      </div>
    );
  };
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5"><Label className="text-xs">{es ? "Fecha" : "Date"}</Label><Input type="date" value={d.date} onChange={(e) => set("date", e.target.value)} /></div>
        <div className="space-y-1.5">
          <Label className="text-xs">{es ? "Formato" : "Mold"}</Label>
          <Select value={d.mold} onValueChange={(v) => set("mold", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{MOLDS.map((m) => <SelectItem key={m} value={m}>{MOLD_LABEL[m][es ? "es" : "en"]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label className="text-xs">ID</Label><Input value={d.id} disabled={!isNew} placeholder={es ? "auto desde el título" : "auto from title"} onChange={(e) => set("id", slugify(e.target.value))} /></div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">{es ? "Audiencias" : "Audiences"}</Label>
        <div className="flex flex-wrap gap-4">
          {AUDIENCES.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <Checkbox checked={d.audiences.includes(a)} onCheckedChange={(c) => set("audiences", c ? [...d.audiences, a] : d.audiences.filter((x) => x !== a))} />
              {AUDIENCE_LABEL[a][es ? "es" : "en"]}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {field("title_es", "Título (ES)")}{field("title_en", "Title (EN)")}
        {field("body_es", "Texto (ES)", true)}{field("body_en", "Body (EN)", true)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
        {field("source_name", es ? "Fuente — nombre" : "Source name")}
        {field("source_url", es ? "Fuente — URL" : "Source URL")}
        {field("source_date", es ? "Fuente — fecha" : "Source date")}
        <div className="space-y-1.5">
          <Label className="text-xs">{es ? "Confianza" : "Confidence"}</Label>
          <Select value={d.source_confidence} onValueChange={(v) => set("source_confidence", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high">{es ? "Alta" : "High"}</SelectItem>
              <SelectItem value="medium">{es ? "Media" : "Medium"}</SelectItem>
              <SelectItem value="low">{es ? "Baja" : "Low"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {field("source_note_es", "Nota de la fuente (ES)")}{field("source_note_en", "Source note (EN)")}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>{es ? "Cancelar" : "Cancel"}</Button>
        <Button disabled={save.isPending} onClick={() => save.mutate()}>{es ? "Guardar" : "Save"}</Button>
      </DialogFooter>
    </>
  );
}

export default function PillsTab() {
  const { language } = useLanguage();
  const es = language === "es";
  const qc = useQueryClient();
  const { userId, isAdmin, checking } = useAdminSession();
  const [editing, setEditing] = useState<{ draft: Draft; isNew: boolean } | null>(null);
  const [toDelete, setToDelete] = useState<PillRow | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["pills", "admin", userId],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("pills").select("*")
        .order("date", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["pills"] });
  const toggle = useMutation({
    mutationFn: async (r: PillRow) => {
      const { error } = await supabase.from("pills").update({ status: r.status === "published" ? "draft" : "published" }).eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: refresh, onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refresh(); toast.success(es ? "Píldora eliminada" : "Pill deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (checking) return <p className="text-sm text-muted-foreground">{es ? "Comprobando acceso…" : "Checking access…"}</p>;
  if (!userId) return <SignIn es={es} />;
  if (!isAdmin) return (
    <Card className="p-6 max-w-md space-y-3">
      <p className="text-sm">{es ? "Tu cuenta no tiene rol de administrador." : "Your account does not have the admin role."}</p>
      <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}><LogOut className="size-4" /> {es ? "Salir" : "Sign out"}</Button>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">{es ? `${rows.length} píldoras · las más recientes primero` : `${rows.length} pills · newest first`}</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}><LogOut className="size-4" /></Button>
          <Button size="sm" onClick={() => setEditing({ draft: empty(), isNew: true })}><Plus className="size-4" /> {es ? "Nueva píldora" : "New pill"}</Button>
        </div>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">…</p> : (
        <Card className="divide-y">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-3 p-3">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider shrink-0">{MOLD_LABEL[r.mold as Mold]?.[language] ?? r.mold}</Badge>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{es ? r.title_es || r.title_en : r.title_en || r.title_es}</p>
                <p className="text-xs text-muted-foreground">{r.date} · {r.audiences.map((a) => AUDIENCE_LABEL[a as Audience]?.[language] ?? a).join(", ") || "—"}</p>
              </div>
              <Badge variant={r.status === "published" ? "default" : "secondary"}>
                {r.status === "published" ? (es ? "Publicada" : "Published") : (es ? "Borrador" : "Draft")}
              </Badge>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" title={r.status === "published" ? (es ? "Despublicar" : "Unpublish") : (es ? "Publicar" : "Publish")} onClick={() => toggle.mutate(r)}>
                  {r.status === "published" ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button size="sm" variant="ghost" title={es ? "Editar" : "Edit"} onClick={() => setEditing({ draft: r, isNew: false })}><Pencil className="size-4" /></Button>
                <Button size="sm" variant="ghost" title={es ? "Eliminar" : "Delete"} onClick={() => setToDelete(r)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="p-4 text-sm text-muted-foreground">{es ? "Aún no hay píldoras." : "No pills yet."}</p>}
        </Card>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto space-y-2">
          <DialogHeader><DialogTitle>{editing?.isNew ? (es ? "Nueva píldora" : "New pill") : (es ? "Editar píldora" : "Edit pill")}</DialogTitle></DialogHeader>
          {editing && <PillForm key={editing.draft.id || "new"} initial={editing.draft} isNew={editing.isNew} es={es} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{es ? "¿Eliminar esta píldora?" : "Delete this pill?"}</AlertDialogTitle>
            <AlertDialogDescription>{toDelete && (es ? toDelete.title_es : toDelete.title_en)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{es ? "Cancelar" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && remove.mutate(toDelete.id)}>{es ? "Eliminar" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
