'use client';

import type { ReactNode } from 'react';
import { sectionOrigin } from '@/lib/journey';
import type { SectionKey } from '@/lib/scroll-progress';

/**
 * Positions a section's 3D content in its own slab of world space.
 *
 * Sets are always mounted. Each one's backdrop occludes everything behind it,
 * so a set the camera has not reached yet costs a draw call and nothing more,
 * and the reveal as one backdrop fades to show the next is free.
 */
export default function SectionSet({
  section,
  children,
}: {
  section: SectionKey;
  children: ReactNode;
}) {
  return <group position={[0, 0, sectionOrigin(section)]}>{children}</group>;
}
