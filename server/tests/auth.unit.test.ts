import { describe, expect, test } from "bun:test";
import { createSessionToken, hashPassword, verifyPassword } from "../src/lib/auth.js";

describe("auth helpers", () => {
  test("hashPassword and verifyPassword round-trip valid credentials", async () => {
    const password = "earthco-secure-pass";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  test("createSessionToken returns unique, hex-encoded tokens", () => {
    const tokens = Array.from({ length: 20 }, () => createSessionToken());

    for (const token of tokens) {
      expect(token).toHaveLength(96);
      expect(token).toMatch(/^[a-f0-9]+$/);
    }

    expect(new Set(tokens).size).toBe(tokens.length);
  });
});
