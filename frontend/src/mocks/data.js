// DEMO DATA only. No account is created and no authentication token is issued.
import productView from '../assets/demo/product-view.svg'
import packView from '../assets/demo/pack-view.svg'
import detailView from '../assets/demo/detail-view.svg'
export const demoSellerIdentity = {
  id: 'demo-preview',
  name: 'Serendib Spice House',
  email: 'DEMO DATA · Not a signed-in seller',
  role: 'seller',
}
const sellers = [
  {
    id: 1,
    name: 'Serendib Spice House',
    location: 'Matale, Sri Lanka',
    description:
      'An illustrative independent seller based in Matale, offering cinnamon, roasted curry powder and dried curry leaves.',
    approved: true,
  },
  {
    id: 2,
    name: 'Ruhunu Harvest',
    location: 'Hambantota, Sri Lanka',
    description:
      'An illustrative independent seller sharing Sri Lankan fruit, rice and coconut pantry staples.',
    approved: true,
  },
]
const examples = [
  [
    1,
    'Ceylon cinnamon quills',
    'Spices & spice mixes',
    0,
    800,
    '100 g',
    82,
    'Delicate, layered quills with a warm, gently sweet aroma. A fragrant starting point for baking, spiced rice and slow infusions.',
    '100% Ceylon cinnamon bark',
  ],
  [
    2,
    'Sun-dried mango',
    'Dried fruits',
    1,
    750,
    '150 g',
    40,
    'Golden slices of sun-dried mango with a naturally sweet, tangy flavour.',
    'Mango',
  ],
  [
    3,
    'Roasted curry powder',
    'Spices & spice mixes',
    0,
    600,
    '100 g',
    46,
    'A deeply aromatic roasted spice blend for hearty curries and island cooking.',
    'Seller-provided spice blend; see delivered label',
  ],
  [
    4,
    'Traditional red rice',
    'Grains & rice',
    1,
    550,
    '1 kg',
    30,
    'Traditional red rice with a nutty flavour for everyday pantry meals.',
    'Red rice',
  ],
  [
    5,
    'Dried curry leaves',
    'Vegetables & herbs',
    0,
    350,
    '40 g',
    12,
    'Fragrant dried curry leaves for tempering, curries and spiced rice.',
    'Curry leaves',
  ],
  [
    6,
    'Desiccated coconut',
    'Pantry staples',
    1,
    450,
    '250 g',
    25,
    'Finely dried coconut for baking, sweets and savoury dishes.',
    'Coconut',
  ],
]
export const demoProducts = examples.map(
  ([
    id,
    name,
    category,
    owner,
    price,
    pack,
    stock,
    description,
    ingredients,
  ]) => ({
    id,
    name,
    category,
    description,
    ingredients,
    seller: sellers[owner],
    origin: owner === 0 ? 'Matale, Sri Lanka' : 'Hambantota, Sri Lanka',
    facts: {
      Allergens:
        'May contain mustard (shared handling facility). DEMO information.',
      'Net weight': `${pack} per pack`,
      Packaging: 'Food-grade, resealable kraft-lined pouch',
      'Shelf-life': '12 months from packing; best-before on pack.',
      Storage:
        'Keep sealed in a cool, dry place, away from direct sunlight. Use a clean, dry utensil.',
    },
    images: [
      { url: productView, alt: `${name} — DEMO product view placeholder` },
      { url: packView, alt: `${name} — DEMO pack view placeholder` },
      { url: detailView, alt: `${name} — DEMO detail view placeholder` },
    ],
    destinations: ['GB'],
    currency: 'USD',
    approved: true,
    active: true,
    is_demo: true,
    shipping:
      'DEMO DATA: $9.00 per parcel. Dispatch in 2–3 business days; estimated transit 7–12 business days. Simulated rates and timings, not a shipping quotation.',
    returns:
      'DEMO policy text for visual preview only. Real seller return terms must be supplied by the backend.',
    variants: [
      { id: id * 10, pack, price_minor: price, stock, restock_threshold: 15 },
      ...(id === 1
        ? [
            {
              id: 11,
              pack: '250 g',
              price_minor: 1800,
              stock: 20,
              restock_threshold: 5,
            },
          ]
        : []),
    ],
  }),
)

export function makeDemoDashboard() {
  const inventory = structuredClone(
    demoProducts.filter((product) => product.seller.id === 1),
  )
  return {
    user: structuredClone(demoSellerIdentity),
    is_demo: true,
    destination: 'GB',
    snapshot_at: '2026-10-02T09:30:00Z',
    profile: {
      name: sellers[0].name,
      location: sellers[0].location,
      description: sellers[0].description,
      approved: true,
    },
    summary: {
      revenue_minor: 1600,
      open_suborders: 1,
      low_stock: 1,
      forecast_error: 8.4,
      approved_products: 3,
      available_packs: inventory.reduce(
        (total, p) => total + p.variants.reduce((sum, v) => sum + v.stock, 0),
        0,
      ),
    },
    orders: [
      {
        id: 'demo-order-1',
        reference: 'CP-1026',
        product_name: 'Ceylon cinnamon quills',
        quantity: 2,
        buyer_total_minor: 4150,
        seller_total_minor: 1600,
        shipping_minor: 900,
        payment_status: 'Confirmed (simulated)',
        fulfillment_status: 'In transit (simulated)',
        updated_at: '02 Oct 2026',
        estimated_transit: '7–12 business days',
        is_demo: true,
      },
    ],
    inventory,
    forecast: {
      product_name: 'Ceylon cinnamon quills',
      is_demo: true,
      history_weeks: 12,
      horizon_weeks: 4,
      estimated_units: 18,
      source: 'DEMO DATA · Synthetic series',
      error_metric: 'MAPE',
      error_value: 8.4,
      baseline: 'Simple average',
      history: [2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 8, 9].map((units, index) => ({
        period: `W${index + 1}`,
        units,
      })),
      predicted: [4, 4, 5, 5].map((units, index) => ({
        period: `W${index + 13}`,
        units,
      })),
      summary:
        'DEMO DATA: 18 packs illustrated over the next four weeks. No forecast model has been run.',
      note: 'Synthetic demonstration only. The 8.4% error and baseline labels are illustrative, not measured model performance. No accuracy guarantee.',
      recommendation:
        'DEMO recommendation: review replenishment when a variant falls below its configured restock threshold.',
    },
    unavailable: {},
  }
}
