import { jwtVerify, SignJWT } from "jose";

export type TokenKind = "matchmaker" | "portal";

export type TokenClaims = { subject: string; version: number };

const MIN_SECRET_LENGTH = 32;

// Fails closed: without a strong secret no token can be signed or verified
function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET ?? "";
  if (value.length < MIN_SECRET_LENGTH) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(value);
}

// Signs a JWT identifying a subject of the given kind; the version lets the server revoke older tokens
export async function signToken(kind: TokenKind, subject: string, ttlSeconds: number, version = 0): Promise<string> {
  return new SignJWT({ kind, v: version })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret());
}

export async function readToken(token: string | undefined, kind: TokenKind): Promise<TokenClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.kind !== kind || !payload.sub) return null;
    return { subject: payload.sub, version: typeof payload.v === "number" ? payload.v : 0 };
  } catch {
    return null;
  }
}

// Returns the subject if the token is valid and of the expected kind
export async function verifyToken(token: string | undefined, kind: TokenKind): Promise<string | null> {
  return (await readToken(token, kind))?.subject ?? null;
}
