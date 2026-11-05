import React from 'react';
import Icon from './Icon';

export default function ProductCard({ product, onPending: pending }) {
  return (
    <article className="catalog-card">
                <div className="catalog-product-image"><img className="catalog-photo" src={'/assets/catalog/' + product.image} alt={product.name} />
                  <span className="catalog-eligible">UK eligible</span><button className="catalog-save" aria-label={`Save ${product.name}`} onClick={() => pending(`Save ${product.name}`)}><Icon name="Heart" /></button>
                </div>
                <div className="catalog-product-info"><p className="catalog-origin">{product.origin} · {product.seller}</p><h2>{product.name}</h2>
                  <div className="catalog-product-price"><p><strong>${product.price.toFixed(2)}</strong> <span>/ {product.pack}</span></p><button aria-label={`Add ${product.name} to cart`} onClick={() => pending(`Add ${product.name} to cart`)}><Icon name="Plus" /></button></div>
                  <p className="catalog-shipping">In stock · Shipping calculated by seller</p>
                </div>
              </article>
  );
}
