import { useCallback } from 'react'
import { useAuth } from '../../features/auth/AuthContext'
import { useResource } from '../../api/useResource'
import { sellerApi } from '../../features/seller/api'
import { SellerLayout } from '../../layouts/SellerLayout'
import { RequestState, Notice } from '../../components/marketplace/States'
import { SellerKpiGrid } from '../../features/seller/components/SellerKpiGrid'
import {
  SellerOrdersSummary,
  SellerInventorySummary,
} from '../../features/seller/components/SellerSummaries'
import { SellerForecastPanel } from '../../features/seller/components/SellerForecastPanel'
import { demoEnabled } from '../../config/dataMode'
export function SellerDashboardPage({ preview = false, previewIdentity }) {
  const { user: authenticatedUser, get } = useAuth()
  const isPreview = demoEnabled && preview
  const user = isPreview ? previewIdentity : authenticatedUser
  const fetcher = useCallback(
    async (signal) =>
      isPreview
        ? (
            await import('../../mocks/sellerService')
          ).demoSellerService.dashboard(signal)
        : sellerApi.dashboard(get, signal),
    [get, isPreview],
  )
  const resource = useResource(
    `seller:${isPreview ? 'preview' : user.id}`,
    fetcher,
  )
  const data = resource.data
  return (
    <SellerLayout
      profile={data?.profile}
      user={user}
      isDemo={isPreview || data?.is_demo}
    >
      <title>Seller dashboard · Ceylon Pantry</title>
      <RequestState {...resource}>
        {data && (
          <>
            <section id="overview" className="seller-title">
              <p className="market-eyebrow">Operational dashboard</p>
              <h1>{data.profile?.name || user.name}</h1>
              <p>
                {data.profile?.location || 'Business profile pending'}
                {data.summary &&
                  ` · ${data.summary.approved_products} approved products · ${data.summary.available_packs} available packs`}
              </p>
              {data.snapshot_at && (
                <Notice>
                  Snapshot{' '}
                  {new Date(data.snapshot_at).toLocaleString('en-GB', {
                    timeZone: 'UTC',
                  })}{' '}
                  UTC {data.is_demo && '· Illustrative demo catalogue'}
                </Notice>
              )}
            </section>
            <SellerKpiGrid summary={data.summary} isDemo={data.is_demo} />
            <div className="seller-summary-grid">
              <SellerOrdersSummary
                orders={data.orders}
                reason={data.unavailable?.orders}
                isDemo={data.is_demo}
              />
              <SellerInventorySummary
                inventory={data.inventory}
                isDemo={data.is_demo}
              />
            </div>
            <SellerForecastPanel
              forecast={data.forecast}
              reason={data.unavailable?.forecast}
            />
          </>
        )}
      </RequestState>
    </SellerLayout>
  )
}
