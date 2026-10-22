import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LogOut, Pencil, Play, Trash2 } from "lucide-react";
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
import { AUDIENCE_LABEL, type Audience } from "@/modules/content";
import { topKeywords, type TopicRow } from "@/modules/content/conversation";
import { SignIn, useAdminSession } from "./PillsTab";

const AUDIENCES = Object.keys(AUDIENCE_LABEL) as Audience[];

async function invoke(name: string) {
  const { data, error } = await supabase.functions.invoke(name, { body: {} });
  if (error) {
    let msg = error.message;
    try { const b = await (error as { context?: Response }).context?.json(); if (b?.error) msg = b.error; } catch { /* keep */ }
    throw new Error(msg);
  }
  return data;
}

function TopicForm({ t, onClose, es }: { t: TopicRow; onClose: () => void; es: boolean }) {
  const qc = useQueryClient();
  const [d, setD] = useState<TopicRow>(t);
  const set = <K extends keyof TopicRow>(k: K, v: TopicRow[K]) => setD((p) => ({ ...p, [k]: v }));
  const save = useMutation({
    mutationFn: async () => {
      const { id, created_at, run_id, ...rest } = d;
      const { error } = await supabase.from("conversation_topics").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["topics"] }); toast.success(es ? "Tema guardado" : "Topic saved"); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const txt = (k: "question_es" | "question_en" | "answer_es" | "answer_en" | "source_forum", label: string, area = false) => (
    <div className="space-y-1.5 min-w-0">
      <Label className="text-xs">{label}</Label>
      {area ? <Textarea rows={4} value={d[k]} onChange={(e) => set(k, e.target.value)} /> : <Input value={d[k]} onChange={(e) => set(k, e.target.value)} />}
    </div>
  );
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {txt("question_es", "Pregunta (ES)")}{txt("question_en", "Question (EN)")}
        {txt("answer_es", "Respuesta (ES)", true)}{txt("answer_en", "Answer (EN)", true)}
      </div>
      <div className="flex flex-wrap gap-4">
        {AUDIENCES.map((a) => (
          <label key={a} className="flex items-center gap-2 text-sm">
            <Checkbox checked={d.audiences.includes(a)} onCheckedChange={(c) => set("audiences", c ? [...d.audiences, a] : d.audiences.filter((x) => x !== a))} />
            {AUDIENCE_LABEL[a][es ? "es" : "en"]}
          </label>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {txt("source_forum", es ? "Foro" : "Forum")}
        <div className="space-y-1.5"><Label className="text-xs">{es ? "Menciones" : "Mentions"}</Label>
          <Input type="number" value={d.mentions_estimate} onChange={(e) => set("mentions_estimate", Number(e.target.value) || 0)} /></div>
        <div className="space-y-1.5"><Label className="text-xs">{es ? "Tendencia" : "Trend"}</Label>
          <Select value={d.trend} onValueChange={(v) => set("trend", v)}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="up">{es ? "En aumento" : "Up"}</SelectItem><SelectItem value="steady">{es ? "Estable" : "Steady"}</SelectItem></SelectContent></Select></div>
        <div className="space-y-1.5"><Label className="text-xs">{es ? "Confianza" : "Confidence"}</Label>
          <Select value={d.confidence} onValueChange={(v) => set("confidence", v)}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["high", "medium", "low"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="space-y-1.5"><Label className="text-xs">URL</Label>
        <Input value={d.source_url ?? ""} onChange={(e) => set("source_url", e.target.value.trim() || null)} /></div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>{es ? "Cancelar" : "Cancel"}</Button>
        <Button disabled={save.isPending} onClick={() => save.mutate()}>{es ? "Guardar" : "Save"}</Button>
      </DialogFooter>
    </>
  );
}

function MarketPanel({ es, topics }: { es: boolean; topics: TopicRow[] }) {
  const { data: signals = [] } = useQuery({
    queryKey: ["topics", "signals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("raw_signals").select("subreddit,title,body").order("fetched_at", { ascending: false }).limit(1000);
      if (error) throw error;
      return data;
    },
  });
  const keywords = useMemo(() => topKeywords(signals.map((s) => `${s.title} ${s.body}`), 20), [signals]);
  const bySub = useMemo(() => {
    const m = new Map<string, number>(); signals.forEach((s) => m.set(s.subreddit, (m.get(s.subreddit) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [signals]);
  const byAud = AUDIENCES.map((a) => [a, topics.filter((t) => t.audiences.includes(a)).length] as const);
  const max = Math.max(1, ...keywords.map((k) => k.count));
  const stat = (n: number | string, l: string) => (
    <Card className="p-4"><p className="text-2xl font-bold">{n}</p><p className="text-xs text-muted-foreground">{l}</p></Card>
  );
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{es ? "Inteligencia de mercado (interno)" : "Market intelligence (internal)"}</h3>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {stat(signals.length, es ? "señales recogidas" : "signals ingested")}
        {stat(topics.length, es ? "temas" : "topics")}
        {stat(topics.filter((t) => t.status === "published").length, es ? "publicados" : "published")}
        {stat(bySub.length, es ? "foros" : "forums")}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{es ? "Temas por audiencia" : "Topics by audience"}</p>
          {byAud.map(([a, n]) => <div key={a} className="flex justify-between text-sm"><span>{AUDIENCE_LABEL[a][es ? "es" : "en"]}</span><span className="font-medium">{n}</span></div>)}
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{es ? "Señales por foro" : "Signals by forum"}</p>
          {bySub.map(([s, n]) => <div key={s} className="flex justify-between text-sm"><span>{s}</span><span className="font-medium">{n}</span></div>)}
        </Card>
        <Card className="p-4 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{es ? "Palabras más repetidas" : "Top recurring keywords"}</p>
          {keywords.map((k) => (
            <div key={k.word} className="flex items-center gap-2 text-xs">
              <span className="w-24 truncate">{k.word}</span>
              <div className="h-1.5 flex-1 rounded bg-muted"><div className="h-1.5 rounded bg-primary" style={{ width: `${(k.count / max) * 100}%` }} /></div>
              <span className="w-6 text-right text-muted-foreground">{k.count}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

export default function ListeningTab() {
  const { language } = useLanguage();
  const es = language === "es";
  const qc = useQueryClient();
  const { userId, isAdmin, checking } = useAdminSession();
  const [editing, setEditing] = useState<TopicRow | null>(null);
  const [toDelete, setToDelete] = useState<TopicRow | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const { data: topics = [] } = useQuery({
    queryKey: ["topics", "admin", userId],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("conversation_topics").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["topics"] });

  const run = useMutation({
    mutationFn: async () => {
      setResult(es ? "Recogiendo publicaciones…" : "Fetching posts…");
      const ing = await invoke("listen-ingest");
      setResult(es ? "Resumiendo con IA…" : "Distilling with AI…");
      const dis = await invoke("listen-distil");
      const per = Object.entries(ing.fetched ?? {}).map(([k, v]) => `r/${k}: ${v}`).join(" · ");
      return `${es ? "Nuevas señales" : "New signals"}: ${ing.new_signals} (${per}). ${es ? "Temas creados" : "Topics created"}: ${dis.topics_created} ${es ? "de" : "from"} ${dis.signals_used} ${es ? "señales" : "signals"}.`;
    },
    onSuccess: (msg) => { setResult(msg); refresh(); },
    onError: (e: Error) => { setResult(null); toast.error(e.message); },
  });
  const toggle = useMutation({
    mutationFn: async (t: TopicRow) => {
      const { error } = await supabase.from("conversation_topics").update({ status: t.status === "published" ? "draft" : "published" }).eq("id", t.id);
      if (error) throw error;
    },
    onSuccess: refresh, onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("conversation_topics").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refresh(); toast.success(es ? "Tema eliminado" : "Topic deleted"); },
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
    <div className="space-y-8">
      <Card className="p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">{es ? "Escucha de foros" : "Forum listening"}</h3>
            <p className="text-sm text-muted-foreground">{es ? "Lee foros públicos de Reddit y crea borradores de temas para revisar. Solo manual." : "Reads public Reddit forums and creates draft topics to review. Manual only."}</p>
          </div>
          <Button disabled={run.isPending} onClick={() => run.mutate()}><Play className="size-4" /> {es ? "Ejecutar ahora" : "Run now"}</Button>
        </div>
        {result && <p className="text-sm rounded-md bg-muted p-3">{result}</p>}
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{es ? `${topics.length} temas · los más recientes primero` : `${topics.length} topics · newest first`}</p>
        {topics.map((t) => (
          <Card key={t.id} className="p-4 flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={t.status === "published" ? "default" : "outline"}>{t.status === "published" ? (es ? "Publicado" : "Published") : (es ? "Borrador" : "Draft")}</Badge>
                {t.audiences.map((a) => <Badge key={a} variant="outline" className="text-[10px]">{AUDIENCE_LABEL[a as Audience]?.[es ? "es" : "en"] ?? a}</Badge>)}
              </div>
              <p className="font-medium leading-snug">{es ? t.question_es : t.question_en}</p>
              <p className="text-xs text-muted-foreground">{t.source_forum} · {t.trend === "up" ? "↑" : "→"} · ≈ {t.mentions_estimate} {es ? "menciones" : "mentions"} · {t.confidence}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(t)}><Pencil className="size-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Toggle" onClick={() => toggle.mutate(t)}>{t.status === "published" ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</Button>
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setToDelete(t)}><Trash2 className="size-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <MarketPanel es={es} topics={topics} />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto space-y-4">
          <DialogHeader><DialogTitle>{es ? "Editar tema" : "Edit topic"}</DialogTitle></DialogHeader>
          {editing && <TopicForm t={editing} es={es} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{es ? "¿Eliminar este tema?" : "Delete this topic?"}</AlertDialogTitle>
            <AlertDialogDescription>{toDelete && (es ? toDelete.question_es : toDelete.question_en)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{es ? "Cancelar" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) remove.mutate(toDelete.id); setToDelete(null); }}>{es ? "Eliminar" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
