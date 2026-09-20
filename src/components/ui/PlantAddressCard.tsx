/**
 * Where the plant in the picture actually is.
 *
 * Belongs on the opening aerial rather than anywhere later in the page: the
 * shot is of a real site, and a pin with an address on top of it is what tells
 * the reader that the plant they are looking at is Amruth's and where it
 * stands. Read off a photograph of somewhere else it is just a contact block.
 */
export default function PlantAddressCard({
  className = '',
  compact = false,
}: {
  className?: string;
  /** Tighter, for laying over artwork that needs the room. */
  compact?: boolean;
}) {
  return (
    <address className={`card not-italic ${compact ? 'p-4' : 'p-6'} ${className}`}>
      <div className={`flex items-start ${compact ? 'gap-3' : 'gap-3.5'}`}>
        <span
          className={`mt-0.5 grid shrink-0 place-items-center rounded-full bg-accent-soft text-accent ${
            compact ? 'h-7 w-7' : 'h-9 w-9'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={compact ? 'h-[15px] w-[15px]' : 'h-[18px] w-[18px]'}
            aria-hidden="true"
          >
            <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="2.75" />
          </svg>
        </span>
        <div>
          <p className="text-[length:var(--text-eyebrow)] uppercase tracking-[0.22em] text-accent">
            Amruth Organic Fertilizers
          </p>
          <p
            className={`text-ink ${compact ? 'mt-1.5 text-[12.5px] leading-snug' : 'mt-2.5 text-sm leading-relaxed'}`}
          >
            Malladihalli, Holalkere Taluk, Chitradurga District, Karnataka.
          </p>
        </div>
      </div>

      <dl
        className={`border-t border-line leading-relaxed ${
          compact ? 'mt-3 space-y-1.5 pt-3 text-[12px]' : 'mt-5 space-y-3 pt-5 text-[13px]'
        }`}
      >
        <div className="flex gap-3">
          <dt className="w-14 shrink-0 text-ink-faint">Phone</dt>
          <dd>
            <a href="tel:+919900066307" className="text-ink transition-colors hover:text-accent">
              +91 99000 66307
            </a>
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-14 shrink-0 text-ink-faint">Email</dt>
          <dd className="flex flex-col gap-0.5">
            <a
              href="mailto:amruth.organic@gmail.com"
              className="text-ink transition-colors hover:text-accent"
            >
              amruth.organic@gmail.com
            </a>
            <a
              href="mailto:info@amruthgroup.net"
              className="text-ink transition-colors hover:text-accent"
            >
              info@amruthgroup.net
            </a>
          </dd>
        </div>
      </dl>
    </address>
  );
}
