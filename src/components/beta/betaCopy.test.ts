import { describe, expect, it } from "vitest";
import { BETA_COPY, betaText, shouldInterceptClinicAction } from "./betaCopy";

describe("private beta frame", () => {
  it("uses the exact banner copy in both languages", () => {
    expect(betaText("banner", "es")).toBe("Beta privada · estás probando una versión en pruebas");
    expect(betaText("banner", "en")).toBe("Private beta · you're testing a work-in-progress version");
  });

  it("uses the exact not-active notice in both languages", () => {
    expect(BETA_COPY.notActive.es).toBe(
      "En esta fase de pruebas esto todavía no se activa. Cuando lo esté, te pondremos en contacto con la clínica. De momento lo estamos probando.",
    );
    expect(BETA_COPY.notActive.en).toBe(
      "This isn't active yet during testing. When it is, we'll put you in touch with the clinic. For now we're still trying things out.",
    );
  });

  it("intercepts clinic actions only while the beta flag is on", () => {
    expect(shouldInterceptClinicAction({ betaBanner: true })).toBe(true);
    expect(shouldInterceptClinicAction({ betaBanner: false })).toBe(false);
  });
});
