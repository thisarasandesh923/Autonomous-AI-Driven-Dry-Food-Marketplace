import { ApiError } from '../api/client'
import { demoProducts } from './data'

export function demoResponse(value, signal) {
  if (signal?.aborted)
    return Promise.reject(new DOMException('Request cancelled', 'AbortError'))
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Request cancelled', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve(structuredClone(value))
    }, 60)
    signal?.addEventListener('abort', abort, { once: true })
  })
}

export function createDemoCatalogue(products = demoProducts) {
  return {
    async list(query, signal) {
      const params = new URLSearchParams(query)
      const numeric = (key, fallback, min, max = Infinity) => {
        if (!params.has(key)) return fallback
        const value = Number(params.get(key))
        if (!Number.isInteger(value) || value < min || value > max)
          throw new ApiError(422, `Invalid ${key.replace('_', ' ')}.`)
        return value
      }
      const page = numeric('page', 1, 1)
      const pageSize = numeric('page_size', 12, 1, 48)
      const min = numeric('min_price', 0, 0)
      const max = numeric('max_price', Infinity, 0)
      if (min > max)
        throw new ApiError(422, 'Minimum price must not exceed maximum price.')
      const sort = params.get('sort') || 'featured'
      if (!['featured', 'price_asc', 'price_desc', 'name'].includes(sort))
        throw new ApiError(422, 'Choose a supported sort order.')
      const destination = params.get('destination') || 'GB'
      const eligible = products.filter(
        (p) =>
          p.active &&
          p.approved &&
          p.seller.approved &&
          p.destinations.includes(destination) &&
          p.variants.length,
      )
      const categories = [...new Set(eligible.map((p) => p.category))]
      const sellerIds = [...new Set(eligible.map((p) => p.seller.id))]
      const prices = eligible.flatMap((p) =>
        p.variants.map((v) => v.price_minor),
      )
      const facets = {
        categories: categories.map((value) => ({
          value,
          count: eligible.filter((p) => p.category === value).length,
        })),
        sellers: sellerIds.map((id) => ({
          id,
          name: eligible.find((p) => p.seller.id === id).seller.name,
          count: eligible.filter((p) => p.seller.id === id).length,
        })),
        eligible_count: eligible.length,
        in_stock_count: eligible.filter((p) =>
          p.variants.some((v) => v.stock > 0),
        ).length,
        min_price: prices.length ? Math.min(...prices) : 0,
        max_price: prices.length ? Math.max(...prices) : 0,
      }
      const q = (params.get('q') || '').trim().toLocaleLowerCase()
      const categoriesSelected = params.getAll('category')
      const sellersSelected = params.getAll('seller')
      const inStock = params.get('in_stock') !== 'false'
      let items = eligible
        .filter(
          (p) =>
            (!q ||
              `${p.name} ${p.description} ${p.ingredients} ${p.seller.name}`
                .toLocaleLowerCase()
                .includes(q)) &&
            (!categoriesSelected.length ||
              categoriesSelected.includes(p.category)) &&
            (!sellersSelected.length ||
              sellersSelected.includes(String(p.seller.id))),
        )
        .map((p) => ({
          ...p,
          display_variant: p.variants
            .filter(
              (v) =>
                (!inStock || v.stock > 0) &&
                v.price_minor >= min &&
                v.price_minor <= max,
            )
            .sort((a, b) => a.price_minor - b.price_minor || a.id - b.id)[0],
        }))
        .filter((p) => p.display_variant)
      if (sort === 'name')
        items.sort((a, b) => a.name.localeCompare(b.name) || a.id - b.id)
      if (sort === 'price_asc' || sort === 'price_desc')
        items.sort(
          (a, b) =>
            (a.display_variant.price_minor - b.display_variant.price_minor) *
              (sort === 'price_desc' ? -1 : 1) || a.id - b.id,
        )
      const total = items.length
      items = items.slice((page - 1) * pageSize, page * pageSize)
      return demoResponse(
        {
          items,
          total,
          page,
          page_size: pageSize,
          pages: Math.ceil(total / pageSize),
          facets,
          destination,
          currency: 'USD',
          is_demo: true,
        },
        signal,
      )
    },
    async detail(id, destination = 'GB', signal) {
      const product = products.find(
        (p) =>
          String(p.id) === String(id) &&
          p.active &&
          p.approved &&
          p.seller.approved,
      )
      if (!product)
        throw new ApiError(404, 'This product is no longer available.')
      const related = products.filter(
        (p) =>
          p.id !== product.id &&
          p.active &&
          p.approved &&
          p.seller.approved &&
          p.destinations.includes(destination) &&
          p.variants.some((v) => v.stock > 0),
      )
      related.sort(
        (a, b) =>
          Number(b.category === product.category) -
          Number(a.category === product.category),
      )
      return demoResponse({ ...product, related: related.slice(0, 4) }, signal)
    },
  }
}
export const demoCatalogue = createDemoCatalogue()
