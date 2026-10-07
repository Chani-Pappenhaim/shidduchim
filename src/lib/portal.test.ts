import { describe, expect, it } from "vitest";
import { canResendCode, checkCode, codeExpiry, maskEmail, MAX_CODE_ATTEMPTS } from "./portal";

const now = new Date("2026-10-07T10:00:00Z");
const stored = { otpHash: "abc", otpExpiresAt: codeExpiry(now), otpAttempts: 0 };

describe("checkCode", () => {
  it("accepts the right code and rejects a wrong one", () => {
    expect(checkCode(stored, "abc", now)).toBe("ok");
    expect(checkCode(stored, "xyz", now)).toBe("wrong");
  });

  it("treats a missing or old code as expired", () => {
    expect(checkCode({ ...stored, otpHash: null }, "abc", now)).toBe("expired");
    expect(checkCode(stored, "abc", new Date(now.getTime() + 11 * 60_000))).toBe("expired");
  });

  it("locks after too many attempts, even for the right code", () => {
    expect(checkCode({ ...stored, otpAttempts: MAX_CODE_ATTEMPTS }, "abc", now)).toBe("locked");
  });
});

describe("canResendCode", () => {
  it("waits a minute between codes", () => {
    const expiresAt = codeExpiry(now);
    expect(canResendCode(null, now)).toBe(true);
    expect(canResendCode(expiresAt, new Date(now.getTime() + 30_000))).toBe(false);
    expect(canResendCode(expiresAt, new Date(now.getTime() + 60_000))).toBe(true);
  });
});

describe("maskEmail", () => {
  it("keeps the start of the address and the domain", () => {
    expect(maskEmail("rachel@example.com")).toBe("ra•••@example.com");
    expect(maskEmail("r@example.com")).toBe("r•••@example.com");
  });
});
