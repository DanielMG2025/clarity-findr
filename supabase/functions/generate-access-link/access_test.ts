import { accessBody, accessOrigin } from "../_shared/access.ts";

Deno.test("normalizes emails and rejects invalid addresses", () => {
  const parsed = accessBody.parse({ email: " DANIELMUNOZ2005@gmail.com " });
  if (parsed.email !== "danielmunoz2005@gmail.com") throw new Error("Email must be lowercase");
  if (accessBody.safeParse({ email: "not-an-email" }).success) throw new Error("Invalid email accepted");
});
Deno.test("never redirects access credentials to an untrusted origin", () => {
  if (accessOrigin("https://attacker.example") !== "https://clarity-findr.lovable.app") throw new Error("Untrusted redirect accepted");
  if (accessOrigin("http://localhost:8080") !== "http://localhost:8080") throw new Error("Local verification origin rejected");
});