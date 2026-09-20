'use client';

import { useEffect, useRef, useState } from 'react';

const LINKS = [
  ['The Group', '#group'],
  ['White-Label', '#white-label'],
  ['Technology', '#technology'],
  ['Products', '#catalogue'],
  ['Process', '#process'],
  ['FAQ', '#faq'],
] as const;

/**
 * Sticky nav that appears once the hero's own header has scrolled away.
 *
 * Hidden at the top of the page on purpose: the hero carries its own masthead,
 * and two sets of navigation on screen at once would undercut the opening shot.
 */
export default function Nav() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const past = y > window.innerHeight * 1.2;
      // Reveal on the way up, hide on the way down — standard, and it keeps the
      // frame clear while the reader is moving forward through the flight.
      setShown(past && (y < lastY.current || y < window.innerHeight * 1.5));
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={
        'fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-500 ' +
        (shown ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0')
      }
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-4 mt-4 rounded-2xl border border-line bg-white px-5 py-3 shadow-[0_14px_40px_-20px_rgba(27,30,25,0.45)] md:mx-8 md:rounded-full">
        <div className="flex items-center justify-between gap-6">
          <a href="#top" className="flex shrink-0 items-center gap-2.5">
            <span className="font-display text-lg leading-none tracking-[0.01em]">VARSHINI</span>
            <span className="hidden h-3.5 w-px bg-line sm:block" />
            <span className="hidden font-serif text-sm italic leading-none text-ink-soft sm:block">
              Fertilizers Pvt Ltd
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-[11px] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-accent"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#start"
              className="rounded-full bg-accent px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-ink"
            >
              Request Callback &rarr;
            </a>
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center gap-[5px] rounded-full border border-line text-ink transition-colors hover:border-accent/60 lg:hidden"
            >
              <span
                className={
                  'block h-[1.5px] w-4 bg-ink transition-transform duration-300 ' +
                  (open ? 'translate-y-[3.25px] rotate-45' : '')
                }
              />
              <span
                className={
                  'block h-[1.5px] w-4 bg-ink transition-transform duration-300 ' +
                  (open ? '-translate-y-[3.25px] -rotate-45' : '')
                }
              />
            </button>
          </div>
        </div>

        {open ? (
          <nav className="grid gap-1 px-1 pb-2 pt-4 lg:hidden">
            {LINKS.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[12px] uppercase tracking-[0.15em] text-ink-soft transition-colors hover:bg-paper-soft hover:text-accent"
              >
                {label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
