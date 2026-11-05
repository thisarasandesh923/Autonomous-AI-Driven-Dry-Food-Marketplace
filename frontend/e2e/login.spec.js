import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1440, height: 960 },
  { width: 1024, height: 1366 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
]) {
  test(`login is usable at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/login')
    await page.evaluate(() => document.fonts.ready)
    await expect(
      page.getByRole('heading', { name: 'Welcome back' }),
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Log in', exact: true }),
    ).toBeInViewport()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    expect(
      await page
        .getByRole('img')
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    ).toBe(true)
    expect(
      await page.evaluate(
        () =>
          document.fonts.check('16px Inter') &&
          document.fonts.check('34px "DM Serif Display"'),
      ),
    ).toBe(true)

    await page.screenshot({
      path: testInfo.outputPath(`login-${viewport.width}.png`),
      fullPage: true,
    })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}

test('keyboard validation, password visibility and API errors', async ({
  page,
}) => {
  await page.route('**/auth/login', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Invalid email or password' }),
    }),
  )
  const requests = []
  page.on('request', (request) => {
    if (
      ['fetch', 'xhr'].includes(request.resourceType()) ||
      request.method() === 'POST'
    )
      requests.push(request.url())
  })
  await page.goto('/login')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to login' })).toBeFocused()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page.getByLabel('Email address')).toBeFocused()
  await expect(page.getByText('Enter your password.')).toBeVisible()
  await page.getByLabel('Email address').fill('not-an-email')
  await page.getByLabel('Password', { exact: true }).fill('not-a-real-password')
  await page.getByLabel('Password', { exact: true }).press('Enter')
  await expect(
    page.getByText('Enter a valid email address, such as you@example.com.'),
  ).toBeVisible()
  await page.getByLabel('Email address').fill('buyer@example.com')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  )
  await page.getByRole('button', { name: 'Hide password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'password',
  )
  await page.getByLabel('Password', { exact: true }).press('Enter')
  await expect(page.getByText('Invalid email or password')).toBeVisible()
  await page.getByRole('link', { name: 'Create an account' }).click()
  await expect(page).toHaveURL(/\/register/)
  await expect(page.getByLabel('Full name')).toBeVisible()
  await page.getByRole('link', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible()
  expect(requests).toHaveLength(1)
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 })
})

test('remains usable with enlarged text and reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/login')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page.getByText('Enter your email address.')).toBeVisible()
})
