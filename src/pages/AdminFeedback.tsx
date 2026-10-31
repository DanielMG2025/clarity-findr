import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAdminSession } from "@/components/admin/PillsTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  CATEGORY_LABEL, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES, STATUS_LABEL,
  countByCategory, filterFeedback, type FeedbackCategory, type FeedbackFilters, type FeedbackStatus,
} from "@/modules/feedback/categories";
import type { Database } from "@/integrations/supabase/types";

type Row = Database["public"]["Tables"]["beta_feedback"]["Row"];

export default function AdminFeedback() {
  const { language } = useLanguage();
  const es = language === "es";
  const { isAdmin, userId, checking } = useAdminSession();
  const qc = useQueryClient();
  const [filters, setFilters] = useState<FeedbackFilters>({ category: "all", status: "all", email: "all", query: "" });
  const [remove, setRemove] = useState<Row | null>(null);

  const rows = useQuery({
    queryKey: ["beta-feedback", "admin", userId], enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("beta_feedback").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const all = rows.data ?? [];
  const testers = useMemo(() => [...new Set(all.map((r) => r.user_email))].sort(), [all]);
  const visible = useMemo(() => filterFeedback(all, filters), [all, filters]);
  const counts = useMemo(() => countByCategory(all), [all]);

  const change = useMutation({
    mutationFn: async (a: { kind: "status"; row: Row; status: FeedbackStatus } | { kind: "delete"; row: Row }) => {
      const res = a.kind === "status"
        ? await supabase.from("beta_feedback").update({ status: a.status }).eq("id", a.row.id)
        : await supabase.from("beta_feedback").delete().eq("id", a.row.id);
      if (res.error) throw res.error;
    },
    onSuccess: () => { setRemove(null); void qc.invalidateQueries({ queryKey: ["beta-feedback"] }); toast.success(es ? "Comentario actualizado" : "Feedback updated"); },
    onError: () => toast.error(es ? "No se ha podido guardar el cambio." : "Could not save the change."),
  });

  const date = (v: string) => new Intl.DateTimeFormat(es ? "es-ES" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));
  const set = <K extends keyof FeedbackFilters>(k: K, v: FeedbackFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  return <div className="container max-w-6xl space-y-6 py-8 md:py-10">
    <Button asChild variant="ghost" size="sm" className="-ml-2"><Link to="/admin"><ArrowLeft />{es ? "Volver al panel" : "Back to admin"}</Link></Button>
    <div>
      <h1 className="font-editorial text-3xl md:text-4xl">{es ? "Comentarios de la beta" : "Beta feedback"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{es ? "Todo lo que han enviado las personas de la beta, del más reciente al más antiguo." : "Everything beta testers have sent, newest first."}</p>
    </div>

    {checking && <p role="status">{es ? "Comprobando acceso…" : "Checking access…"}</p>}
    {!checking && !isAdmin && <p>{es ? "Solo los administradores pueden ver los comentarios." : "Only admins can view feedback."}</p>}

    {isAdmin && <>
      <ul className="flex flex-wrap gap-2" aria-label={es ? "Comentarios por tipo" : "Feedback by type"}>
        {FEEDBACK_CATEGORIES.map((c) => <li key={c}>
          <button type="button" onClick={() => set("category", filters.category === c ? "all" : c)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${filters.category === c ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/60"}`}>
            {CATEGORY_LABEL[c][language]} <span className="font-semibold tabular-nums">{counts[c]}</span>
          </button>
        </li>)}
      </ul>

      <div className="grid gap-3 border-y py-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" aria-label={es ? "Buscar en los mensajes" : "Search messages"} placeholder={es ? "Buscar en los mensajes…" : "Search messages…"} value={filters.query} onChange={(e) => set("query", e.target.value)} />
        </div>
        <Select value={filters.category} onValueChange={(v) => set("category", v as FeedbackCategory | "all")}>
          <SelectTrigger aria-label={es ? "Tipo" : "Type"}><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">{es ? "Todos los tipos" : "All types"}</SelectItem>{FEEDBACK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABEL[c][language]}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.email} onValueChange={(v) => set("email", v)}>
          <SelectTrigger aria-label={es ? "Persona" : "Tester"}><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">{es ? "Todas las personas" : "All testers"}</SelectItem>{testers.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => set("status", v as FeedbackStatus | "all")}>
          <SelectTrigger aria-label={es ? "Estado" : "Status"}><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">{es ? "Todos los estados" : "All statuses"}</SelectItem>{FEEDBACK_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s][language]}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">{es ? `${visible.length} de ${all.length} comentarios` : `${visible.length} of ${all.length} comments`}</p>
      {rows.isLoading && <p role="status">{es ? "Cargando…" : "Loading…"}</p>}
      {rows.isError && <div role="alert"><p>{es ? "No se han podido cargar los comentarios." : "Could not load feedback."}</p><Button variant="link" onClick={() => rows.refetch()}>{es ? "Volver a intentar" : "Try again"}</Button></div>}
      {rows.data && visible.length === 0 && <p className="text-muted-foreground">{es ? "No hay comentarios con estos filtros." : "No feedback matches these filters."}</p>}

      <div className="divide-y">{visible.map((row) => <article key={row.id} className="grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <time dateTime={row.created_at}>{date(row.created_at)}</time>
            <span className="break-all font-medium text-foreground">{row.user_email}</span>
            {row.segment && <Badge variant="secondary" className="text-[10px]">{row.segment}</Badge>}
            {row.category && row.category in CATEGORY_LABEL && <Badge variant="outline" className="border-primary/40 text-[10px] text-primary">{CATEGORY_LABEL[row.category as FeedbackCategory][language]}</Badge>}
            {row.lang && <span className="uppercase">{row.lang}</span>}
          </div>
          <p className="whitespace-pre-wrap break-words">{row.message}</p>
          {row.page_path && <code className="block break-all font-mono text-xs text-muted-foreground">{row.page_path}</code>}
        </div>
        <div className="flex items-start gap-2">
          <Select value={row.status} disabled={change.isPending} onValueChange={(v) => change.mutate({ kind: "status", row, status: v as FeedbackStatus })}>
            <SelectTrigger className="w-36" aria-label={`${es ? "Estado de" : "Status of"} ${row.id}`}><SelectValue /></SelectTrigger>
            <SelectContent>{FEEDBACK_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s][language]}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="ghost" size="icon" aria-label={es ? "Eliminar comentario" : "Delete feedback"} disabled={change.isPending} onClick={() => setRemove(row)}><Trash2 /></Button>
        </div>
      </article>)}</div>

      <AlertDialog open={remove !== null} onOpenChange={(o) => { if (!o) setRemove(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{es ? "¿Eliminar este comentario?" : "Delete this feedback?"}</AlertDialogTitle>
            <AlertDialogDescription className="line-clamp-4 break-words">{remove?.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{es ? "Cancelar" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (remove) change.mutate({ kind: "delete", row: remove }); }}>{es ? "Eliminar" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>}
  </div>;
}
