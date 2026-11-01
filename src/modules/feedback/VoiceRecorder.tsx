import { useEffect, useRef, useState } from "react";
import { Mic, RotateCcw, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { MAX_VOICE_SECONDS, canRecordVoice, formatSeconds, pickAudioMimeType } from "./voice";

export interface VoiceNote {
  blob: Blob;
  mime: string;
  seconds: number;
}

/**
 * Optional voice note for the feedback form. Hides itself when the browser can't
 * record or the mic is refused, so text feedback is never blocked.
 */
export function VoiceRecorder({ value, onChange }: { value: VoiceNote | null; onChange: (v: VoiceNote | null) => void }) {
  const { language } = useLanguage();
  const es = language === "es";
  const [available, setAvailable] = useState(canRecordVoice);
  const [denied, setDenied] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const started = useRef(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!value) { setUrl(null); return; }
    const u = URL.createObjectURL(value.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [value]);

  const cleanup = () => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(() => () => { if (rec.current?.state === "recording") rec.current.stop(); cleanup(); }, []);

  const stop = () => { if (rec.current?.state === "recording") rec.current.stop(); };

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const mime = pickAudioMimeType((t) => MediaRecorder.isTypeSupported(t));
      const r = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
      chunks.current = [];
      r.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      r.onstop = () => {
        const type = r.mimeType || mime || "audio/webm";
        const seconds = Math.min(MAX_VOICE_SECONDS, Math.round((Date.now() - started.current) / 1000));
        cleanup();
        setRecording(false);
        const blob = new Blob(chunks.current, { type });
        if (blob.size > 0) onChange({ blob, mime: type.split(";")[0], seconds });
      };
      r.start(1000);
      rec.current = r;
      started.current = Date.now();
      setElapsed(0);
      setRecording(true);
      timer.current = window.setInterval(() => {
        const sec = (Date.now() - started.current) / 1000;
        setElapsed(sec);
        if (sec >= MAX_VOICE_SECONDS) stop();
      }, 250);
    } catch (err) {
      cleanup();
      setRecording(false);
      setAvailable(false);
      setDenied((err as DOMException)?.name === "NotAllowedError");
    }
  };

  if (!available) {
    return denied
      ? <p className="text-xs text-muted-foreground">{es ? "No tenemos permiso para usar el micrófono. Puedes escribir tu comentario." : "We don't have permission to use the microphone. You can type your comment instead."}</p>
      : null;
  }

  const limit = formatSeconds(MAX_VOICE_SECONDS);

  if (recording) {
    return <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/40 bg-primary/5 p-3">
      <span className="flex items-center gap-2 text-sm font-medium text-primary">
        <span className="size-2.5 animate-pulse rounded-full bg-destructive" aria-hidden="true" />
        {es ? "Grabando" : "Recording"} <span className="tabular-nums">{formatSeconds(elapsed)}</span>
        <span className="font-normal text-muted-foreground">/ {limit}</span>
      </span>
      <Button type="button" size="sm" onClick={stop} className="gap-1.5"><Square className="size-3.5" /> {es ? "Parar" : "Stop"}</Button>
    </div>;
  }

  if (value && url) {
    return <div className="space-y-2 rounded-md border border-accent/60 bg-accent-soft/30 p-3">
      <p className="flex items-center gap-2 text-xs font-medium text-foreground"><Mic className="size-3.5 text-primary" /> {es ? "Mensaje de voz" : "Voice message"} · <span className="tabular-nums">{formatSeconds(value.seconds)}</span></p>
      <audio controls src={url} className="h-9 w-full" aria-label={es ? "Escuchar tu mensaje de voz" : "Listen to your voice message"} />
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => { onChange(null); void start(); }}><RotateCcw className="size-3.5" /> {es ? "Regrabar" : "Re-record"}</Button>
        <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={() => onChange(null)}><Trash2 className="size-3.5" /> {es ? "Borrar" : "Delete"}</Button>
      </div>
    </div>;
  }

  return <div className="flex flex-wrap items-center gap-3">
    <Button type="button" variant="outline" className="gap-2 rounded-full border-primary/40 text-primary hover:bg-primary/5 hover:text-primary" onClick={() => void start()}>
      <Mic className="size-4" /> {es ? "Grabar mensaje de voz" : "Record a voice message"}
    </Button>
    <span className="text-xs text-muted-foreground">{es ? `Hasta ${limit} min` : `Up to ${limit} min`}</span>
  </div>;
}
