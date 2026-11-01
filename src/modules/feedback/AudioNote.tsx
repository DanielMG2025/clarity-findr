import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { AUDIO_BUCKET } from "./voice";

/** Plays a stored voice note through a short-lived signed URL (the bucket is private). */
export function AudioNote({ path }: { path: string }) {
  const { language } = useLanguage();
  const es = language === "es";
  const signed = useQuery({
    queryKey: ["beta-feedback-audio", path],
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(AUDIO_BUCKET).createSignedUrl(path, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });
  if (signed.isLoading) return <p role="status" className="text-xs text-muted-foreground">{es ? "Cargando audio…" : "Loading audio…"}</p>;
  if (!signed.data) return <p className="text-xs text-muted-foreground">{es ? "No se ha podido cargar el audio." : "Could not load the audio."}</p>;
  return <audio controls preload="metadata" src={signed.data} className="h-9 w-full max-w-md" aria-label={es ? "Mensaje de voz" : "Voice message"} />;
}
