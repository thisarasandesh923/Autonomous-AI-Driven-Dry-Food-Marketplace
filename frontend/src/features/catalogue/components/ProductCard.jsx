import { Link } from '../../../components/Link'
import { Icon } from '../../../components/marketplace/Icon'
import { UnavailableButton } from '../../../components/marketplace/States'
import { catalogueOrigin } from '../../../app/navigation'
import { money } from '../api'
export function ProductImage({ image, name, className = '' }) {
  return image?.url ? (
    <img
      className={`product-photo ${className}`}
      src={image.url}
      alt={image.alt || name}
      loading="lazy"
    />
  ) : (
    <div
      className={`product-placeholder ${className}`}
      role="img"
      aria-label={`${name} — photograph not available`}
    >
      <Icon name="leaf" size={40} />
      <span>Product photograph coming soon</span>
    </div>
  )
}
export function ProductCard({ product }) {
  const variant =
    product.display_variant ||
    product.variants.find((item) => item.stock > 0) ||
    product.variants[0]
  return (
    <article className="product-card">
      <div className="product-media">
        <Link
          href={`/products/${product.id}`}
          state={() => ({ catalogue: catalogueOrigin() })}
        >
          <ProductImage image={product.images[0]} name={product.name} />
        </Link>
        {product.destinations.includes('GB') && (
          <span className="market-badge green">UK eligible</span>
        )}
        <UnavailableButton
          className="wishlist"
          label={`Save ${product.name} — wishlist is not available yet`}
        >
          <Icon name="heart" size={16} />
        </UnavailableButton>
      </div>
      <p className="product-byline">
        {product.origin} · {product.seller.name}
      </p>
      <h3>
        <Link
          href={`/products/${product.id}`}
          state={() => ({ catalogue: catalogueOrigin() })}
        >
          {product.name}
        </Link>
      </h3>
      <div className="product-price">
        <p>
          {variant ? (
            <>
              <strong>{money(variant.price_minor, product.currency)}</strong>
              <span> / {variant.pack}</span>
            </>
          ) : (
            'Price unavailable'
          )}
        </p>
        <Link
          className="product-plus"
          href={`/products/${product.id}`}
          state={() => ({ catalogue: catalogueOrigin() })}
          aria-label={`Choose ${product.name}`}
        >
          +
        </Link>
      </div>
      <p className="product-stock">
        {product.variants.some((v) => v.stock > 0)
          ? 'In stock'
          : 'Out of stock'}{' '}
        · Shipping calculated by seller
      </p>
      {product.is_demo && (
        <small className="demo-label">Illustrative demo product</small>
      )}
    </article>
  )
}
