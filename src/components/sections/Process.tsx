'use client';

import { useRef, useState } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import Interlude from '@/components/ui/Interlude';
import { useSectionProgress } from '@/lib/useSectionProgress';
import { useReveal } from '@/lib/useReveal';
import { ONBOARDING_STEPS } from '@/data/content';

const TABS = ['Track A — Onboarding', 'Track B — Production & handover'] as const;

/**
 * Section 06 — Process. Copy verbatim from the brief.
 *
 * Track B ships as an empty shell on purpose: the brief supplies no copy for
 * it and explicitly says to mark it rather than invent any.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);

  useSectionProgress(root, 'process');
  useReveal(root, [tab]);

  return (
    <section ref={root} id="process" className="relative">
      <Interlude caption="Section 05 · Unbranded stock, ready for your label" />

      <div className="surface">
      <div className="px-6 pb-12 pt-32 md:px-12 md:pt-40">
        <SectionHeading
          eyebrow="05 — Process"
          title="From first call"
          accent="to stock on your shelf."
        >
          <p>
            Nothing about this is vague. Here is the whole path &mdash; how you get onboarded, and
            how product physically reaches you afterwards, every cycle.
          </p>
        </SectionHeading>
      </div>

      <div className="px-6 pb-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div role="tablist" aria-label="Process tracks" className="flex flex-wrap gap-2">
            {TABS.map((name) => {
              const isActive = name === tab;
              return (
                <button
                  key={name}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setTab(name)}
                  className={
                    'rounded-full border px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] transition-colors ' +
                    (isActive
                      ? 'border-accent bg-accent text-white'
                      : 'border-line text-ink-soft hover:border-accent/60 hover:text-accent')
                  }
                >
                  {name}
                </button>
              );
            })}
          </div>

          {tab === TABS[0] ? (
            <ol className="mt-12 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
              {ONBOARDING_STEPS.map((step) => (
                <li
                  key={step.n}
                  data-reveal
                  className="grid gap-4 bg-white p-6 md:grid-cols-[auto_14rem_1fr] md:items-baseline md:gap-8 md:p-8"
                >
                  <span className="font-display text-2xl text-accent">{step.n}</span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                    {step.when}
                  </span>
                  <div>
                    <h3 className="font-display text-lg leading-tight tracking-tight md:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-soft md:text-sm">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div
              data-reveal
              className="mt-12 rounded-2xl border border-dashed border-line bg-paper-soft p-10 text-center"
            >
              <p className="font-serif text-xl italic text-ink-soft">
                Track B content pending
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-faint">
                The production &amp; handover steps have not been written yet. The shell is in
                place &mdash; drop the copy in and it renders exactly like Track A.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
