import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The engaged couples page used to be called "successes"
  async redirects() {
    return [{ source: "/successes", destination: "/engagements", permanent: true }];
  },
  experimental: {
    // Candidate forms carry a photo and a resume file
    serverActions: { bodySizeLimit: "16mb" },
    // Tabs visited in the last half minute reopen instantly; every save still refreshes them
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
