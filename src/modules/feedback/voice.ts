// Voice-note helpers for beta feedback (pure, so they can be tested without a browser mic).

export const AUDIO_BUCKET = "beta-feedback-audio";
/** Longest voice note a tester can record, in seconds. */
export const MAX_VOICE_SECONDS = 180;

// Ordered by preference: Chrome/Firefox/Android take webm/opus; Safari/iOS takes mp4/aac.
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/aac", "audio/ogg;codecs=opus"];

export function pickAudioMimeType(isSupported: (type: string) => boolean): string | undefined {
  return MIME_CANDIDATES.find((t) => { try { return isSupported(t); } catch { return false; } });
}

export function audioExtension(mime: string): string {
  if (mime.includes("mp4") || mime.includes("aac")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

export function canRecordVoice(): boolean {
  return typeof window !== "undefined"
    && typeof window.MediaRecorder !== "undefined"
    && !!navigator.mediaDevices?.getUserMedia;
}

/** A submission is valid with text, a voice note, or both. */
export function canSubmitFeedback(message: string, hasVoice: boolean): boolean {
  return message.trim().length > 0 || hasVoice;
}

/** Storage path inside the sender's own folder (enforced by storage and database rules). */
export function audioPathFor(userId: string, id: string, mime: string): string {
  return `${userId}/${id}.${audioExtension(mime)}`;
}

export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
