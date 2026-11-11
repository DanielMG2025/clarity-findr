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
}

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
};

export type FeatureFlag = keyof FeatureFlags;

export const isEnabled = (flag: FeatureFlag): boolean => FEATURES[flag] === true;

/** Where a switched-off surface sends the visitor. */
export const FLAG_FALLBACK_PATH = "/";
