import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function ListeningSources({ es }: { es: boolean }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [lang, setLang] = useState("en");
  const { data: sources = [], error } = useQuery({
    queryKey: ["listen-sources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("listen_sources").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["listen-sources"] }); qc.invalidateQueries({ queryKey: ["listening-forum-count"] }); };
  const add = useMutation({
    mutationFn: async () => {
      const feed = new URL(url.trim());
      if (feed.protocol !== "https:" || !name.trim()) throw new Error(es ? "Indica un nombre y una URL HTTPS." : "Enter a name and an HTTPS URL.");
      const { error } = await supabase.from("listen_sources").insert({ name: name.trim(), feed_url: feed.href, lang, kind: "forum" });
      if (error) throw error;
    },
    onSuccess: () => { setName(""); setUrl(""); refresh(); toast.success(es ? "Fuente añadida" : "Source added"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("listen_sources").update({ active }).eq("id", id);
      if (error) throw error;
    }, onSuccess: refresh, onError: (e: Error) => toast.error(e.message),
  });
  return <section className="space-y-4">
    <h3 className="font-semibold">{es ? "Fuentes de escucha" : "Listening sources"}</h3>
    {error && <p className="text-sm text-destructive">{error.message}</p>}
    <div className="divide-y divide-border">
      {sources.map(s => <div key={s.id} className="flex items-center justify-between gap-4 py-3">
        <div className="min-w-0"><p className="text-sm font-medium">{s.name} · {s.lang.toUpperCase()}</p><a className="text-xs text-primary break-all hover:underline" href={s.feed_url} target="_blank" rel="noopener noreferrer">{s.feed_url}</a></div>
        <Switch aria-label={`${es ? "Activar" : "Activate"} ${s.name}`} checked={s.active} disabled={toggle.isPending} onCheckedChange={active => toggle.mutate({ id: s.id, active })} />
      </div>)}
    </div>
    <form className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={e => { e.preventDefault(); add.mutate(); }}>
      <div className="space-y-1"><Label htmlFor="source-name">{es ? "Nombre" : "Name"}</Label><Input id="source-name" required value={name} onChange={e => setName(e.target.value)} /></div>
      <div className="space-y-1"><Label htmlFor="source-url">{es ? "URL del feed" : "Feed URL"}</Label><Input id="source-url" type="url" required value={url} onChange={e => setUrl(e.target.value)} /></div>
      <div className="space-y-1"><Label>{es ? "Idioma" : "Language"}</Label><Select value={lang} onValueChange={setLang}><SelectTrigger aria-label={es ? "Idioma de la fuente" : "Source language"}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem></SelectContent></Select></div>
      <Button disabled={add.isPending} type="submit"><Plus className="size-4" />{es ? "Añadir fuente" : "Add source"}</Button>
    </form>
  </section>;
}