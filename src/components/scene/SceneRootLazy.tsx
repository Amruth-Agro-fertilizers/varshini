'use client';

import dynamic from 'next/dynamic';

/**
 * Client-only boundary for the WebGL layer.
 *
 * `ssr: false` is only permitted inside a Client Component, and the canvas has
 * nothing to contribute to the server pass anyway — the first paint is the flat
 * forest-green ground, which is the intended opening frame.
 */
const SceneRoot = dynamic(() => import('./SceneRoot'), { ssr: false });

export default function SceneRootLazy() {
  return <SceneRoot />;
}
