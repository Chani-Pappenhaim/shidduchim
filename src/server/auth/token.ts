import { jwtVerify, SignJWT } from "jose";

export type TokenKind = "matchmaker" | "portal";

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET);

// Signs a short JWT identifying a subject of the given kind
export async function signToken(kind: TokenKind, subject: string, ttlSeconds: number): Promise<string> {
  return new SignJWT({ kind })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secret());
}

// Returns the subject if the token is valid and of the expected kind
export async function verifyToken(token: string | undefined, kind: TokenKind): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.kind === kind && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
