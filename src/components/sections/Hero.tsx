'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PlantAddressCard from '@/components/ui/PlantAddressCard';
import { getPlantAnchor } from '@/lib/plant-anchor';
import { useSectionProgress } from '@/lib/useSectionProgress';

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  ['The Group', '#group'],
  ['Process', '#process'],
  ['Catalogue', '#catalogue'],
] as const;

/**
 * Section 01 — Hero.
 *
 * The headline itself lives in WebGL (HeroScene); this is the DOM furniture
 * around it, plus the ScrollTrigger that publishes hero progress to the scene.
 * The section is 250vh tall and pinned, which gives the fly-through room to
 * play out at a readable pace.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const address = useRef<HTMLDivElement>(null);
  const addressCard = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const leader = useRef<SVGSVGElement>(null);
  const leaderPath = useRef<SVGPathElement>(null);

  useSectionProgress(root, 'hero');

  useEffect(() => {
    const ctx = gsap.context(() => {
      // All surrounding chrome clears out early — from here the scene carries
      // the fly-through on its own, which is the whole point of the section.
      gsap.to('[data-hero-chrome]', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '28% top',
          scrub: true,
        },
      });
      gsap.to(chrome.current, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '28% top',
          scrub: true,
        },
      });

      /*
       * The address card's arrival.
       *
       * Scrubbed across its own window rather than fired once, so it is tied to
       * the scroll and reverses cleanly on the way back up. Written as set-then-to
       * rather than fromTo, following the same rule the reveal helper documents:
       * a `from` re-applies its start state on every refresh, and this page
       * refreshes whenever its height changes.
       *
       * The entrance is a real rotation in depth — it swings up and around onto
       * its edge — and it settles a few degrees off square rather than flat, so
       * it reads as a card standing on the landscape rather than a panel pasted
       * over it.
       *
       * The window is bounded by something structural: this section is 260vh
       * around a 100vh sticky, so the chrome can only stay pinned for the first
       * 160vh — about sixty per cent of the section. Past that the card rides
       * up with the page whatever it is told to do, so the reveal is timed to
       * land while it is still pinned, and the fade is set to finish it off on
       * the way out rather than fight the scroll.
       */
      if (addressCard.current) {
        gsap.set(addressCard.current, {
          opacity: 0,
          transformPerspective: 1000,
          transformOrigin: '20% 100%',
          rotationX: -38,
          rotationY: 26,
          z: -240,
          y: 54,
          scale: 0.86,
        });

        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: '40% top',
            end: '78% top',
            scrub: 0.5,
          },
        });

        /*
         * Every tween is placed explicitly, none appended.
         *
         * Chaining .to() after a positioned insert appends to the timeline's
         * end rather than the start — and the leader's exit had already pushed
         * that end past the whole window, so the card's entrance was scheduled
         * after the section was over and it simply never appeared.
         */
        reveal.to(
          addressCard.current,
          {
            opacity: 1,
            rotationX: 2,
            rotationY: -5,
            z: 0,
            y: 0,
            scale: 1,
            duration: 0.34,
            ease: 'power3.out',
          },
          0,
        );
        reveal.to(
          addressCard.current,
          {
            opacity: 0,
            y: -28,
            rotationY: -16,
            scale: 0.95,
            duration: 0.2,
            ease: 'power2.in',
          },
          0.78,
        );

        if (leader.current) {
          reveal.to(leader.current, { opacity: 1, duration: 0.3, ease: 'none' }, 0.12);
          reveal.to(leader.current, { opacity: 0, duration: 0.18, ease: 'none' }, 0.78);
        }

        // Nothing is appended, so the timeline needs a stated length for the
        // scrub to map the whole window onto.
        reveal.set({}, {}, 1);
      }

      /*
       * Retire the scrim and the vignette with the section they belong to.
       *
       * Both are sticky inside this section, so once it stops pinning them
       * they scroll out like anything else — and on the way out they spend a
       * long moment covering the top of the *next* section, laying a dark
       * gradient with a hard bottom edge across it. Over this section's own
       * dark aerial that is invisible; over the white cloud bank the reader
       * crosses into the plant through, it is a grey band with a ruled line
       * under it, which is what the hand-off looked broken by.
       *
       * They exist to hold white chrome legible against photography, and that
       * chrome is long gone by here, so there is nothing to keep them for.
       */
      gsap.to('[data-hero-veil]', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: '62% top',
          end: '80% top',
          scrub: true,
        },
      });

      gsap.set('[data-hero-fade]', { opacity: 0, y: 24 });
      gsap.to('[data-hero-fade]', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.25,
      });
    }, root);

    /*
     * Re-aim the leader every frame.
     *
     * Both ends move: the card is laid out responsively and rides up once the
     * sticky releases, and the plant slides outward as the plate magnifies. So
     * the line is measured rather than authored — the card's real right edge to
     * the plant's projected centre, pulled up short so the head lands beside
     * the works instead of on top of them.
     */
    let frame = 0;
    const aim = () => {
      frame = requestAnimationFrame(aim);
      const path = leaderPath.current;
      const host = stage.current;
      const card = addressCard.current;
      if (!path || !host || !card || leader.current?.checkVisibility?.() === false) return;

      const bounds = host.getBoundingClientRect();
      if (bounds.width < 768) return;

      // Leaves from the card's upper right. The works sit above and to the
      // right of it, so an exit from the vertical middle would start the run
      // heading the wrong way before curving back.
      const rect = card.getBoundingClientRect();
      const from = {
        x: rect.right - bounds.left,
        y: rect.top - bounds.top + rect.height * 0.22,
      };

      const anchor = getPlantAnchor();
      const target = { x: anchor.x * bounds.width, y: anchor.y * bounds.height };

      const dx = target.x - from.x;
      const dy = target.y - from.y;
      const length = Math.hypot(dx, dy) || 1;
      // Stop just short of the centre so the head sits against the works
      // rather than over them. Capped tightly: on a shallow run the old
      // proportional pull-back took the head clear of the plant altogether.
      const inset = Math.min(74, length * 0.18);
      const to = {
        x: target.x - (dx / length) * inset,
        y: target.y - (dy / length) * inset,
      };

      // A shallow arc, bowed away from the straight line, so it reads as a
      // callout rather than a connector.
      // Shallower than before: the card now sits beside the works rather than
      // across the frame from them, and a long bow on a short run reads as a
      // loop rather than a leader.
      const bend = 0.1;
      const control = {
        x: (from.x + to.x) / 2 - dy * bend,
        y: (from.y + to.y) / 2 + dx * bend,
      };

      path.setAttribute(
        'd',
        `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${control.x.toFixed(1)} ${control.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
      );
    };
    frame = requestAnimationFrame(aim);

    return () => {
      cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative h-[260vh]">
      {/*
        The address beat gets its own pinned layer, and a zero-height one.
        A sticky element can only stay pinned for its parent's height minus its
        own, so the 100vh chrome container below unpins about sixty per cent
        into this 260vh section — and anything riding inside it then scrolls
        away with the page. That is exactly what the card was doing: instead of
        fading where it stood it drifted off the top, arrow and all. A sticky
        box of no height has nothing to subtract, so it holds for the whole
        section and the card leaves only when it is told to.
      */}
      <div className="pointer-events-none sticky top-0 z-20 h-0">
        <div ref={stage} className="relative h-screen w-full">
      {/* Where the plant is, named on the land itself.
          Outside both chrome groups on purpose: those fade in on load and out
          by the first third, and this has to do the opposite — stay away
          until the headline has gone, then arrive. */}
      <div
        ref={address}
        className="pointer-events-none absolute bottom-16 left-5 z-20 md:bottom-auto md:left-[26%] md:top-[49%]"
        style={{ perspective: '1200px' }}
      >
        <div ref={addressCard} className="pointer-events-auto">
          <PlantAddressCard className="w-[19rem] sm:w-[22rem]" />
        </div>
      </div>

      {/* Leader from the card to the works.
          Drawn in the DOM rather than the scene so it can start at the card's
          real measured edge, and re-aimed every frame at the plant's
          projected position — see PlantAnchor. A fixed line would be pointing
          at open field before the section was half over. */}
      <svg
        ref={leader}
        className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full opacity-0 md:block"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="plant-leader-head"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
          </marker>
        </defs>
        <path
          ref={leaderPath}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          markerEnd="url(#plant-leader-head)"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(10,12,8,0.55))' }}
        />
      </svg>
        </div>
      </div>

      {/* Scrim, weighted to the two bands the chrome actually occupies rather
          than washed over the whole frame. The old version gave up by 24% and
          left the masthead sitting on bare sunrise sky, which is the brightest
          part of the photograph and the one place white type cannot survive. */}
      <div
        data-hero-veil
        className="pointer-events-none sticky top-0 -mb-[100vh] h-screen"
        style={{
          background:
            'linear-gradient(to bottom, rgba(14,17,12,0.62) 0%, rgba(14,17,12,0.34) 14%, rgba(14,17,12,0.08) 32%, rgba(14,17,12,0.02) 50%, rgba(14,17,12,0.16) 72%, rgba(14,17,12,0.46) 100%)',
        }}
      />

      {/* Vignette. The plate is a top-down aerial lit flat from directly above,
          so it has no falloff of its own and runs to the frame edge at the same
          brightness everywhere — which is most of why the shot read as flat.
          A corner-weighted darkening gives it a centre to sit in, and doubles
          as a floor under the chrome in all four corners. */}
      <div
        data-hero-veil
        className="pointer-events-none sticky top-0 -mb-[100vh] h-screen"
        style={{
          background:
            'radial-gradient(118% 88% at 50% 46%, rgba(12,15,10,0) 42%, rgba(12,15,10,0.16) 72%, rgba(12,15,10,0.42) 100%)',
        }}
      />

      <div className="sticky top-0 flex h-screen flex-col justify-between overflow-hidden px-6 py-8 md:px-12 md:py-10">

        <div ref={chrome} data-hero-chrome className="on-photo flex flex-col gap-8">
          <header className="flex items-start justify-between gap-6">
            {/* The wordmark is set as a lockup rather than two loose lines: a
                rule ties the company name to its suffix, so the pair reads as
                one mark at a glance instead of as a heading with a caption
                floating under it. */}
            <div data-hero-fade className="shrink-0">
              <h1 className="font-display text-[2.1rem] leading-[0.92] tracking-[0.01em] text-white md:text-[3.4rem]">
                VARSHINI
              </h1>
              <div className="mt-2 flex items-center gap-2.5 md:mt-2.5 md:gap-3">
                <span className="block h-px w-7 shrink-0 bg-white/70 md:w-10" />
                <p className="font-serif text-base italic leading-none text-white md:text-xl">
                  Fertilizers Pvt Ltd
                </p>
              </div>
            </div>

            <nav data-hero-fade className="hidden items-center gap-1 md:flex">
              <div className="chrome-field pointer-events-auto flex items-center gap-1 rounded-full p-1">
                {NAV_LINKS.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    className="rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-white hover:text-ink"
                  >
                    {label}
                  </a>
                ))}
                <a
                  href="#start"
                  className="ml-1 rounded-full bg-accent px-5 py-2 text-[11px] uppercase tracking-[0.16em] text-white ring-1 ring-white/30 transition-colors hover:bg-white hover:text-ink"
                >
                  Get Started
                </a>
              </div>
            </nav>
          </header>

          <div data-hero-fade className="max-w-md">
            <p className="chrome-field inline-flex items-center gap-3 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white md:text-xs">
              <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-accent ring-2 ring-white/60" />
              01 — White-label manufacturing
            </p>
          </div>
        </div>

        <div data-hero-chrome className="on-photo flex items-end justify-between gap-6 md:gap-8">
          <p
            data-hero-fade
            className="max-w-sm text-sm leading-relaxed text-white md:text-base"
          >
            Organic, bio and NPK fertilizers manufactured at scale in Karnataka —
            packed under <span className="font-serif italic text-white">your</span> label.
          </p>

          <div
            data-hero-fade
            className="flex shrink-0 flex-col items-end gap-2.5 text-[length:var(--text-eyebrow)] uppercase tracking-[0.25em] text-white"
          >
            <span className="on-photo">Scroll</span>
            {/* A travelling highlight down the rule, so the cue reads as an
                invitation rather than a tick mark. */}
            <span className="relative block h-14 w-px overflow-hidden bg-white/35">
              <span className="absolute inset-x-0 top-0 block h-5 animate-[scrollcue_2.4s_ease-in-out_infinite] bg-white" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
