import type { NextConfig } from "next";
import { basePath } from "./app/site";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  outputFileTracingRoot: process.cwd(),
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
