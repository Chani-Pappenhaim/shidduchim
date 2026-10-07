import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The engaged couples page used to be called "successes"
  async redirects() {
    return [{ source: "/successes", destination: "/engagements", permanent: true }];
  },
  experimental: {
    // Candidate forms carry a photo and a resume file
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default nextConfig;
