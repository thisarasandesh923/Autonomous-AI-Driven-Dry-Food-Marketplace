import { describe, expect, it } from 'vitest'
import { createDemoCatalogue } from './catalogueService'
import { demoProducts, makeDemoDashboard } from './data'

describe('frontend-only demo contract', () => {
  it('filters and sorts before pagination without network access', async () => {
    const service = createDemoCatalogue()
    const result = await service.list('sort=price_asc&page_size=2&page=2')
    expect(result.total).toBe(6)
    expect(result.items.map((p) => p.name)).toEqual([
      'Traditional red rice',
      'Roasted curry powder',
    ])
    expect((await service.list('q=mango')).total).toBe(1)
    expect((await service.list('q=Serendib')).total).toBe(3)
    expect(
      (await service.list('seller=1&category=Vegetables+%26+herbs')).items[0]
        .name,
    ).toBe('Dried curry leaves')
    expect(
      (await service.list('min_price=1500')).items[0].display_variant.pack,
    ).toBe('250 g')
    expect((await service.list('destination=US')).total).toBe(0)
  })
  it('implements availability and excludes inactive or unapproved records', async () => {
    const products = structuredClone(demoProducts)
    products[0].variants.forEach((v) => {
      v.stock = 0
    })
    products[1].approved = false
    const service = createDemoCatalogue(products)
    expect((await service.list('')).total).toBe(4)
    expect((await service.list('in_stock=false')).total).toBe(5)
    await expect(service.detail(2)).rejects.toMatchObject({ status: 404 })
  })
  it('validates malformed query state and supports cancellation', async () => {
    const service = createDemoCatalogue()
    for (const query of [
      'min_price=800&max_price=1',
      'page=0',
      'sort=made-up',
      'page_size=999',
    ]) {
      await expect(service.list(query)).rejects.toMatchObject({ status: 422 })
    }
    const controller = new AbortController()
    const pending = service.list('', controller.signal)
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
  })
  it('returns isolated copies, variant/gallery data and related products', async () => {
    const service = createDemoCatalogue()
    const product = await service.detail('1')
    expect(product.images).toHaveLength(3)
    expect(product.variants).toHaveLength(2)
    expect(product.related).toHaveLength(4)
    product.variants[0].stock = 0
    expect((await service.detail(1)).variants[0].stock).toBe(82)
    await expect(service.detail('missing')).rejects.toMatchObject({
      status: 404,
    })
  })
  it('labels seller orders, KPIs and synthetic forecast as demonstration only', () => {
    const data = makeDemoDashboard()
    expect(data.is_demo).toBe(true)
    expect(data.orders[0].payment_status).toContain('simulated')
    expect(data.forecast.source).toContain('DEMO DATA')
    expect(data.forecast.history).toHaveLength(12)
    expect(
      data.forecast.predicted.reduce((total, p) => total + p.units, 0),
    ).toBe(data.forecast.estimated_units)
    expect(data.summary.available_packs).toBe(
      data.inventory
        .flatMap((p) => p.variants)
        .reduce((sum, v) => sum + v.stock, 0),
    )
  })
})
