/**
 * Section copy, verbatim from varshini-antigravity-brief.md.
 *
 * The brief states this text is approved and must not be paraphrased or
 * shortened, so it is kept here as data rather than inlined and reworded in
 * components. Two gaps below are the brief's own — it explicitly declines to
 * supply that copy — and are marked rather than invented.
 */

export const WHITE_LABEL_COMPARISON = {
  left: {
    title: 'Reselling a national brand',
    points: [
      'Thin, fixed dealer margin',
      'Price and scheme decided elsewhere',
      'Customer loyalty belongs to the brand',
      'Same product on every shelf in the taluk',
      'You are one of many dealers in the district',
    ],
  },
  right: {
    title: 'Selling your own label',
    points: [
      'You set the MRP and keep the brand margin',
      'Your schemes, your credit terms, your territory',
      'Farmers come back asking for your name',
      'Nobody else in the district stocks it',
      'An asset you own, not a dealership you rent',
    ],
  },
} as const;

export const WHITE_LABEL_FEATURES = [
  {
    n: '01',
    title: 'Neutral, unbranded stock',
    body: 'Product leaves our line in plain packs with no Amruth or Varshini branding anywhere on the primary pack. The shelf sees your brand only.',
  },
  {
    n: '02',
    title: 'Your artwork, print-ready',
    body: 'Send a logo and a colour. Our team returns pack dielines, label layouts and print-ready artwork for every SKU and pack size you pick.',
  },
  {
    n: '03',
    title: 'FCO-compliant labelling',
    body: 'Labels are laid out to carry the declarations expected under the Fertilizer (Control) Order — composition, net weight, batch, manufacture and expiry.',
  },
  {
    n: '04',
    title: 'Documentation support',
    body: 'Guidance on the marketer registration and source-authorisation paperwork you need in your state, plus batch-wise Certificates of Analysis with every dispatch.',
  },
  {
    n: '05',
    title: 'Sensible MOQs',
    body: 'Start small enough to test the market in your own taluk, then scale. Mixed-SKU first orders are welcome so you can build a full counter range at once.',
  },
  {
    n: '06',
    title: 'Custom formulations',
    body: 'Beyond the standard catalogue, grades and consortia can be tuned for the crops and soils in your belt — paddy, arecanut, grape, chilli, cotton, coffee.',
  },
  {
    n: '07',
    title: 'Pack sizes that sell',
    body: '250 ml sachets to 50 kg bags. Bottles, pouches, laminated sacks and jars — chosen to match the ticket size your farmers actually buy at.',
  },
  {
    n: '08',
    title: 'Agronomy & collateral',
    body: 'Dosage charts, crop schedules, banners and demo-plot support carrying your brand — so your counter staff can sell it the day it lands.',
  },
] as const;

export const TECH_STEPS = [
  {
    n: '01',
    title: 'Mother Culture & Fermentation',
    body: 'Strains are raised in a controlled lab and scaled through fermenters under monitored temperature, pH and aeration. Bio-fertilizers and bio-pesticides only work if the organism is alive and counted — so the count is where the process starts, not ends.',
    stats: [
      ['Controlled', 'Temp · pH · Aeration'],
      ['Verified', 'CFU count per batch'],
      ['Range', 'Consortia, Trichoderma, Pseudomonas'],
    ],
  },
  {
    n: '02',
    title: 'Blending & Granulation',
    body: 'Organic base, rock phosphate, molasses-derived potash and nutrient carriers are weighed, blended and rolled into uniform granules. Even granule size is what stops segregation in the bag and gives farmers an even spread in the field.',
    stats: [
      ['Process', 'Rotary drum granulation'],
      ['Control', 'Screened to size, fines recycled'],
      ['Output', 'PROM · Organic manure · NPK grades'],
    ],
  },
  {
    n: '03',
    title: 'Neem Coating & Drying',
    body: "Granules are coated with neem and dried down to a stable moisture level. Coating slows nutrient release and adds neem's own pest-repellent behaviour; correct drying is what gives the pack a real shelf life in a humid South Indian godown.",
    stats: [
      ['Coating', 'Neem oil / neem cake'],
      ['Drying', 'Moisture brought to spec'],
      ['Result', 'Free-flowing, non-caking granule'],
    ],
  },
  {
    n: '04',
    title: 'QC Lab, Filling & Sealing',
    body: 'Every batch is assayed before it is allowed into a pack — nutrient percentages for chemical grades, viable counts for biologicals. Then it is filled, weighed, sealed and coded with a batch number that ties back to the lab record you receive.',
    stats: [
      ['Lab', 'NPK assay · CFU plating · Moisture'],
      ['Packing', 'Weighed fill, heat seal, batch coding'],
      ['You get', 'Certificate of Analysis per batch'],
    ],
  },
] as const;

export const TRUST_POINTS = [
  'Quality assurance built into every stage',
  'State-of-the-art equipment & production machinery',
  'Skilled and trained manpower',
  'Timely production and dispatch',
  'Customised production facility',
  'Sophisticated storage for finished goods',
  'Supervision through the entire process',
  'More than a decade of manufacturing experience',
] as const;

export type Product = {
  format: string;
  category: string;
  name: string;
  hook: string;
  body: string;
  tags: string;
  packs: string;
};

export const CATEGORIES = [
  'All products',
  'Bio-Fertilizers',
  'Bio-Pesticides',
  'Organic Manure',
  'Specialty Nutrition',
  'NPK & Water Soluble',
  'Soil & Media',
] as const;

export const PRODUCTS: Product[] = [
  { format: 'Liquid', category: 'Bio-Fertilizers', name: 'Bio-NPK Consortia', hook: 'Three organisms, one bottle', body: 'A liquid consortium of nitrogen-fixing, phosphate-solubilising and potash-mobilising bacteria — the single easiest bio product to put a new brand behind.', tags: 'Kharif · Rabi · Red sandy loam', packs: '250 ml · 500 ml · 1 L' },
  { format: 'Liquid', category: 'Bio-Fertilizers', name: 'Azospirillum / Rhizobium', hook: 'Nitrogen out of the air', body: 'Crop-matched nitrogen-fixing bacteria — Azospirillum for cereals and commercial crops, Rhizobium strains for pulses and legumes.', tags: 'Kharif · Rabi · Red sandy loam', packs: '250 ml · 500 ml · 1 L' },
  { format: 'Liquid', category: 'Bio-Fertilizers', name: 'Phosphate Solubilising Bacteria', hook: 'Unlocks the phosphorus already in the field', body: 'PSB releases the large reserve of fixed, plant-unavailable phosphorus that sits unused in most South Indian soils.', tags: 'Kharif · Rabi · Red sandy loam', packs: '250 ml · 500 ml · 1 L' },
  { format: 'Liquid', category: 'Bio-Fertilizers', name: 'Bio Potash (PDM)', hook: 'Potash derived from molasses', body: 'Potash recovered from sugarcane molasses — a genuinely organic potassium source, permitted in organic-input programmes.', tags: 'Rabi · Summer · Red sandy loam', packs: '1 L · 5 L · 20 L' },
  { format: 'Granule', category: 'Organic Manure', name: 'PROM Granules', hook: 'Phosphorous Rich Organic Manure', body: 'Rock phosphate co-composted with organic matter and granulated — the organic answer to a bag of DAP, and a volume seller.', tags: 'Kharif · Rabi · Red sandy loam', packs: '5 kg · 25 kg · 50 kg' },
  { format: 'Granule', category: 'Organic Manure', name: 'Neem Coated Organic Granules', hook: 'Feeds the crop, discourages the pest', body: "Organic granules coated with neem — slow nutrient release plus neem's own repellent action against soil-borne pests.", tags: 'Kharif · Rabi · Red sandy loam', packs: '5 kg · 25 kg · 50 kg' },
  { format: 'Granule', category: 'Organic Manure', name: 'Enriched Organic Manure', hook: 'The base every soil needs first', body: 'Fully decomposed, nutrient-enriched organic manure in granulated form — clean to handle, easy to spread, no weed seed.', tags: 'Kharif · Rabi · Red sandy loam', packs: '5 kg · 25 kg · 50 kg' },
  { format: 'Powder', category: 'Bio-Pesticides', name: 'Trichoderma viride', hook: 'Against wilt, root rot and damping off', body: 'A bio-fungicide that colonises the root zone and suppresses soil-borne fungal disease before it takes hold.', tags: 'Kharif · Rabi · Red sandy loam', packs: '500 g · 1 kg · 5 kg' },
  { format: 'Liquid', category: 'Bio-Pesticides', name: 'Neem Oil 10000 PPM', hook: 'Azadirachtin 1% EC', body: 'Cold-pressed neem oil standardised to 10,000 ppm azadirachtin — the workhorse botanical spray for sucking pests.', tags: 'Kharif · Rabi · Not soil dependent (foliar application)', packs: '100 ml · 250 ml · 500 ml' },
  { format: 'Liquid', category: 'Specialty Nutrition', name: 'Chelated Micronutrient Mix', hook: 'Zn · Fe · Mn · Cu · B · Mo', body: 'A fully chelated liquid micronutrient mix that corrects the hidden deficiencies limiting yield after NPK is already adequate.', tags: 'Kharif · Rabi · Red sandy loam', packs: '250 ml · 500 ml · 1 L' },
  { format: 'Liquid', category: 'Specialty Nutrition', name: 'Seaweed & Humic Growth Promoter', hook: 'Seaweed extract · humic · fulvic · amino acids', body: 'A biostimulant blend that pushes root mass, flowering and stress recovery — the product farmers come back for after a dry spell.', tags: 'Kharif · Rabi · All soil types', packs: '250 ml · 500 ml · 1 L' },
  { format: 'Crystalline powder', category: 'NPK & Water Soluble', name: 'Water Soluble Fertilizers', hook: '19:19:19 · 12:61:00 · 00:52:34 · 13:00:45', body: 'The full grade range of 100% water soluble NPK for drip and foliar feeding — manufactured by Varshini itself.', tags: 'Kharif · Rabi · All soil types under drip/sprinkler irrigation', packs: '250 g · 500 g · 1 kg' },
  { format: 'Granule', category: 'NPK & Water Soluble', name: 'NPK Granular Fertilizer', hook: 'Custom ratios, uniformly granulated', body: 'Conventional granular NPK blends in the ratios your belt actually asks for — including grades the national brands do not bother making.', tags: 'Kharif · Rabi · Red sandy loam', packs: '25 kg · 50 kg' },
  { format: 'Granule', category: 'Soil & Media', name: 'Soil Conditioner', hook: 'For hard, crusted, saline and problem soils', body: 'Improves structure, drainage and cation exchange in compacted, sodic and salt-affected fields where nothing else is working.', tags: 'Summer (pre-monsoon reclamation) · Kharif · Compacted', packs: '25 kg · 50 kg' },
  { format: 'Compressed block', category: 'Soil & Media', name: 'Coco Pith Blocks', hook: 'Washed, buffered growing media', body: 'Low-EC, buffered coco pith in compressed 5 kg blocks — for nurseries, polyhouses, terrace gardens and grow-bag cultivation.', tags: 'Year-round · Soil-less media', packs: '650 g block · 5 kg block · Loose (bulk bags)' },
];

export const ONBOARDING_STEPS = [
  { n: '01', when: 'Day 0 · You', title: 'You submit the callback form', body: "Name, shop or firm, district, and roughly what you sell today. That's all we need to start." },
  { n: '02', when: 'Within 24–48 hrs · Us', title: 'Discovery call', body: 'We map your belt: the crops around you, the soils, what farmers already buy, what price points move, and which of our SKUs actually fit. No generic pitch.' },
  { n: '03', when: 'Week 1 · Us', title: 'Sample kit & trial', body: 'A sample set of the shortlisted products reaches you for your own field trial or demo plot, along with technical literature and dosage charts.' },
  { n: '04', when: 'Week 1–2 · Together', title: 'Range, packs and commercials', body: 'You lock the SKU list, pack sizes and grades. We share the ex-plant price list, MOQ per SKU, payment and credit terms, and expected lead times in writing.' },
  { n: '05', when: 'Week 2 · Together', title: 'Brand & artwork', body: 'You send your brand name, logo and preferred colours. Our design team returns pack artwork on the correct dielines, with the mandatory declarations placed for you. You approve the proof.' },
  { n: '06', when: 'Week 2–3 · You, with our help', title: 'Licensing & compliance', body: "We hand over the source authorisation and manufacturer documents your state department asks for, and walk you through the marketer registration if you don't already hold one." },
  { n: '07', when: 'Week 3 · Together', title: 'Agreement & first purchase order', body: 'A simple supply agreement covering territory, pricing validity and confidentiality. You raise the first PO and we book your production slot.' },
] as const;

export const FAQ_QUESTIONS = [
  'Will the Amruth or Varshini name appear anywhere on the pack?',
  'Do I need a licence to sell fertilizer under my own brand?',
  'What is the minimum order quantity?',
  'How long does the first order take?',
  "Can I get a formulation that isn't in the catalogue?",
  'Who pays for the label printing?',
  'Do you supply outside Karnataka?',
  'Will you also supply my competitor in the same town?',
] as const;

export const PRODUCT_INTERESTS = [
  'Bio-Fertilizers',
  'Bio-Pesticides',
  'Organic Manure / PROM',
  'NPK Granular',
  'Water Soluble Fertilizers',
  'Micronutrients',
  'Growth Promoters',
  'Coco Pith',
  'Custom formulation',
  'Not decided yet',
] as const;

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana', 'Maharashtra',
  'Goa', 'Gujarat', 'Madhya Pradesh', 'Odisha', 'Chhattisgarh', 'Rajasthan',
  'Uttar Pradesh', 'Bihar', 'West Bengal', 'Punjab', 'Haryana', 'Other',
] as const;
