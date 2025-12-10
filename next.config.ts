import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Note: Next.js 16 with Turbopack shows a deprecation warning about middleware.
  // This is a known Turbopack quirk - middleware.ts is still the correct and
  // supported way to implement middleware in Next.js. The warning can be safely ignored.
};

export default nextConfig;
