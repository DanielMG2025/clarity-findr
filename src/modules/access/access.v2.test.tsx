import { describe, expect, it, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { LANGUAGE_KEY } from "@/i18n/translate";

const auth = vi.hoisted(() => ({
  getSession: vi.fn(), getUser: vi.fn(), signOut: vi.fn(), verifyOtp: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
}));
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth, rpc } }));

import { AccessGate } from "./AccessGate";
import { AuthConfirm } from "./AuthConfirm";
import { decodeReturn, encodeReturn, isDefiniteRejection, isOpenPath, safeReturnPath } from "./policy";
import { legacyToConfirm, readCallback } from "./authCallback";
import { FEATURES } from "@/config/features";

const netErr = { status: 0, name: "AuthRetryableFetchError", message: "Failed to fetch" };
const session = { access_token: "x", user: { id: "u1" } };

function gate(path = "/situacion") {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}><LanguageProvider><MemoryRouter initialEntries={[path]}>
      <AccessGate><p>inside</p></AccessGate>
    </MemoryRouter></LanguageProvider></QueryClientProvider>,
  );
}

beforeEach(() => { vi.clearAllMocks(); rpc.mockResolvedValue({ data: false, error: null }); localStorage.setItem(LANGUAGE_KEY, "es"); });
afterEach(() => { cleanup(); localStorage.clear(); FEATURES.recorridoV2 = false; window.history.replaceState(null, "", "/"); });

describe("access · pure helpers", () => {
  it("only 4xx answers count as a real 'no'; a network failure does not", () => {
    expect(isDefiniteRejection({ status: 401 })).toBe(true);
    expect(isDefiniteRejection(netErr)).toBe(false);
    expect(isDefiniteRejection({ status: 503 })).toBe(false);
    expect(isDefiniteRejection(null)).toBe(false);
  });
  it("return paths stay on this site and expire after 30 minutes", () => {
    expect(safeReturnPath("/guia/fiv?x=1")).toBe("/guia/fiv?x=1");
    for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", 42]) expect(safeReturnPath(bad)).toBeNull();
    const raw = encodeReturn("/tu-tratamiento", 1000);
    expect(decodeReturn(raw, 1000 + 29 * 60_000)).toBe("/tu-tratamiento");
    expect(decodeReturn(raw, 1000 + 31 * 60_000)).toBeNull();
  });
  it("reads the sign-in link: token waits for a tap, errors and sessions are recognised", () => {
    expect(readCallback("?token_hash=abc&type=magiclink", "")).toEqual({ kind: "token", tokenHash: "abc", type: "magiclink" });
    expect(readCallback("?token_hash=abc&type=weird", "")).toEqual({ kind: "token", tokenHash: "abc", type: "email" });
    expect(readCallback("", "#error_code=otp_expired")).toEqual({ kind: "error", code: "otp_expired" });
    expect(readCallback("", "#access_token=t")).toEqual({ kind: "session" });
    expect(legacyToConfirm("?access_token_hash=h1")).toBe("/auth/confirmar?token_hash=h1&type=email");
  });
  it("the sign-in link page is open without access", () => {
    expect(isOpenPath("/auth/confirmar")).toBe(true);
    expect(isOpenPath("/auth/confirmar/")).toBe(true);
  });
});

describe("access gate · a dropped connection is not a sign-out", () => {
  it("network failure while checking the user keeps the session and never signs out", async () => {
    auth.getSession.mockResolvedValue({ data: { session }, error: null });
    auth.getUser.mockResolvedValue({ data: { user: null }, error: netErr });
    gate();
    await screen.findByText(/No podemos comprobar tu acceso ahora/);
    expect(auth.signOut).not.toHaveBeenCalled();
  });
  it("network failure refreshing the session is retried, not treated as 'no session'", async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: netErr });
    gate();
    await screen.findByText(/No podemos comprobar tu acceso ahora/);
    expect(screen.getByRole("button", { name: "Volver a intentar" })).toBeTruthy();
    expect(auth.signOut).not.toHaveBeenCalled();
  });
  it("lets a signed-in person with access in", async () => {
    auth.getSession.mockResolvedValue({ data: { session }, error: null });
    auth.getUser.mockResolvedValue({ data: { user: session.user }, error: null });
    rpc.mockResolvedValue({ data: true, error: null });
    gate();
    expect(await screen.findByText("inside")).toBeTruthy();
  });
  it("journey v2 pages open without an account only when the flag is on", async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    FEATURES.recorridoV2 = true;
    gate("/empezar");
    expect(screen.getByText("inside")).toBeTruthy();
    cleanup();
    FEATURES.recorridoV2 = false;
    gate("/empezar");
    expect(screen.queryByText("inside")).toBeNull();
  });
});

describe("/auth/confirmar · verifies only on tap", () => {
  it("does not spend the link on load; verifies when the button is pressed", async () => {
    window.history.replaceState(null, "", "/auth/confirmar?token_hash=abc&type=magiclink");
    auth.verifyOtp.mockResolvedValue({ error: null });
    render(<LanguageProvider><MemoryRouter><AuthConfirm /></MemoryRouter></LanguageProvider>);
    expect(auth.verifyOtp).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("auth-confirm-enter"));
    await waitFor(() => expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "abc", type: "magiclink" }));
  });
});
