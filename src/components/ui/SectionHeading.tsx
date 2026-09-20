import type { ReactNode } from 'react';

/**
 * The shared section opening: eyebrow, display headline with a serif accent
 * line, and intro copy. Every section leads the same way, which is what keeps
 * eight very different layouts reading as one document.
 */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p
        data-reveal
        className="text-[length:var(--text-eyebrow)] uppercase tracking-[0.3em] text-accent"
      >
        {eyebrow}
      </p>
      <h2
        data-reveal
        className="mt-6 font-display text-[length:var(--text-huge)] leading-[0.95] tracking-tight"
      >
        {title}
        {accent ? (
          <>
            <br />
            <span className="font-serif font-normal italic tracking-normal text-accent">
              {accent}
            </span>
          </>
        ) : null}
      </h2>
      {children ? (
        <div data-reveal className="mt-8 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
          {children}
        </div>
      ) : null}
    </div>
  );
}
