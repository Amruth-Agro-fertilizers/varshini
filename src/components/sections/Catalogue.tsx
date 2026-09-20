'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import SectionHeading from '@/components/ui/SectionHeading';
import Interlude from '@/components/ui/Interlude';
import { useSectionProgress } from '@/lib/useSectionProgress';
import { useReveal } from '@/lib/useReveal';
import { CATEGORIES, PRODUCTS } from '@/data/content';
import { CATALOGUE, raw } from '@/lib/assets';

/** Four product photographs, cycled across fifteen cards. */
const SHOTS = [CATALOGUE.arecaSpecial, CATALOGUE.arecaGrow, CATALOGUE.boomi, CATALOGUE.bioKRich];

/**
 * Section 05 — Catalogue. Copy verbatim from the brief.
 */
export default function Catalogue() {
  const root = useRef<HTMLElement>(null);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);

  useSectionProgress(root, 'catalogue');

  const products = useMemo(
    () => (category === CATEGORIES[0] ? PRODUCTS : PRODUCTS.filter((p) => p.category === category)),
    [category],
  );

  useReveal(root, [category]);

  const countFor = (name: string) =>
    name === CATEGORIES[0] ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === name).length;

  return (
    <section ref={root} id="catalogue" className="relative">
      <Interlude caption="Section 04 · Bottling & filling line" />

      <div className="surface">
      <div className="px-6 pb-12 pt-32 md:px-12 md:pt-40">
        <SectionHeading eyebrow="04 — Catalogue" title="Ready to carry" accent="your name.">
          <p>
            Every product below is available unbranded. Open any one for its composition, the crops
            and soils it suits, the season to use it in, and the pack sizes you can order.
          </p>
        </SectionHeading>
      </div>

      {/* Category pills */}
      <div className="px-6 pb-10 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-2">
          {CATEGORIES.map((name) => {
            const isActive = name === category;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                aria-pressed={isActive}
                className={
                  'rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.15em] transition-colors ' +
                  (isActive
                    ? 'border-accent bg-accent text-white'
                    : 'border-line text-ink-soft hover:border-accent/60 hover:text-accent')
                }
              >
                {name} ({countFor(name)})
              </button>
            );
          })}
        </div>
      </div>

      {/* Product grid */}
      <div className="px-6 pb-16 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <article
              key={product.name}
              data-reveal
              className="group flex flex-col overflow-hidden card transition-colors hover:border-accent/45"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-paper-soft">
                <Image
                  src={raw(SHOTS[i % SHOTS.length])}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover opacity-80 transition-[transform,opacity] duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-ink-soft ">
                  {product.format}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  {product.category}
                </p>
                <h3 className="mt-2 font-display text-lg leading-tight tracking-tight">
                  {product.name}
                </h3>
                <p className="mt-1 font-serif text-sm italic text-ink-soft">{product.hook}</p>

                {/* Composition detail, revealed on hover or focus. */}
                <div className="mt-3 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-56 group-hover:opacity-100 group-focus-within:max-h-56 group-focus-within:opacity-100">
                  <p className="text-[13px] leading-relaxed text-ink-soft">{product.body}</p>
                </div>

                <div className="mt-auto space-y-2 pt-5">
                  <p className="text-[11px] leading-relaxed text-ink-faint">{product.tags}</p>
                  <p className="text-[11px] tracking-wide text-ink-soft">{product.packs}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="px-6 pb-32 md:px-12">
        <p data-reveal className="mx-auto max-w-6xl text-sm text-ink-soft">
          Don&rsquo;t see your grade? Custom NPK ratios and crop-special consortia are made to
          order.{' '}
          <a href="#start" className="border-b border-accent/45 text-accent hover:border-accent">
            Ask us &rarr;
          </a>
        </p>
      </div>
      </div>
    </section>
  );
}
