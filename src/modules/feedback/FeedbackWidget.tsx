import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronDown, MessageSquareHeart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CATEGORY_LABEL, FEEDBACK_CATEGORIES, showsFeedbackLauncher, type FeedbackCategory } from "./categories";

const MAX = 5000;

/** Floating beta-feedback launcher; rendered only inside the access gate. */
export function FeedbackWidget() {
  const { pathname, search } = useLocation();
  const { language } = useLanguage();
  const es = language === "es";
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState("");
  const [thanks, setThanks] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const pagePath = pathname + search;

  useEffect(() => {
    if (!open) return;
    void supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [open]);

  const mine = useQuery({
    queryKey: ["beta-feedback", "mine", userId],
    enabled: open && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("beta_feedback")
        .select("id, created_at, category, message, page_path")
        .eq("user_id", userId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data.user) throw new Error("No session");
      const { error } = await supabase.from("beta_feedback").insert({
        user_id: data.user.id,
        user_email: (data.user.email ?? "").toLowerCase(),
        category,
        message: message.trim(),
        page_path: pagePath,
        lang: language,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage(""); setCategory(null); setThanks(true);
      void qc.invalidateQueries({ queryKey: ["beta-feedback"] });
    },
    onError: () => toast.error(es ? "No se ha podido enviar tu comentario. Inténtalo de nuevo." : "Could not send your comment. Please try again."),
  });

  if (!showsFeedbackLauncher(pathname)) return null;

  const onSubmit = (e: FormEvent) => { e.preventDefault(); if (message.trim()) submit.mutate(); };
  const date = (v: string) => new Intl.DateTimeFormat(es ? "es-ES" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));

  return <>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          onClick={() => { setThanks(false); setOpen(true); }}
          aria-label={es ? "Danos tu opinión" : "Give feedback"}
          className="no-print fixed bottom-4 right-4 z-50 h-11 gap-2 rounded-full border border-sidebar-primary/70 bg-sidebar px-4 text-sidebar-foreground shadow-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-sidebar-ring sm:bottom-6 sm:right-6"
        >
          <MessageSquareHeart className="size-4 text-sidebar-primary" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em]">Feedback</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{es ? "Danos tu opinión" : "Give feedback"}</TooltipContent>
    </Tooltip>

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-editorial text-2xl">{es ? "Tu opinión nos ayuda" : "Your feedback helps us"}</DialogTitle>
          <DialogDescription>{es ? "Puedes dejar tantos comentarios como quieras." : "You can leave as many comments as you like."}</DialogDescription>
        </DialogHeader>

        {thanks && <div role="status" className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <p><span className="font-semibold">{es ? "¡Gracias! Lo hemos recibido." : "Thank you! We've received it."}</span>{" "}
            {es ? "Puedes dejar tantos comentarios como quieras." : "You can leave as many comments as you like."}</p>
        </div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div role="radiogroup" aria-label={es ? "Tipo de comentario (opcional)" : "Comment type (optional)"} className="flex flex-wrap gap-2">
            {FEEDBACK_CATEGORIES.map((c) => {
              const active = category === c;
              return <button key={c} type="button" role="radio" aria-checked={active}
                onClick={() => setCategory(active ? null : c)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/60 hover:text-primary"}`}>
                {CATEGORY_LABEL[c][language]}
              </button>;
            })}
          </div>
          <Textarea
            required
            aria-label={es ? "Tu comentario" : "Your comment"}
            rows={5}
            maxLength={MAX}
            value={message}
            onChange={(e) => { setMessage(e.target.value); if (thanks) setThanks(false); }}
            placeholder={es ? "¿Qué mejorarías? ¿Qué te falta? ¿Qué te sobra? ¿Qué no te funciona?" : "What would you improve? What's missing? What's too much? What doesn't work?"}
          />
          <p className="truncate text-xs text-muted-foreground">{es ? "Se adjuntará a la página: " : "Attached to page: "}<code className="font-mono">{pagePath}</code></p>
          <div className="flex justify-end">
            <Button type="submit" disabled={!message.trim() || submit.isPending}>
              {submit.isPending ? (es ? "Enviando…" : "Sending…") : (es ? "Enviar" : "Submit")}
            </Button>
          </div>
        </form>

        <Collapsible className="border-t pt-3">
          <CollapsibleTrigger className="group flex w-full items-center justify-between text-sm font-semibold">
            <span>{es ? "Tus comentarios" : "Your comments"}{mine.data ? ` (${mine.data.length})` : ""}</span>
            <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {mine.isLoading && <p role="status" className="text-xs text-muted-foreground">{es ? "Cargando…" : "Loading…"}</p>}
            {mine.isError && <p className="text-xs text-muted-foreground">{es ? "No se han podido cargar tus comentarios." : "Could not load your comments."}</p>}
            {mine.data?.length === 0 && <p className="text-xs text-muted-foreground">{es ? "Aún no has dejado comentarios." : "You haven't left any comments yet."}</p>}
            <ul className="space-y-3">
              {mine.data?.map((row) => <li key={row.id} className="rounded-md border bg-muted/30 p-3 text-sm">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{date(row.created_at)}</span>
                  {row.category && row.category in CATEGORY_LABEL && <Badge variant="outline" className="text-[10px]">{CATEGORY_LABEL[row.category as FeedbackCategory][language]}</Badge>}
                  {row.page_path && <code className="truncate font-mono">{row.page_path}</code>}
                </div>
                <p className="whitespace-pre-wrap break-words">{row.message}</p>
              </li>)}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </DialogContent>
    </Dialog>
  </>;
}
