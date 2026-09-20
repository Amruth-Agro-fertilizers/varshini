import type { ReactNode } from 'react';

/**
 * Card used for copy that sits over the photography.
 *
 * Solid white, with real edges and a soft shadow — no backdrop blur. Blurring
 * the plate behind a panel smeared the photograph and left the card looking
 * muddy; an opaque surface keeps both the copy and the image behind it sharp.
 */
export default function GlassCard({
  eyebrow,
  title,
  children,
  className = '',
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={'card p-6 md:p-8 ' + className}>
      <p className="text-[length:var(--text-eyebrow)] uppercase tracking-[0.25em] text-accent">
        {eyebrow}
      </p>
      <h3 className="mt-3 font-display text-xl leading-[1.05] tracking-tight text-ink md:text-2xl">
        {title}
      </h3>
      <div className="mt-4 space-y-3 text-[13px] leading-relaxed text-ink-soft md:text-sm">
        {children}
      </div>
    </article>
  );
}
