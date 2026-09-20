'use client';

import { useRef, useState } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import Interlude from '@/components/ui/Interlude';
import { useSectionProgress } from '@/lib/useSectionProgress';
import { useReveal } from '@/lib/useReveal';
import { INDIAN_STATES, PRODUCT_INTERESTS } from '@/data/content';

const PROMISES = [
  'A callback within 24–48 working hours',
  'An honest read on which SKUs suit your crops',
  'Indicative pricing and MOQs on the call itself',
];

const fieldClass =
  'w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink ' +
  'placeholder:text-ink-faint outline-none transition-colors focus:border-accent';

const labelClass = 'block text-[11px] uppercase tracking-[0.18em] text-ink-faint';

/**
 * Section 08 — Get Started. Copy and field list verbatim from the brief.
 *
 * The form validates and reports success locally; there is no endpoint to post
 * to yet, so it deliberately does not pretend to have sent anything.
 */
export default function GetStarted() {
  const root = useRef<HTMLElement>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useSectionProgress(root, 'contact');
  useReveal(root);

  const toggleInterest = (name: string) =>
    setInterests((current) =>
      current.includes(name) ? current.filter((x) => x !== name) : [...current, name],
    );

  return (
    <section ref={root} id="start" className="relative">
      <Interlude caption="Back to the gate" />

      <div className="surface">
      <div className="px-6 pb-12 pt-32 md:px-12 md:pt-40">
        <SectionHeading
          eyebrow="07 — Get Started"
          title="Tell us about your counter."
          accent="We'll call you back."
        />
      </div>

      <div className="px-6 pb-28 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-14">
          {/* Left column */}
          <div data-reveal>
            <p className="max-w-md text-base leading-relaxed text-ink-soft">
              No obligation and no hard sell &mdash; the first call is about whether this actually
              fits your belt. If it doesn&rsquo;t, we&rsquo;ll say so.
            </p>

            <ol className="mt-10 space-y-5">
              {PROMISES.map((promise, i) => (
                <li key={promise} className="flex gap-4">
                  <span className="font-display text-sm text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-soft">{promise}</span>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-line pt-8">
              <a
                href="tel:+910000000000"
                className="block font-display text-2xl tracking-tight transition-colors hover:text-accent"
              >
                +91 00000 00000
              </a>
              <a
                href="mailto:sales@varshinifertilizers.com"
                className="mt-2 block text-sm text-ink-soft transition-colors hover:text-accent"
              >
                sales@varshinifertilizers.com
              </a>
            </div>
          </div>

          {/* Callback form */}
          <form
            data-reveal
            noValidate={false}
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
            className="card p-6 md:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="name">
                  Full name *
                </label>
                <input id="name" name="name" required placeholder="e.g. Ramesh Gowda" className={`${fieldClass} mt-2`} />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="firm">
                  Shop / firm name *
                </label>
                <input id="firm" name="firm" required placeholder="e.g. Sri Lakshmi Agro Agencies" className={`${fieldClass} mt-2`} />
              </div>

              <div>
                <label className={labelClass} htmlFor="mobile">
                  Mobile number *
                </label>
                <div className="mt-2 flex items-stretch overflow-hidden rounded-lg border border-line bg-white focus-within:border-accent">
                  <span className="grid place-items-center border-r border-line px-3 text-sm text-ink-soft">
                    +91
                  </span>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    title="10-digit Indian mobile number"
                    placeholder="9876543210"
                    className="w-full bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-faint"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="email">
                  Email
                </label>
                <input id="email" name="email" type="email" placeholder="optional" className={`${fieldClass} mt-2`} />
              </div>

              <div>
                <label className={labelClass} htmlFor="city">
                  City / town *
                </label>
                <input id="city" name="city" required placeholder="e.g. Davanagere" className={`${fieldClass} mt-2`} />
              </div>

              <div>
                <label className={labelClass} htmlFor="state">
                  State *
                </label>
                <select id="state" name="state" required defaultValue="Karnataka" className={`${fieldClass} mt-2`}>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="business">
                  Type of business *
                </label>
                <select id="business" name="business" required defaultValue="Retailer" className={`${fieldClass} mt-2`}>
                  {['Retailer', 'Distributor', 'Agri-input dealer', 'FPO', 'Other'].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="volume">
                  Expected monthly volume
                </label>
                <select id="volume" name="volume" defaultValue="Not sure yet" className={`${fieldClass} mt-2`}>
                  {['Not sure yet', 'Under 1 tonne', '1–5 tonnes', '5–20 tonnes', '20+ tonnes'].map(
                    (option) => (
                      <option key={option}>{option}</option>
                    ),
                  )}
                </select>
              </div>

              <fieldset className="sm:col-span-2">
                <legend className={labelClass}>Products you&rsquo;re interested in</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRODUCT_INTERESTS.map((name) => {
                    const isOn = interests.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={isOn}
                        onClick={() => toggleInterest(name)}
                        className={
                          'rounded-full border px-3.5 py-2 text-[11px] transition-colors ' +
                          (isOn
                            ? 'border-accent bg-accent text-white'
                            : 'border-line text-ink-soft hover:border-accent/60 hover:text-accent')
                        }
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label className={labelClass} htmlFor="whitelabel">
                  Do you already sell white-label products?
                </label>
                <select id="whitelabel" name="whitelabel" defaultValue="No" className={`${fieldClass} mt-2`}>
                  {['Yes', 'No', 'Not sure'].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="calltime">
                  Best time to call
                </label>
                <select id="calltime" name="calltime" defaultValue="Any time" className={`${fieldClass} mt-2`}>
                  {['Any time', 'Morning', 'Afternoon', 'Evening'].map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="notes">
                  Anything else we should know?
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Crops in your area, brands you currently stock, questions…"
                  className={`${fieldClass} mt-2 resize-y`}
                />
              </div>

              <label className="flex items-start gap-3 text-[13px] leading-relaxed text-ink-soft sm:col-span-2">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#2f6b3c]"
                />
                <span>
                  I agree to be contacted by Varshini Fertilizers Pvt Ltd about this enquiry.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-accent px-6 py-3.5 font-display text-sm tracking-wide text-white transition-colors hover:bg-ink sm:w-auto sm:px-10"
            >
              Request my callback &rarr;
            </button>

            <p className="mt-3 text-[11px] text-ink-faint">
              We use these details only to call you back about this enquiry.
            </p>

            {submitted ? (
              <p
                role="status"
                className="mt-4 rounded-lg border border-accent/45 bg-accent-soft px-4 py-3 text-[13px] text-ink"
              >
                Details captured. This form is not yet wired to a backend &mdash; connect an
                endpoint before go-live so enquiries actually reach the sales inbox.
              </p>
            ) : null}
          </form>
        </div>
      </div>
      </div>
    </section>
  );
}
