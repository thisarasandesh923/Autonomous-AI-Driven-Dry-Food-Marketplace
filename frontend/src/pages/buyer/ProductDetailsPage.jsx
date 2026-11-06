import { useCallback } from 'react'
import { BuyerLayout } from '../../layouts/BuyerLayout'
import { Link } from '../../components/Link'
import { navigate, catalogueOrigin } from '../../app/navigation'
import {
  RequestState,
  UnavailableButton,
} from '../../components/marketplace/States'
import { catalogueApi } from '../../features/catalogue/api'
import { useResource } from '../../api/useResource'
import { ProductCard } from '../../features/catalogue/components/ProductCard'
import { ProductGallery } from '../../features/catalogue/components/ProductGallery'
import { ProductPurchasePanel } from '../../features/catalogue/components/ProductPurchasePanel'
import { ProductInformation } from '../../features/catalogue/components/ProductInformation'

export function ProductDetailsPage({ id }) {
  const fetcher = useCallback(
    (signal) => catalogueApi.detail(id, 'GB', signal),
    [id],
  )
  const resource = useResource(id, fetcher)
  const product = resource.data
  const origin = catalogueOrigin()
  return (
    <BuyerLayout>
      <title>
        {product
          ? `${product.name} · Ceylon Pantry`
          : 'Product · Ceylon Pantry'}
      </title>
      <nav className="market-breadcrumb" aria-label="Breadcrumb">
        <Link href="/products">Home</Link> /{' '}
        <button
          onClick={() =>
            navigate(origin.url, { state: { scroll: origin.scroll } })
          }
        >
          Back to shop pantry
        </button>
        {product && (
          <>
            {' '}
            /{' '}
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
            >
              {product.category}
            </Link>{' '}
            / {product.name}
          </>
        )}
      </nav>
      <RequestState {...resource}>
        {product && (
          <>
            <div className="detail-grid">
              <ProductGallery key={product.id} product={product} />
              <section
                className="detail-summary"
                aria-label="Product purchase information"
              >
                <ProductPurchasePanel key={product.id} product={product} />
              </section>
              <ProductInformation key={product.id} product={product} />
              <aside className="detail-aside">
                <div className="market-panel">
                  <h2>{product.seller.name}</h2>
                  <p>{product.seller.description || product.seller.location}</p>
                  <div className="purchase-actions">
                    <Link
                      className="market-outline"
                      href={`/products?seller=${product.seller.id}`}
                    >
                      Browse seller’s products →
                    </Link>
                    <UnavailableButton className="market-outline">
                      Contact seller
                    </UnavailableButton>
                  </div>
                </div>
                <div className="companion">
                  <h3>✧ Ask the pantry · AI guidance</h3>
                  <p>Product comparison guidance is not available yet.</p>
                  <small>
                    Seller-provided product facts remain separate from AI
                    explanations.
                  </small>
                </div>
              </aside>
            </div>
            <section className="related-products">
              <div className="section-heading">
                <h2>A few more for your pantry.</h2>
                <small>Catalog picks · In stock · UK eligible</small>
              </div>
              {product.related.length ? (
                <div className="product-grid related-grid">
                  {product.related.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <p>No related products are currently available.</p>
              )}
            </section>
          </>
        )}
      </RequestState>
    </BuyerLayout>
  )
}
