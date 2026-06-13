import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@seventec-atlas/db",
    "@seventec-atlas/domain",
    "@seventec-atlas/scoring-core",
    "@seventec-atlas/ai-contracts",
    "@seventec-atlas/ui",
  ],
};

export default nextConfig;

