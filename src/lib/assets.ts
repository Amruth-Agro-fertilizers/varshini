/**
 * Central asset manifest.
 *
 * Source images live under `public/assets/` with the folder names the brief
 * specified ("real images", "3D images") — spaces and all. `opt()` maps a
 * source path to its WebP sibling in `public/opt/` (see scripts/optimize-assets.mjs)
 * and URL-encodes it, so nothing downstream has to think about either concern.
 */

const encodePath = (p: string) => p.split('/').map(encodeURIComponent).join('/');

/**
 * Sub-path the site is served from — see next.config.ts.
 *
 * Applied by hand to every URL the scene loads, because `basePath` does not
 * reach them. Next rewrites the things it owns: its own bundles, `<Link>`, and
 * `next/image`. A plain string handed to a three.js loader is just a fetch, and
 * a fetch for `/opt/...` from a site living at `/varshini/` asks the domain
 * root and gets nothing — so on Pages the page would render black with every
 * photograph and model missing, and no error in the console beyond the 404s.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** WebP sibling of a source asset — use for WebGL textures. */
export function opt(sourcePath: string): string {
  const webp = sourcePath.replace(/^\/assets\//, '/opt/').replace(/\.[^.]+$/, '.webp');
  return BASE + encodePath(webp);
}

/**
 * Original asset, URL-encoded — use with next/image.
 *
 * Deliberately *not* prefixed: next/image applies the base path itself, and
 * doing it here as well would ask for /varshini/varshini/assets/...
 */
export function raw(sourcePath: string): string {
  return encodePath(sourcePath);
}

/**
 * The eleven frames of the factory walk, in the order the client sequenced
 * them: gate, interior, intake, processing, bagging, fill, palletising,
 * labelling, bottling, blank-label close-up, finished warehouse.
 */
export const FRAMES = {
  gate: '/assets/real images/1-manufacturingPlantView.png',
  interior: '/assets/real images/2-interior.png',
  intake: '/assets/real images/3-rawMaterialLoading2.png',
  processing: '/assets/real images/4.2-fertiliserPreparingPlatform.png',
  bagging: '/assets/real images/5.2-fertilizerPackingBay.png',
  filling: '/assets/real images/5.2-fertiliserPacksFillingCloseUp.png',
  palletising: '/assets/real images/7.packingFertiliserPacks.png',
  labelling: '/assets/real images/7.1-packingFertiliserPacks.png',
  bottling: '/assets/real images/6.2BottelsPackingBay.png',
  blankLabel: '/assets/real images/6.1-bottelsInRack.png',
  warehouse: '/assets/real images/6-smallFertiliserspack.png',
  topView: '/assets/real images/topView.png',
  topSkyView: '/assets/real images/topSkyView.png',
} as const;

/**
 * The opening aerial.
 *
 * Kept as its own constant, with the focus point the opening move aims at
 * directly below it. Those are the only two things tying the flight to a
 * particular photograph.
 */
export const HERO_PLATE = FRAMES.topSkyView;

export const ABSTRACT = {
  one: '/assets/3D images/1stImg.png',
  two: '/assets/3D images/img1.png',
} as const;

export const MODELS = {
  /** Flock of five, rigged, with a baked wingbeat. */
  birds: `${BASE}/models/birds.glb`,
  /**
   * The headline as a modelled object.
   *
   * Compressed from the 38.5 MB source: 4K colour and normal maps down to 1K
   * WebP, geometry meshopt-packed. 2.3 MB, which is still the heaviest single
   * asset on the page and the reason it is fetched alongside the hero plate
   * rather than discovered after it.
   */
  headline: `${BASE}/models/your-brand-our-plant.glb`,
} as const;

export const CATALOGUE = {
  arecaSpecial: '/assets/fertilisers-images/acrecaspecial.jpeg',
  arecaGrow: '/assets/fertilisers-images/arecagrow.jpeg',
  boomi: '/assets/fertilisers-images/boomi.jpeg',
  bioKRich: '/assets/fertilisers-images/amruth-bio-k-rich-powder-fertilizer-500x500.webp',
} as const;

/*
 * The display faces are loaded through next/font in the layout, not fetched by
 * URL. The two raw paths that used to live here fed the SDF headline that the
 * modelled one replaced, and were dead — worth removing rather than leaving as
 * two more URLs that would silently need a base path.
 */

