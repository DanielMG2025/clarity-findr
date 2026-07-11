import { describe, it, expect } from "vitest";
import { DEMO_PATIENTS } from "./demoPatients";
import { demoPatientMapping } from "./toStores";

const byKey = (k: string) => DEMO_PATIENTS.find((p) => p.key === k)!;

describe("demoPatientMapping", () => {
  it("maps identity, intent and country code to the profile store shape", () => {
    const m = demoPatientMapping(byKey("nadia_40_tubarico"));
    expect(m.profile.age).toBe(40);
    expect(m.profile.country).toBe("Spain"); // ES -> canonical label
    expect(m.profile.treatment).toBe("ivf");
    expect(m.profile.trying).toBe(">2y"); // over_2y -> ">2y"
    expect(m.profile.priorFailedCycles).toBe(2);
    expect(m.preferences.donor_openness).toBe("maybe");
  });

  it("translates the treatment vocabulary", () => {
    expect(demoPatientMapping(byKey("lucia_42_donante")).profile.treatment).toBe("donor");
    expect(demoPatientMapping(byKey("paula_33_freezing")).profile.treatment).toBe("freezing");
    expect(demoPatientMapping(byKey("elena_36_factor_masc")).profile.treatment).toBe("icsi");
  });

  it("maps clinical fields and infers male factor into sperm quality", () => {
    const elena = demoPatientMapping(byKey("elena_36_factor_masc"));
    expect(elena.medical.amh).toBe(2.1);
    expect(elena.medical.afc).toBe(12);
    expect(elena.medical.diagnosis).toContain("Male factor");
    expect(elena.medical.partner_sperm_quality).toBe("severe");

    const nadia = demoPatientMapping(byKey("nadia_40_tubarico"));
    expect(nadia.medical.partner_sperm_quality).toBeUndefined();
  });

  it("expands prior cycles into history and leaves sparse profiles empty", () => {
    expect(demoPatientMapping(byKey("nadia_40_tubarico")).history).toHaveLength(2);
    const sofia = demoPatientMapping(byKey("sofia_34_pocos_datos"));
    expect(sofia.history).toHaveLength(0);
    expect(sofia.profile.treatment).toBe(""); // no treatment_interest
  });
});
