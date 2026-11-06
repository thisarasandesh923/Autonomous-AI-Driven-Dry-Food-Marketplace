import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const liveApi = process.env.DRYLEAF_LIVE_API
test.skip(!liveApi, 'Requires the disposable tests.live_api FastAPI server.')

test.beforeEach(async ({ page }) => {
  await page.route('http://127.0.0.1:8000/**', (route) =>
    route.continue({
      url: route.request().url().replace('http://127.0.0.1:8000', liveApi),
    }),
  )
})

async function createSeller(request) {
  const credentials = {
    email: `seller-${randomUUID()}@example.com`,
    password: 'TestPassword123!',
  }
  const registered = await request.post(`${liveApi}/auth/register`, {
    data: { ...credentials, name: 'Integration Seller', role: 'seller' },
  })
  expect(registered.status()).toBe(201)
  const login = await request.post(`${liveApi}/auth/login`, {
    data: credentials,
  })
  expect(login.ok()).toBe(true)
  const { access_token } = await login.json()
  return {
    ...credentials,
    headers: { Authorization: `Bearer ${access_token}` },
  }
}

async function addProduct(request, account, name, stock) {
  const response = await request.post(`${liveApi}/seller/products`, {
    headers: account.headers,
    data: {
      name,
      description: 'Integration test product',
      category: 'Fruit',
      price: '12.50',
      pack_size: '250 g',
      stock_quantity: stock,
      origin: 'Sri Lanka',
    },
  })
  expect(response.status()).toBe(201)
}

async function login(page, account) {
  await page.goto('/login')
  await page.getByLabel('Email address').fill(account.email)
  await page.getByLabel('Password', { exact: true }).fill(account.password)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(/\/seller\/dashboard$/)
  await expect(
    page.getByRole('heading', { name: 'Inventory', exact: true }),
  ).toBeVisible()
}

test('real seller API: empty account, owned inventory, refresh and error recovery', async ({
  page,
  request,
}) => {
  const own = await createSeller(request)
  const other = await createSeller(request)
  await addProduct(request, other, 'Another seller private stock', 999)
  await login(page, own)
  await expect(page.getByText('No products yet')).toBeVisible()
  await expect(page.getByText(/0 products · 0 available packs/)).toBeVisible()
  await addProduct(request, own, 'Own mango', 5)
  await addProduct(request, own, 'Own sold out', 0)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Own mango' })).toBeVisible()
  await expect(page.locator('#inventory .seller-row')).toHaveCount(2)
  await expect(page.getByText(/2 products · 5 available packs/)).toBeVisible()
  await expect(page.getByText('250 g · 0 packs')).toBeVisible()
  await expect(page.getByText('Another seller private stock')).toHaveCount(0)
  await expect(page.getByText('Order summary unavailable')).toBeVisible()
  await expect(page.getByText('No demand forecast available')).toBeVisible()
  await expect(
    page.getByText('Restock thresholds are not configured.'),
  ).toBeVisible()
  let failing = true
  await page.route('http://127.0.0.1:8000/seller/dashboard', (route) =>
    failing
      ? route.fulfill({
          status: 503,
          json: { detail: 'Dashboard temporarily unavailable' },
        })
      : route.fallback(),
  )
  await page.reload()
  await expect(page.getByRole('alert')).toContainText(
    'Dashboard temporarily unavailable',
  )
  await expect(page.getByText('No products yet')).toHaveCount(0)
  failing = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('heading', { name: 'Own mango' })).toBeVisible()
  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/seller/dashboard')
  await expect(page).toHaveURL(/\/login$/)
})

for (const width of [1440, 768, 390]) {
  test(`live seller inventory fits and is accessible at ${width}px`, async ({
    page,
    request,
  }, testInfo) => {
    const account = await createSeller(request)
    await addProduct(request, account, 'Own mango', 5)
    await page.setViewportSize({ width, height: 960 })
    await login(page, account)
    await expect(page.getByRole('heading', { name: 'Own mango' })).toBeVisible()
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
      path: testInfo.outputPath(`seller-live-${width}.png`),
      fullPage: true,
    })
  })
}
