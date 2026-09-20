'use client';

import Backdrop from '../Backdrop';
import SectionSet from '../SectionSet';
import type { SectionKey } from '@/lib/scroll-progress';

/**
 * A section whose 3D content is just its backdrop.
 *
 * The camera's own flight supplies the motion, so a section carrying mostly
 * copy needs nothing more than the right plate behind it.
 */
export default function SimpleSet({
  section,
  src,
  tint = '#ffffff',
}: {
  section: SectionKey;
  src: string;
  tint?: string;
}) {
  return (
    <SectionSet section={section}>
      <Backdrop section={section} src={src} tint={tint} />
    </SectionSet>
  );
}
