'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GlassCard from '@/components/ui/GlassCard';
import RibbonGlow from '@/components/ui/RibbonGlow';
import Interlude from '@/components/ui/Interlude';
import { useSectionProgress } from '@/lib/useSectionProgress';

gsap.registerPlugin(ScrollTrigger);

const AMRUTH_BULLETS = [
  'Awarded for production performance, workplace culture & safety standards',
  'Recognised for contributions to community and environment',
  'Continuously expanding the product portfolio',
];

const DETAILS = [
  ['Plant', 'Malladihalli, Holalkere TQ, Chitradurga Dist, Karnataka'],
  ['From Chitradurga', '~40 km'],
  ['From Bengaluru', '~245 km'],
  ['Serving', 'Karnataka · Andhra Pradesh · Telangana · Tamil Nadu · Kerala'],
] as const;

/**
 * Section 02 — The Group.
 *
 * Copy is verbatim from the project brief. The card block pins from 1024px up,
 * where two columns of this much copy fit a screen with room to breathe. Below
 * that the cards run in normal flow — pinning them would only make a scroll
 * trap around content taller than the viewport.
 */
export default function Group() {
  const root = useRef<HTMLElement>(null);
  const cards = useRef<HTMLDivElement>(null);
  /**
   * How far through its beat the intro card's artwork is.
   *
   * A ref written by ScrollTrigger and read by the artwork's own frame loop,
   * so the scroll reaches the shader without a React render in between.
   */
  const glow = useRef(0);
  /** The empty stretch the intro card is shown across. */
  const beat = useRef<HTMLDivElement>(null);

  useSectionProgress(root, 'group');

  useEffect(() => {
    const ctx = gsap.context(() => {
      /*
       * The card waits for the weather, then leaves before the wipe.
       *
       * Scrubbed across its own window rather than fired once. The crossing
       * into this section is a long cloud, and a card triggered on scrolling
       * into view arrives while the frame is still white — copy on a blank
       * field, with the plant it describes not yet uncovered. It is shown once
       * the bank has lifted and retired as the aerial starts wiping away, so
       * it is only ever on screen while the shot it belongs to is.
       */
      const window_ = { trigger: beat.current, start: 'top bottom', end: 'bottom top' };

      const intro = gsap.timeline({ scrollTrigger: { ...window_, scrub: 0.6 } });

      // Same window as the card's own life, so the artwork starts its move as
      // the card arrives and finishes it as the card goes.
      ScrollTrigger.create({
        ...window_,
        onUpdate: (self) => {
          glow.current = self.progress;
        },
      });
      gsap.set('[data-group-intro]', { opacity: 0, y: 48 });
      intro.to('[data-group-intro]', { opacity: 1, y: 0, duration: 0.2, ease: 'power3.out' }, 0.06);
      intro.to('[data-group-intro]', { opacity: 0, y: -34, duration: 0.16, ease: 'power2.in' }, 0.8);
      intro.set({}, {}, 1);

      // Pinned card choreography — desktop only.
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: cards.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        });

        gsap.set('[data-card="amruth"]', { opacity: 0, y: 70 });
        gsap.set('[data-connector]', { opacity: 0, scaleX: 0.3 });
        gsap.set('[data-card="varshini"]', { opacity: 0, y: 70 });

        tl.to('[data-card="amruth"]', { opacity: 1, y: 0, duration: 1 })
          .to('[data-connector]', { opacity: 1, scaleX: 1, duration: 0.6 }, '>-0.25')
          .to('[data-card="varshini"]', { opacity: 1, y: 0, duration: 1 }, '>-0.3')
          .to({}, { duration: 0.8 });
      });

      gsap.set('[data-detail-row]', { opacity: 0, y: 24 });
      gsap.to('[data-detail-row]', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: '[data-detail-strip]', start: 'top 88%', once: true },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="group" className="relative">
      {/* Held long on purpose. The camera comes out of the cloud onto the
          plant, and this is the stretch where that shot is simply itself
          before any copy is laid over it. */}
      <Interlude caption="Section 01 · Inside the plant" height="h-[120vh]" />

      {/* Intro.
          The copy sits on a card over the aerial rather than bare on a scrim.
          A scrim has to be tuned against whatever happens to be behind it —
          and behind this is a photograph that moves — so it was forever either
          too weak to read against or heavy enough to draw its own edges across
          the frame. A card carries its own contrast and needs no tuning.

          Pinned in a zero-height sticky layer rather than laid out in flow. In
          flow its time on screen is whatever its own height and the viewport
          happen to add up to — here about a third of the section, ending well
          before the plant view was even clear of cloud, so by the time the
          reveal fired the card had already gone past. A sticky box of no height
          holds for the whole section, which lets the card be shown and retired
          on the beats that matter rather than on where it happens to sit. */}
      <div className="pointer-events-none sticky top-0 z-20 h-0">
        <div className="relative h-screen w-full px-6 md:px-12">
          <div
            data-group-intro
            className="card pointer-events-auto absolute top-1/2 w-full max-w-5xl -translate-y-1/2 overflow-hidden p-9 md:p-16"
          >
            {/* Artwork, not decoration on top of the words: it sits behind the
                copy and carries the card's own surface. Brand greens on white
                rather than the shipped neon on black, so the ink over it keeps
                its contrast. */}
            <RibbonGlow
              className="pointer-events-none"
              style={{ position: 'absolute', inset: 0 }}
              background="#ffffff"
              color1="#2f6b3c"
              color2="#9ad24e"
              speed={34}
              size={104}
              angle={-152}
              hover={70}
              reach={300}
              progress={() => glow.current}
            />

            <div className="relative">
            <p className="text-[length:var(--text-eyebrow)] uppercase tracking-[0.3em] text-accent">
              01 — The Group
            </p>
            <h2 className="mt-6 font-display text-[length:var(--text-huge)] leading-[0.95] tracking-tight">
              Two companies.
              <br />
              <span className="font-serif font-normal italic tracking-normal text-accent">
                One plant behind them.
              </span>
            </h2>
            <p className="mt-9 max-w-3xl text-lg leading-relaxed text-ink-soft md:text-xl">
              Amruth Groups has spent more than a decade building one of South India&rsquo;s larger
              agro-biotechnology manufacturing units. Varshini is the arm that opens that capacity
              up to retailers who want to sell under their own name.
            </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll length for the beat above, which takes no layout of its own.
          The card's window is anchored to this rather than to a percentage of
          the section, and that distinction matters: the card is pinned, so it
          floats over whatever scrolls up behind it, and a percentage window
          kept it on screen into the company cards — their copy showing past
          its edges. Tied to the spacer, the card lives exactly as long as the
          empty stretch reserved for it, whatever the section's height does. */}
      <div ref={beat} className="h-[110vh]" aria-hidden="true" />

      {/* Cards — pinned on desktop, stacked in flow on mobile */}
      <div ref={cards} className="relative lg:h-[240vh]">
        <div className="flex flex-col justify-center px-6 py-12 lg:sticky lg:top-0 lg:h-screen lg:px-12 lg:py-0">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-5">
            <div data-card="amruth">
              <GlassCard eyebrow="Parent · Manufacturing" title="Amruth Organic Fertilizers">
                <p>
                  The flagship company, spread across a 30+ acre premise at Malladihalli, Holalkere
                  Taluk, Chitradurga District, Karnataka &mdash; about 40 km from Chitradurga and
                  245 km from Bengaluru.
                </p>
                <p>
                  It manufactures the full bio range: bio-fertilizers, bio-pesticides, organic
                  manure, phosphorous-rich organic manure, bio potash derived from molasses, soil
                  conditioner, neem-based organic manure, growth promoters, micronutrients and coco
                  pith.
                </p>
                <ul className="mt-4 space-y-2 border-t border-line pt-4">
                  {AMRUTH_BULLETS.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-accent" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>

            {/* Connector */}
            <div
              data-connector
              className="flex items-center justify-center gap-3 lg:w-36 lg:flex-col lg:gap-2"
            >
              <span className="h-px w-10 bg-accent/50 lg:h-10 lg:w-px" />
              <span className="text-center text-[10px] uppercase leading-tight tracking-[0.2em] text-ink-faint">
                supplies &amp;
                <br className="hidden lg:block" /> manufactures for
              </span>
              <span className="h-px w-10 bg-accent/50 lg:h-10 lg:w-px" />
            </div>

            <div data-card="varshini">
              <GlassCard
                eyebrow="Subsidiary · White-Label Supply"
                title="Varshini Fertilizers Pvt Ltd"
                className="border-accent/40 bg-accent-soft"
              >
                <p>
                  Varshini manufactures an array of NPK &amp; water-soluble fertilizers and takes
                  the group&rsquo;s complete organic range to market in a very specific way &mdash;
                  without a brand label on it.
                </p>
                <p>
                  Retailers, agri-input dealers, distributors and FPOs buy finished, tested, packed
                  product and put their own brand name, logo and MRP on it. No factory. No R&amp;D
                  team. No minimum-crore investment. Just your label on a product that is already
                  made at scale.
                </p>
                <a
                  href="#white-label"
                  className="mt-4 inline-block border-b border-accent/45 pb-0.5 text-sm text-accent transition-colors hover:border-accent"
                >
                  See exactly what you get &rarr;
                </a>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

      {/* Detail strip */}
      {/* Detail strip.
          Cards over the plant rather than a list on paper. The flat version sat
          on an opaque block that shut the photography off for the last screen
          of the section, which threw away the one thing the section has been
          building — so each fact now floats on the floor it describes. */}
      <div data-detail-strip className="relative px-6 pb-28 pt-16 md:px-12">
        <dl className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DETAILS.map(([label, value]) => (
            <div key={label} data-detail-row className="card p-5">
              <dt className="text-[length:var(--text-eyebrow)] uppercase tracking-[0.2em] text-ink-faint">
                {label}
              </dt>
              <dd className="mt-2.5 text-sm leading-relaxed text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
