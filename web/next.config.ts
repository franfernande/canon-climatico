import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // web/ tiene su propio package-lock; sin esto Next toma como raíz el del contrato.
  turbopack: { root: import.meta.dirname },
  // /alquiler/[id] se arma al pedirla y lee data/<red>.json; en Vercel hay que incluirlo en el paquete.
  outputFileTracingIncludes: { "/alquiler/*": ["./data/*.json"] },
};

export default nextConfig;
