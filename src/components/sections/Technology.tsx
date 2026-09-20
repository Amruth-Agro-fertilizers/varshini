'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionHeading from '@/components/ui/SectionHeading';
import Interlude from '@/components/ui/Interlude';
import { useSectionProgress } from '@/lib/useSectionProgress';
import { useReveal } from '@/lib/useReveal';
import { setProgress } from '@/lib/scroll-progress';
import { TECH_STEPS, TRUST_POINTS } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 04 — Technology. Copy verbatim from the brief.
 *
 * The four steps are pinned and scrubbed. Step progress is published to the
 * scene, which crossfades a different plate behind each one — so advancing a
 * step moves the reader to a different part of the plant rather than swapping
 * an image beside static text.
 */
export default function Technology() {
  const root = useRef<HTMLElement>(null);
  const carousel = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useSectionProgress(root, 'technology');
  useReveal(root);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: carousel.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const step = self.progress * (TECH_STEPS.length - 1);
          setProgress('techStep', step);
          setActive(Math.round(step));
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="technology" className="relative">
      <Interlude caption="Section 03 · Bagging & packing line" />

      <div className="surface px-6 pb-16 pt-28 md:px-12 md:pt-36">
        <SectionHeading
          eyebrow="03 — Technology"
          title="Engineered like a plant."
          accent="Not like a shed."
        >
          <p>
            The reason a retailer can safely put their own name on this product is what happens
            before it reaches the pack. Scroll through the line.
          </p>
        </SectionHeading>
      </div>

      {/* Pinned 4-step carousel */}
      <div ref={carousel} className="relative lg:h-[340vh]">
        <div className="flex flex-col justify-center px-6 py-8 lg:sticky lg:top-0 lg:h-screen lg:px-12 lg:py-0">
          <div className="mx-auto w-full max-w-5xl">
            {/* Step rail */}
            <div className="mb-8 flex items-center gap-3">
              {TECH_STEPS.map((step, i) => (
                <div key={step.n} className="flex flex-1 flex-col gap-2">
                  <span
                    className={
                      'h-px w-full transition-colors duration-500 ' +
                      (i <= active ? 'bg-accent' : 'bg-paper-soft')
                    }
                  />
                  <span
                    className={
                      'text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 ' +
                      (i <= active ? 'text-accent' : 'text-ink-faint')
                    }
                  >
                    {step.n}/04
                  </span>
                </div>
              ))}
            </div>

            {/* Steps. All are rendered; only the active one is shown, so the
                pinned block never changes height as steps advance. */}
            <div className="relative min-h-[26rem] sm:min-h-[22rem]">
              {TECH_STEPS.map((step, i) => (
                <div
                  key={step.n}
                  className={
                    'transition-all duration-500 ' +
                    (i === active
                      ? 'relative opacity-100 blur-0'
                      : 'pointer-events-none absolute inset-0 opacity-0 blur-sm')
                  }
                  aria-hidden={i !== active}
                >
                  <div className="rounded-2xl border border-line bg-white p-6  md:p-9">
                    <p className="font-display text-4xl text-accent md:text-5xl">{step.n}</p>
                    <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft md:text-base">
                      {step.body}
                    </p>
                    <dl className="mt-7 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
                      {step.stats.map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                            {label}
                          </dt>
                          <dd className="mt-1.5 text-[13px] leading-snug text-ink">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust list */}
      <div className="surface px-6 pb-32 pt-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h3 data-reveal className="font-serif text-2xl italic text-ink-soft md:text-3xl">
            Why the group is trusted with it
          </h3>
          <div className="rule mt-6" />
          <ul className="grid gap-x-10 gap-y-4 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_POINTS.map((point) => (
              <li key={point} data-reveal className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
