import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['@xenova/transformers', 'onnxruntime-node'],
};

export default nextConfig;
