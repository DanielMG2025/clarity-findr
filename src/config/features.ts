/**
 * Feature flags — hide, never delete. Every flag defaults TRUE: this is a
 * control surface, not a way to hide anything today. Flip one to false only
 * to deliberately take a surface down.
 */
export interface FeatureFlags {
  discover: boolean;
  demoRoom: boolean;
  costsLab: boolean;
  sourcesDossier: boolean;
  referenceLibrary: boolean;
  community: boolean;
  guidancePage: boolean;
  accountArea: boolean;
  clinicSide: boolean;
  widgets: boolean;
  feedback: boolean;
  accessGate: boolean;
  /** Private-beta ribbon + "not active yet" notices on clinic contact/booking actions. */
  betaBanner: boolean;
  /** /unirse signs invited testers in directly (name + email, no email wait). Off = magic link only. */
  noEmailBetaJoin: boolean;
  /** "Continue with Google" on the access screen. Off hides the button only. */
  googleSignIn: boolean;
  /**
   * Patient journey v2: one-screen landing → how it works → the basics → what you
   * need → the guide in two layers → prepare your treatment, open without an account.
   * Off = every current route and page exactly as before.
   */
  recorridoV2: boolean;
}

/**
 * v2 is on in the preview (and local dev) only; on the published site and any
 * custom domain it stays off until someone sets this to `true` deliberately.
 */
export function isPreviewHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("id-preview--") || hostname.endsWith(".lovableproject.com");
}
export const RECORRIDO_V2_DEFAULT: boolean = typeof window !== "undefined" && isPreviewHost(window.location.hostname);

export const FEATURES: FeatureFlags = {
  discover: true,
  demoRoom: true,
  costsLab: true,
  sourcesDossier: true,
  referenceLibrary: true,
  community: true,
  guidancePage: true,
  accountArea: true,
  clinicSide: true,
  widgets: true,
  feedback: true,
  accessGate: true,
  betaBanner: true,
  noEmailBetaJoin: true,
  googleSignIn: true,
  recorridoV2: RECORRIDO_V2_DEFAULT,
};

export type FeatureFlag = keyof FeatureFlags;

export const isEnabled = (flag: FeatureFlag): boolean => FEATURES[flag] === true;

/** Where a switched-off surface sends the visitor. */
export const FLAG_FALLBACK_PATH = "/";
