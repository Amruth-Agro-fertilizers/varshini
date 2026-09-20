/**
 * Footer. Copy verbatim from the brief.
 */
const COLUMNS = [
  {
    title: 'Company',
    links: [
      ['The Group', '#group'],
      ['White-Label Model', '#white-label'],
      ['Technology', '#technology'],
      ['Process', '#process'],
    ],
  },
  {
    title: 'Products',
    links: [
      ['Full catalogue', '#catalogue'],
      ['Bio-fertilizers', '#catalogue'],
      ['Organic manure & PROM', '#catalogue'],
      ['NPK & water soluble', '#catalogue'],
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-paper px-6 pb-12 pt-20 md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-xl leading-none tracking-tight">VARSHINI</p>
            <p className="mt-1 font-serif text-sm italic text-ink-soft">Fertilizers Pvt Ltd</p>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-ink-soft">
              White-label organic, bio and NPK fertilizers, manufactured at the Amruth Group plant
              and shipped ready for your brand.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-[13px] text-ink-soft transition-colors hover:text-accent">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">Plant &amp; Office</p>
            <address className="mt-4 space-y-2.5 not-italic text-[13px] leading-relaxed text-ink-soft">
              <p>Malladihalli, Holalkere Taluk, Chitradurga District, Karnataka, India</p>
              <p>
                <a href="tel:+910000000000" className="transition-colors hover:text-accent">
                  +91 00000 00000
                </a>
              </p>
              <p>
                <a
                  href="mailto:sales@varshinifertilizers.com"
                  className="transition-colors hover:text-accent"
                >
                  sales@varshinifertilizers.com
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 border-t border-line pt-6">
          <p className="text-[11px] text-ink-faint">
            © 2026 Varshini Fertilizers Pvt Ltd · An Amruth Organic Fertilizers company
          </p>
          <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-ink-faint">
            Product information is indicative. Dosage and suitability vary by crop, soil test and
            season — please follow the label and local agronomy advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
