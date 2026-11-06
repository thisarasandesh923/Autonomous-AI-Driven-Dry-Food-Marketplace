import { useState } from 'react'
import { ProductImage } from './ProductCard'
export function ProductGallery({ product }) {
  const [selected, setSelected] = useState(0)
  const images = product.images.length ? product.images : [null]
  return (
    <div className="detail-gallery">
      <ProductImage image={images[selected]} name={product.name} />
      <div className="gallery-thumbnails">
        {images.map((image, index) => (
          <button
            key={image?.url || index}
            className={selected === index ? 'selected' : ''}
            onClick={() => setSelected(index)}
            aria-label={`View product image ${index + 1}`}
            aria-pressed={selected === index}
          >
            <ProductImage image={image} name={product.name} />
          </button>
        ))}
        <small>
          Seller pack details are listed below. Photographs may be unavailable.
        </small>
      </div>
    </div>
  )
}
