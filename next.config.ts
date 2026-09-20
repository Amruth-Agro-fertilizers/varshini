import type { NextConfig } from 'next';
import path from 'node:path';

/**
 * Sub-path the site is served from.
 *
 * Empty locally, `/varshini` on GitHub Pages, where a project site lives under
 * the repository name rather than at the domain root. Supplied by the deploy
 * workflow rather than hard-coded, so `npm run dev` and a preview on any other
 * host still work unprefixed.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  /**
   * Pages can only serve files. Without this, `next build` produces a server
   * application that nothing on Pages knows how to run — which is why the
   * branch published its own README instead of a site.
   */
  output: 'export',

  basePath,

  images: {
    // The image optimiser is a server route, and there is no server. Next
    // refuses to export at all unless this is set.
    unoptimized: true,
  },

  // The parent folder holds the previous Vite prototype and its own lockfile;
  // pin the root so Next infers this app rather than the directory above it.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
