import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test.skip(
  process.env.VITE_DATA_MODE === 'api',
  'Frontend demonstration tests require demo mode.',
)

test('catalogue works without an API and keeps query, page and scroll on return', async ({
  page,
}) => {
  const apiRequests = []
  page.on('request', (request) => {
    if (/127\.0\.0\.1:800[01]/.test(request.url()))
      apiRequests.push(request.url())
  })
  await page.goto('/products?sort=price_asc&page_size=3&page=2')
  await expect(page.locator('.product-card')).toHaveCount(3)
  await expect(
    page.getByRole('complementary', { name: 'Demonstration data notice' }),
  ).toContainText('DEMO DATA')
  await page.evaluate(() => window.scrollTo(0, 400))
  await page
    .getByRole('link', { name: 'Ceylon cinnamon quills', exact: true })
    .click()
  await expect(page).toHaveURL(/\/products\/1$/)
  await page.getByRole('button', { name: 'View product image 2' }).click()
  await expect(page.locator('.detail-gallery > img')).toHaveAttribute(
    'alt',
    /pack view/,
  )
  await page.getByRole('button', { name: /250 g ·/ }).click()
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(
    page.getByRole('button', { name: 'Add 2 to cart · $36.00' }),
  ).toBeDisabled()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Ceylon cinnamon quills', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Back to shop pantry' }).click()
  await expect(page).toHaveURL(/sort=price_asc&page_size=3&page=2/)
  await expect(page.locator('.product-card')).toHaveCount(3)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(100)
  await page
    .getByRole('link', { name: 'Ceylon cinnamon quills', exact: true })
    .click()
  await expect(page).toHaveURL(/\/products\/1$/)
  await page.goBack()
  await expect(page).toHaveURL(/page=2/)
  expect(apiRequests).toEqual([])
})

test('search, seller/category/price filters, clear, empty and invalid product states', async ({
  page,
}) => {
  await page.goto('/products')
  await expect(page.locator('.product-card')).toHaveCount(6)
  await page.getByLabel('Search foods, ingredients or sellers').fill('mango')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/q=mango/)
  await expect(page.locator('.product-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'Reset all' }).click()
  await expect(page.locator('.product-card')).toHaveCount(6)
  await page.getByLabel('Serendib Spice House', { exact: false }).check()
  await expect(page.locator('.product-card')).toHaveCount(3)
  await page.getByLabel('Vegetables & herbs', { exact: false }).check()
  await expect(page.locator('.product-card')).toHaveCount(1)
  await page.getByLabel('Minimum', { exact: true }).fill('99')
  await expect(
    page.getByText('No foods match your selection.', { exact: false }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Reset all' }).click()
  await expect(page.locator('.product-card')).toHaveCount(6)
  await page.goto('/products/99999')
  await expect(page.getByRole('alert')).toContainText(
    'This product is no longer available',
  )
})

test('seller preview has no login, no backend calls and no fake session', async ({
  page,
}) => {
  const apiRequests = []
  page.on('request', (request) => {
    if (/127\.0\.0\.1:800[01]/.test(request.url()))
      apiRequests.push(request.url())
  })
  await page.goto('/demo/seller/dashboard')
  await expect(
    page.getByRole('heading', { name: 'Serendib Spice House', exact: true }),
  ).toHaveCount(2)
  await expect(page.locator('.seller-kpis .market-badge')).toHaveCount(4)
  await expect(page.locator('#orders')).toContainText('Confirmed (simulated)')
  await expect(page.locator('#inventory .seller-row')).toHaveCount(3)
  await expect(page.locator('#forecasting')).toContainText(
    'DEMO DATA · Synthetic forecast',
  )
  await expect(page.locator('.forecast-chart svg')).toBeVisible()
  await page.getByRole('link', { name: 'Forecasting', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Forecasting', exact: true }),
  ).toHaveAttribute('aria-current', 'location')
  await page.getByText('View demand data').click()
  await expect(page.getByRole('table')).toBeVisible()
  expect(
    await page.evaluate(() => sessionStorage.getItem('dryleaf.access_token')),
  ).toBeNull()
  expect(apiRequests).toEqual([])
  await page.goto('/seller/dashboard')
  await expect(page).toHaveURL(/\/login$/)
})

for (const width of [1440, 768, 390]) {
  test(`frontend-only screens are responsive and accessible at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 960 })
    for (const [name, path] of [
      ['catalogue', '/products'],
      ['details', '/products/1'],
      ['seller', '/demo/seller/dashboard'],
    ]) {
      await page.goto(path)
      const ready =
        name === 'catalogue'
          ? page.locator('.product-card').first()
          : name === 'details'
            ? page.getByRole('heading', {
                name: 'Ceylon cinnamon quills',
                exact: true,
              })
            : page.locator('.forecast-chart svg')
      await expect(ready).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true)
      const audit = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      expect(audit.violations).toEqual([])
      await page.screenshot({
        path: testInfo.outputPath(`${name}-${width}.png`),
        fullPage: true,
      })
    }
  })
}
