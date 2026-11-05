import React from 'react';
import Icon from './Icon';
import ProductCard from './ProductCard';

export default function CatalogResults({
  visibleProducts,
  selectedCategories,
  sort,
  setSort,
  eligible,
  setEligible,
  inStock,
  setInStock,
  onPending: pending,
}) {
  return (
    <section className="catalog-results" aria-label="Product results">
      <div className="catalog-toolbar"><p aria-live="polite">{visibleProducts.length} products · {selectedCategories.length ? selectedCategories.join(', ') : 'All foods'}</p><label className="catalog-sort">Sort:
        <select aria-label="Sort products" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name</option></select><Icon name="ChevronDown1" /></label></div>
      <div className="catalog-active-filters">
        {eligible && <button className="catalog-pill" onClick={() => setEligible(false)} aria-label="Remove UK eligibility filter">United Kingdom ×</button>}
        {inStock && <button className="catalog-pill catalog-stock-pill" onClick={() => setInStock(false)} aria-label="Remove in-stock filter">In stock ×</button>}
        <span>{eligible ? 'Destination eligibility applied' : 'Demo catalog · United Kingdom destination'}</span>
      </div>
      <div className="catalog-grid">{visibleProducts.map(product => <ProductCard key={product.id} product={product} onPending={pending} />)}</div>
      <p className="catalog-results-end">{visibleProducts.length ? `You’ve seen all ${visibleProducts.length} foods ${visibleProducts.length === 6 ? 'in this demo pantry' : 'matching your filters'}.` : 'No foods match your search and filters. Try another search or reset all filters.'}</p>
    </section>
  );
}
