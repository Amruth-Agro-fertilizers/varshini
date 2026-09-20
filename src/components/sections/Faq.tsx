'use client';

import { useRef, useState } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import Interlude from '@/components/ui/Interlude';
import { useSectionProgress } from '@/lib/useSectionProgress';
import { useReveal } from '@/lib/useReveal';
import { FAQ_QUESTIONS } from '@/data/content';

/**
 * Section 07 — Questions. Questions verbatim from the brief.
 *
 * Answers are marked pending rather than written: the brief supplies none, and
 * these are commercial commitments — MOQs, territory exclusivity, who pays for
 * printing — that nobody but the client can answer.
 */
export default function Faq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useSectionProgress(root, 'faq');
  useReveal(root);

  return (
    <section ref={root} id="faq" className="relative">
      <Interlude caption="Section 06 · Finished goods store" />

      <div className="surface">
      <div className="px-6 pb-12 pt-32 md:px-12 md:pt-40">
        <SectionHeading
          eyebrow="06 — Questions"
          title="The things retailers"
          accent="always ask first."
        />
      </div>

      <div className="px-6 pb-32 md:px-12">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-line bg-white ">
          {FAQ_QUESTIONS.map((question, i) => {
            const isOpen = open === i;
            return (
              <div key={question} data-reveal className="border-b border-line last:border-0">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start gap-5 px-6 py-5 text-left transition-colors hover:bg-paper-soft md:px-8"
                  >
                    <span className="mt-0.5 font-display text-sm text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-[15px] leading-snug text-ink md:text-base">
                      {question}
                    </span>
                    <span
                      aria-hidden="true"
                      className={
                        'mt-1 block h-2.5 w-2.5 shrink-0 border-b border-r border-accent transition-transform duration-300 ' +
                        (isOpen ? '-rotate-135' : 'rotate-45')
                      }
                    />
                  </button>
                </h3>
                <div
                  className={
                    'grid transition-all duration-400 ' +
                    (isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')
                  }
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 pl-[3.6rem] text-sm leading-relaxed text-ink-faint md:px-8 md:pl-[4.4rem]">
                      Answer pending &mdash; this one is a commercial commitment
                      (terms, MOQ, territory), so it needs to come from Varshini rather than be
                      drafted here.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}
