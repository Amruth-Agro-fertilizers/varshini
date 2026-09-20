'use client';

import { useRef } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import Interlude from '@/components/ui/Interlude';
import { useSectionProgress } from '@/lib/useSectionProgress';
import { useReveal } from '@/lib/useReveal';
import { WHITE_LABEL_COMPARISON, WHITE_LABEL_FEATURES } from '@/data/content';

/**
 * Section 03 — White-Label. Copy verbatim from the brief.
 */
export default function WhiteLabel() {
  const root = useRef<HTMLElement>(null);
  useSectionProgress(root, 'whiteLabel');
  useReveal(root);

  const { left, right } = WHITE_LABEL_COMPARISON;

  return (
    <section ref={root} id="white-label" className="relative">
      {/*
        Long enough to outlast the hand-off.
        The screen before this one closes away onto black, black is held, and
        then this one opens out of the middle — a third of the way into the
        section before the frame is whole again. An opaque page arriving under
        that puts a hard paper edge across the bottom of a plate that is still
        growing, which is what made the hand-off look broken. The paper waits
        until the frame has finished opening.
      */}
      <Interlude caption="Section 02 · White-label supply" height="h-[230vh]" />

      <div className="surface">
      <div className="px-6 pb-16 pt-32 md:px-12 md:pt-40">
        <SectionHeading
          eyebrow="02 — White-Label"
          title="You already sell someone else's label."
          accent="Sell your own instead."
        >
          <p>
            If you&rsquo;re a retailer moving other companies&rsquo; white-label goods, you already
            know the model. Here is what it looks like when the product is fertilizer and the plant
            is ours.
          </p>
        </SectionHeading>
      </div>

      {/* Comparison panel */}
      <div className="px-6 pb-24 md:px-12">
        <div className="mx-auto grid max-w-6xl items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div
            data-reveal
            className="card p-6 md:p-8"
          >
            <h3 className="font-display text-lg tracking-tight text-ink-soft md:text-xl">
              {left.title}
            </h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft">
              {left.points.map((point) => (
                <li key={point} className="flex gap-3 border-b border-line pb-3 last:border-0">
                  <span className="mt-[9px] block h-px w-3 shrink-0 bg-paper-soft" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal className="flex items-center justify-center py-2">
            <span className="font-display text-sm tracking-[0.2em] text-accent">VS</span>
          </div>

          <div
            data-reveal
            className="card border-accent/35 bg-accent-soft p-6 md:p-8"
          >
            <h3 className="font-display text-lg tracking-tight md:text-xl">{right.title}</h3>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-soft">
              {right.points.map((point) => (
                <li key={point} className="flex gap-3 border-b border-line pb-3 last:border-0">
                  <span className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Feature grid */}
      <div className="px-6 pb-32 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {WHITE_LABEL_FEATURES.map((feature) => (
            <article
              key={feature.n}
              data-reveal
              className="group bg-white p-6 transition-colors hover:bg-accent-soft"
            >
              <p className="font-display text-2xl text-accent transition-colors group-hover:text-accent">
                {feature.n}
              </p>
              <h3 className="mt-3 font-display text-base leading-tight tracking-tight md:text-lg">
                {feature.title}
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{feature.body}</p>
            </article>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
