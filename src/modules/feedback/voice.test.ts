import { describe, expect, it } from "vitest";
import { MAX_VOICE_SECONDS, audioExtension, audioPathFor, canSubmitFeedback, formatSeconds, pickAudioMimeType } from "./voice";

describe("voice feedback rules", () => {
  it("accepts text only, voice only, or both — but not neither", () => {
    expect(canSubmitFeedback("Hola", false)).toBe(true);
    expect(canSubmitFeedback("", true)).toBe(true);
    expect(canSubmitFeedback("Hola", true)).toBe(true);
    expect(canSubmitFeedback("   ", false)).toBe(false);
  });

  it("caps voice notes at 3 minutes", () => {
    expect(MAX_VOICE_SECONDS).toBe(180);
    expect(formatSeconds(MAX_VOICE_SECONDS)).toBe("3:00");
  });

  it("stores notes inside the sender's own folder", () => {
    expect(audioPathFor("user-1", "abc", "audio/mp4")).toBe("user-1/abc.m4a");
    expect(audioPathFor("user-1", "abc", "audio/webm").startsWith("user-1/")).toBe(true);
  });

  it("prefers webm/opus, falls back to mp4 for Safari, or none", () => {
    expect(pickAudioMimeType(() => true)).toBe("audio/webm;codecs=opus");
    expect(pickAudioMimeType((t) => t === "audio/mp4")).toBe("audio/mp4");
    expect(pickAudioMimeType(() => false)).toBeUndefined();
    expect(audioExtension("audio/ogg")).toBe("ogg");
  });
});
