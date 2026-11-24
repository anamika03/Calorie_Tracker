import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets e2e builds use a separate folder so they don't clash with `npm run dev`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
