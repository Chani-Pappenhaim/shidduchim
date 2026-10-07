import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/server/auth/cookie-names";
import { verifyToken } from "@/server/auth/token";

const AUTH_PAGES = ["/login", "/register"];

// Keeps signed-out visitors out of the workspace and signed-in ones off the auth pages
export async function middleware(request: NextRequest) {
  const signedIn = !!(await verifyToken(request.cookies.get(SESSION_COOKIE)?.value, "matchmaker"));
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!signedIn && !isAuthPage) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (signedIn && isAuthPage) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/candidates/:path*",
    "/introductions/:path*",
    "/engagements/:path*",
    "/weddings/:path*",
    "/reminders/:path*",
    "/profile/:path*",
  ],
};
