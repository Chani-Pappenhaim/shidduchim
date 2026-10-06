import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Candidate forms carry a photo and a resume file
    serverActions: { bodySizeLimit: "16mb" },
  },
};

export default nextConfig;
