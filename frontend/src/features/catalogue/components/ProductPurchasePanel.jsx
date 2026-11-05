import { useState } from 'react'
import { money } from '../api'
import { UnavailableButton } from '../../../components/marketplace/States'
import { Icon } from '../../../components/marketplace/Icon'

export function ProductPurchasePanel({ product }) {
  const [variantId, setVariantId] = useState(
    product.variants.find((v) => v.stock > 0)?.id || product.variants[0]?.id,
  )
  const [quantity, setQuantity] = useState(1)
  const variant = product.variants.find((v) => v.id === variantId)
  const eligible = product.destinations.includes('GB')
  return (
    <>
      <div className="filter-chips">
        <span className={`market-badge ${eligible ? 'green' : ''}`}>
          {eligible ? 'UK eligible' : 'Not eligible for UK'}
        </span>
        <span className="market-badge">
          {variant?.stock
            ? `In stock · ${variant.stock} packs`
            : 'Out of stock'}
        </span>
        {product.is_demo && (
          <span className="market-badge">Illustrative demo</span>
        )}
      </div>
      <p className="product-seller-label">
        {product.seller.name} · {product.origin}
      </p>
      <h1>{product.name}</h1>
      <p className="product-description">{product.description}</p>
      <p className="detail-price">
        {variant
          ? money(variant.price_minor, product.currency)
          : 'Price unavailable'}{' '}
        <span>
          {product.currency} / {variant?.pack}
        </span>
      </p>
      <div className="purchase-options">
        <span>Pack size</span>
        {product.variants.map((v) => (
          <button
            className={`variant ${v.id === variantId ? 'selected' : ''}`}
            key={v.id}
            aria-pressed={v.id === variantId}
            onClick={() => {
              setVariantId(v.id)
              setQuantity(1)
            }}
          >
            {v.pack} · {money(v.price_minor, product.currency)}
          </button>
        ))}
      </div>
      <div className="purchase-actions">
        <div className="quantity">
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => q - 1)}
          >
            −
          </button>
          <output aria-label="Quantity">{quantity}</output>
          <button
            aria-label="Increase quantity"
            disabled={!eligible || !variant || quantity >= variant.stock}
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        <UnavailableButton className="market-primary">
          Add {quantity} to cart ·{' '}
          {money((variant?.price_minor || 0) * quantity, product.currency)}
        </UnavailableButton>
        <UnavailableButton
          className="market-outline"
          label="Wishlist is not available yet"
        >
          <Icon name="heart" />
        </UnavailableButton>
      </div>
      <p className="market-muted purchase-note">
        Cart and wishlist are not available in this phase. No items will be
        saved.
      </p>
      <div className="shipping-panel">
        <strong>
          {eligible
            ? 'Available for United Kingdom'
            : 'Unavailable for United Kingdom'}
        </strong>
        <p>
          {product.shipping || 'Shipping estimates have not been provided.'}
        </p>
      </div>
      <p className="market-muted purchase-note">
        Approved listing · {product.active ? 'Active' : 'Inactive'}. Destination
        eligibility is a marketplace setting, not a customs certification.
      </p>
    </>
  )
}
