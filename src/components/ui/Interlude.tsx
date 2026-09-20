/**
 * A cinematic beat between two content sections.
 *
 * Transparent, so the WebGL frame behind it is the only thing on screen, and
 * tall enough that the shot gets held rather than glimpsed. These beats are
 * what give the page its spacing: copy never has to compete with a moving
 * photograph, because the photograph gets the frame to itself first and the
 * opaque content surface then slides cleanly over it.
 */
export default function Interlude({
  caption,
  height = 'h-[88vh]',
}: {
  caption?: string;
  height?: string;
}) {
  return (
    <div className={`relative ${height} w-full`} aria-hidden={!caption}>
      {caption ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center px-6">
          <p className="rounded-full bg-white/92 px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-ink shadow-[0_10px_30px_-18px_rgba(27,30,25,0.4)]">
            {caption}
          </p>
        </div>
      ) : null}
    </div>
  );
}
