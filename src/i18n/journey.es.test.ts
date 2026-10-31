import { describe, it, expect } from "vitest";
import { translate } from "./translate";

const es = (s: string) => translate(s, "es");

describe("journey Spanish patterns", () => {
  it("translates age-dependent factor copy", () => {
    expect(es("At 31, age is on your side: it's the factor that most influences outcomes.")).toBe("Con 31 años, la edad juega a tu favor: es el factor que más influye en los resultados.");
  });
  it("translates regulatory verdicts with country and article", () => {
    expect(es("In Germany, egg donation is not available for your situation under the current legal framework.")).toBe("En Alemania, la ovodonación no está disponible para tu situación con el marco legal actual.");
    expect(es("In Italy there are 1 option(s) out of your reach. We show you where they would be available.")).toBe("En Italia hay 1 opción fuera de tu alcance. Te mostramos dónde estaría disponible.");
  });
  it("translates country lists and leaves other text alone", () => {
    expect(es("Belgium, Netherlands and France")).toBe("Bélgica, Países Bajos y Francia");
    expect(es("Salt and Pepper")).toBe("Salt and Pepper");
  });
  it("keeps English unchanged", () => {
    expect(translate("Favorable age", "en")).toBe("Favorable age");
  });
});
