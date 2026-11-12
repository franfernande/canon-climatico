import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // web/ tiene su propio package-lock; sin esto Next toma como raíz el del contrato.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
