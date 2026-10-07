import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The engaged couples page used to be called "successes"
  async redirects() {
    return [
      { source: "/successes", destination: "/engagements", permanent: true },
      // The workspace is the home page; signed-out visitors continue on to the login page
      { source: "/", destination: "/dashboard", permanent: false },
    ];
  },
  experimental: {
    // Candidate forms carry a photo and a resume file
    serverActions: { bodySizeLimit: "16mb" },
    // Tabs visited in the last half minute reopen instantly; every save still refreshes them
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
