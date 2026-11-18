import "@testing-library/jest-dom";
import { FEATURES } from "@/config/features";

// The current journey is the baseline for every test; v2 tests switch the flag on themselves.
FEATURES.recorridoV2 = false;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
