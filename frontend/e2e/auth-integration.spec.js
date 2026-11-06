import { expect, test } from '@playwright/test'

test.skip(
  !process.env.DRYLEAF_LIVE_API,
  'Set DRYLEAF_LIVE_API to the disposable FastAPI server URL.',
)

for (const role of ['buyer', 'seller']) {
  test(`real API: ${role} registration, login, session, role protection and logout`, async ({
    page,
  }) => {
    const email = `${role}-${Date.now()}@example.com`
    const password = 'TestPassword123!'
    const requests = []
    await page.route('http://127.0.0.1:8000/**', (route) => {
      const request = route.request()
      requests.push({
        path: new URL(request.url()).pathname,
        headers: request.headers(),
      })
      return route.continue({
        url: request
          .url()
          .replace('http://127.0.0.1:8000', process.env.DRYLEAF_LIVE_API),
      })
    })
    await page.goto('/register')
    await page.getByLabel('Full name').fill('Kamal Perera')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Account role').selectOption(role)
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL(/\/login$/)
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Log in', exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`/${role}/dashboard$`))
    if (role === 'seller')
      await expect(
        page.getByRole('heading', { name: 'Inventory' }),
      ).toBeVisible()
    else
      await expect(page.getByText('Welcome to Buyer Dashboard!')).toBeVisible()
    const protectedRequest = requests.find(
      (request) => request.path === `/${role}/dashboard`,
    )
    expect(protectedRequest.headers.authorization).toMatch(/^Bearer /)
    await page.reload()
    await expect(page.getByText(email)).toBeVisible()
    expect(requests.some((request) => request.path === '/auth/me')).toBe(true)
    await page.goto(`/${role === 'buyer' ? 'seller' : 'buyer'}/dashboard`)
    await expect(page).toHaveURL(new RegExp(`/${role}/dashboard$`))
    await page.getByRole('button', { name: 'Log out' }).click()
    await expect(page).toHaveURL(/\/login$/)
    expect(
      await page.evaluate(() => sessionStorage.getItem('dryleaf.access_token')),
    ).toBeNull()
  })
}
