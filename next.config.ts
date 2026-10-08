import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import path from "node:path";

const isProd = process.env.NODE_ENV === "production";

// Locks the pages to this site's own scripts, styles and images
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self' https://accounts.google.com",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  // Only over HTTPS; on localhost it would push the browser to an https:// address that does not exist
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Lets the dev server be opened as 127.0.0.1 as well as localhost
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Invite links carry a secret token that must not leak to other sites
      { source: "/portal/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
    ];
  },
  // The engaged couples page used to be called "successes"
  async redirects() {
    return [
      { source: "/successes", destination: "/engagements", permanent: true },
      // The workspace is the home page; signed-out visitors continue on to the login page
      { source: "/", destination: "/dashboard", permanent: false },
    ];
  },
  // The Prisma query engine is a Workers wasm module; leave it for the Workers bundler to load
  webpack(config, { isServer, nextRuntime }) {
    if (isServer && nextRuntime === "nodejs") {
      config.externals.push(
        ({ context, request }: { context?: string; request?: string }, callback: (err?: Error, result?: string) => void) =>
          request?.endsWith(".wasm?module") && context
            ? callback(undefined, `commonjs ${path.resolve(context, request).replaceAll("\\", "/")}`)
            : callback(),
      );
    }
    return config;
  },
  experimental: {
    // Candidate forms carry a photo and a resume file
    serverActions: { bodySizeLimit: "16mb" },
    // Tabs visited in the last half minute reopen instantly; every save still refreshes them
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;

// Gives `next dev` the local D1 database and KV namespace from wrangler.jsonc
initOpenNextCloudflareForDev();
