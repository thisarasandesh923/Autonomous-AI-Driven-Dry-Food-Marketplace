import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const viewport of [
  { width: 1440, height: 960 },
  { width: 1024, height: 1366 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
]) {
  test(`register is usable at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/register')
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveTitle('Create an account · Ceylon Pantry')
    await expect(
      page.getByRole('heading', { name: 'Create an account' }),
    ).toBeVisible()
    const button = page.getByRole('button', { name: 'Create account' })
    await button.scrollIntoViewIfNeeded()
    await expect(button).toBeInViewport()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
    expect(
      await page
        .getByRole('img')
        .evaluate(
          (image) =>
            image.complete &&
            image.naturalWidth > 0 &&
            !image.src.includes('figma.com'),
        ),
    ).toBe(true)
    if (viewport.width === 1440) {
      const image = await page.getByRole('img').boundingBox()
      expect(image.x).toBeCloseTo(60, 0)
      expect(image.y).toBeCloseTo(133, 0)
      expect(image.width).toBeCloseTo(613, 0)
      expect(image.height).toBeCloseTo(499, 0)
      const name = await page.getByLabel('Full name').boundingBox()
      expect(name.x).toBeCloseTo(813, 0)
      expect(name.y).toBeCloseTo(396, 0)
      expect(name.width).toBeCloseTo(495, 0)
      expect(name.height).toBeCloseTo(53, 0)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({
      path: testInfo.outputPath(`register-${viewport.width}.png`),
      fullPage: true,
    })
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze()
    expect(results.violations).toEqual([])
  })
}

test('registration keyboard flow, honest integration state and native navigation', async ({
  page,
}) => {
  const requests = []
  page.on('request', (request) => {
    if (
      ['fetch', 'xhr'].includes(request.resourceType()) ||
      request.method() === 'POST'
    )
      requests.push(request.url())
  })
  await page.goto('/register')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Skip to registration' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Full name')).toBeFocused()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByLabel('Full name')).toBeFocused()
  await expect(page.getByLabel('Full name')).toHaveAccessibleDescription(
    'Enter your full name.',
  )
  await page.getByLabel('Full name').fill('Nimali Perera')
  await page.getByLabel('Email address').fill('not-an-email')
  await page.getByLabel('Password', { exact: true }).fill('sample password')
  await page.getByLabel('Password', { exact: true }).press('Enter')
  await expect(page.getByLabel('Email address')).toBeFocused()
  await page.getByLabel('Email address').fill('buyer@example.com')
  await page.getByLabel('Password', { exact: true }).focus()
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', { name: 'Show password' }),
  ).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  )
  await page.keyboard.press('Space')
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'password',
  )
  await page.keyboard.press('Tab')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toHaveText(
    'Account registration is not available yet. Your details have not been sent.',
  )
  expect(requests).toEqual([])
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 })
  await page.getByRole('link', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page).toHaveTitle('Log in · Ceylon Pantry')
  await page.getByRole('link', { name: 'Create an account' }).click()
  await expect(page).toHaveURL(/\/register$/)
  await page.reload()
  await expect(page.getByLabel('Full name')).toBeVisible()
  await page.goBack()
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible()
  await page.goForward()
  await expect(
    page.getByRole('heading', { name: 'Create an account' }),
  ).toBeVisible()
})

test('registration supports enlarged text and reduced motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/register')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByLabel('Full name')).toBeFocused()
  await expect(page.getByText('Enter your full name.')).toBeVisible()
})
