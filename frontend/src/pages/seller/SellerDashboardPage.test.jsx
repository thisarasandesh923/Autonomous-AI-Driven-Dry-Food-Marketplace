import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../../features/auth/AuthContext'
import { SellerDashboardPage } from './SellerDashboardPage'

const user = {
  id: 1,
  name: 'Seller One',
  email: 'one@example.com',
  role: 'seller',
}
const dashboard = {
  user,
  profile: null,
  is_demo: false,
  summary: {
    total_products: 1,
    available_packs: 5,
    approved_products: null,
    low_stock: null,
    revenue_minor: null,
    open_suborders: null,
    forecast_error: null,
  },
  inventory: [
    {
      id: 1,
      seller_id: 1,
      name: 'Own mango',
      price: '12.50',
      pack_size: '250 g',
      stock_quantity: 5,
    },
  ],
  orders: null,
  forecast: null,
  unavailable: { low_stock: 'Restock thresholds are not configured.' },
}

function mount(get) {
  return render(
    <AuthContext.Provider value={{ user, get, logout: vi.fn() }}>
      <SellerDashboardPage />
    </AuthContext.Provider>,
  )
}

describe('seller dashboard API rendering', () => {
  it('renders the real product contract without invented approvals, variants or currency', async () => {
    const get = vi.fn().mockResolvedValue(dashboard)
    mount(get)
    await screen.findByText('Own mango')
    expect(get).toHaveBeenCalledWith('/seller/dashboard', {
      signal: expect.any(AbortSignal),
    })
    expect(screen.getByText(/1 products · 5 available packs/)).toBeVisible()
    expect(screen.getByText('250 g · 5 packs')).toBeVisible()
    expect(
      screen.getByText('Price 12.50 · currency not configured'),
    ).toBeVisible()
    expect(screen.getByText('Approval status unavailable')).toBeVisible()
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
    expect(screen.queryByText(/DEMO DATA/)).not.toBeInTheDocument()
    const lowStock = screen
      .getByRole('heading', { name: 'Low stock' })
      .closest('article')
    expect(within(lowStock).getByText('Unavailable')).toBeVisible()
    expect(screen.getByText('Order summary unavailable')).toBeVisible()
    expect(screen.getByText('No demand forecast available')).toBeVisible()
  })

  it('distinguishes an empty account from an unavailable inventory', async () => {
    mount(
      vi.fn().mockResolvedValue({
        ...dashboard,
        inventory: [],
        summary: {
          ...dashboard.summary,
          total_products: 0,
          available_packs: 0,
        },
      }),
    )
    await screen.findByText('No products yet')
    expect(screen.getByText(/0 products · 0 available packs/)).toBeVisible()
  })

  it('shows loading, then a request error, and retries without demo fallback', async () => {
    const get = vi
      .fn()
      .mockRejectedValueOnce(new Error('Dashboard temporarily unavailable'))
      .mockResolvedValue(dashboard)
    mount(get)
    expect(screen.getByText('Loading pantry data…')).toBeVisible()
    await screen.findByRole('alert')
    expect(screen.queryByText('No products yet')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByText('Own mango')
    expect(get).toHaveBeenCalledTimes(2)
  })
})
