import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LANGUAGE_KEY } from "@/i18n/translate";
import { ClinicCardV2 } from "@/components/shared/ClinicCardV2";
import { BetaBanner } from "./BetaBanner";
import { TooltipProvider } from "@/components/ui/tooltip";

const clinic = { id: "c1", name: "Clinic 1", country: "Spain", estimatedPrice: 6000, matchScore: 90, highlights: ["A"], reason: "Fits." };

afterEach(() => { cleanup(); localStorage.clear(); });

describe("beta notices", () => {
  it("shows the Spanish ribbon", () => {
    localStorage.setItem(LANGUAGE_KEY, "es");
    render(<LanguageProvider><BetaBanner /></LanguageProvider>);
    expect(screen.getByText("Beta privada · estás probando una versión en pruebas")).toBeTruthy();
  });

  it("requesting an appointment shows the notice instead of the contact form", () => {
    render(<LanguageProvider><TooltipProvider><ClinicCardV2 clinic={clinic} /></TooltipProvider></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: /Request appointment/ }));
    expect(screen.getByText(/This isn't active yet during testing/)).toBeTruthy();
    expect(screen.queryByText("Send request")).toBeNull();
  });
});
