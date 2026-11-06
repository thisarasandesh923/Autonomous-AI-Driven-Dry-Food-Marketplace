import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.skip(
  !process.env.DRYLEAF_LIVE_API,
  'Requires the isolated seeded FastAPI server.',
)
test.beforeEach(async ({ page }) => {
  await page.route('http://127.0.0.1:8000/**', (route) =>
    route.continue({
      url: route
        .request()
        .url()
        .replace('http://127.0.0.1:8000', process.env.DRYLEAF_LIVE_API),
    }),
  )
})
async function loginSeller(page) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill('demo-seller-1@example.com')
  await page.getByLabel('Password', { exact: true }).fill('DemoPassword123!')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(/\/seller\/dashboard$/)
  await expect(
    page.getByRole('heading', { name: 'Inventory', exact: true }),
  ).toBeVisible()
}

test('public search, filter, sort, empty results and reset use real APIs', async ({
  page,
}) => {
  await page.goto('/products')
  await expect(page.getByText('6 products · All foods')).toBeVisible()
  await page.getByLabel('Search foods, ingredients or sellers').fill('mango')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page).toHaveURL(/q=mango/)
  await expect(page.locator('.product-card')).toHaveCount(1)
  await page.getByRole('button', { name: 'Reset all' }).click()
  await expect(page.locator('.product-card')).toHaveCount(6)
  await page.getByLabel('Sort:').selectOption('price_asc')
  await expect(page.locator('.product-card h3').first()).toHaveText(
    'Dried curry leaves',
  )
  await page.getByLabel('Dried fruits', { exact: false }).check()
  await expect(page.locator('.product-card')).toHaveCount(1)
  await page.getByLabel('Minimum', { exact: true }).fill('99')
  await expect(
    page.getByText('No foods match your selection.', { exact: false }),
  ).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Minimum', { exact: true })).toHaveValue('99')
  await page.getByRole('button', { name: 'Reset all' }).click()
  await expect(page.locator('.product-card')).toHaveCount(6)
})

test('details quantity, tabs, related products, reload and catalogue Back preserve query and scroll', async ({
  page,
}) => {
  await page.goto('/products?sort=price_asc&page_size=3&page=2')
  await expect(page.locator('.product-card')).toHaveCount(3)
  await page.evaluate(() => window.scrollTo(0, 360))
  await page
    .getByRole('link', { name: 'Ceylon cinnamon quills', exact: true })
    .click()
  await expect(page).toHaveURL(/\/products\/1$/)
  await expect(
    page.getByRole('heading', { name: 'Ceylon cinnamon quills', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(
    page.getByRole('button', { name: 'Add 2 to cart · $16.00' }),
  ).toBeDisabled()
  await page.getByRole('tab', { name: 'Shipping & returns' }).click()
  await expect(
    page.getByRole('heading', { name: 'Returns', exact: true }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Ceylon cinnamon quills', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Back to shop pantry' }).click()
  await expect(page).toHaveURL(/sort=price_asc&page_size=3&page=2/)
  await expect(page.getByLabel('Sort:')).toHaveValue('price_asc')
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(100)
  await page
    .getByRole('link', { name: 'Ceylon cinnamon quills', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Ceylon cinnamon quills', exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.locator('.product-card')).toHaveCount(3)
})

test('seller overview is owned, read-only, and public browsing works when signed in', async ({
  page,
}) => {
  await loginSeller(page)
  await expect(page.locator('#inventory .seller-row')).toHaveCount(3)
  await expect(page.getByText('Order summary unavailable')).toBeVisible()
  await expect(page.getByText('No demand forecast available')).toBeVisible()
  await expect(page.getByText('Low stock · threshold 15')).toBeVisible()
  await page.getByRole('link', { name: /Forecasting/ }).click()
  await expect(page).toHaveURL(/#forecasting$/)
  await page.goto('/products')
  await expect(page.locator('.product-card')).toHaveCount(6)
  await page.goto('/buyer/dashboard')
  await expect(page).toHaveURL(/\/seller\/dashboard$/)
})

test('public error, retry, and missing product states', async ({ page }) => {
  let failing = true
  await page.route('http://127.0.0.1:8000/products?**', (route) =>
    failing
      ? route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Catalogue temporarily unavailable' }),
        })
      : route.fallback(),
  )
  await page.goto('/products')
  await expect(page.getByRole('alert')).toContainText(
    'Catalogue temporarily unavailable',
  )
  failing = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.locator('.product-card')).toHaveCount(6)
  await page.goto('/products/99999')
  await expect(page.getByRole('alert')).toContainText(
    'This product is no longer available',
  )
})

for (const width of [1440, 768, 390]) {
  test(`three screens fit and pass accessibility checks at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 960 })
    for (const [name, path] of [
      ['catalogue', '/products'],
      ['details', '/products/1'],
      ['seller', '/seller/dashboard'],
    ]) {
      if (name === 'seller') await loginSeller(page)
      else await page.goto(path)
      await expect(
        name === 'catalogue'
          ? page.locator('.product-card').first()
          : name === 'details'
            ? page.getByRole('heading', {
                name: 'Ceylon cinnamon quills',
                exact: true,
              })
            : page.getByRole('heading', { name: 'Inventory', exact: true }),
      ).toBeVisible()
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
