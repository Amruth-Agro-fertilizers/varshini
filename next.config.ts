import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // The parent folder holds the previous Vite prototype and its own lockfile;
  // pin the root so Next infers this app rather than the directory above it.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
