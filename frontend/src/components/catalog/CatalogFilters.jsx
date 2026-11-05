import React from 'react';
import Icon from './Icon';
import FilterOption from './FilterOption';
import { categories, sellers, products } from '../../data/catalogData';

export default function CatalogFilters({
  selectedCategories,
  setCategories,
  selectedSellers,
  setSellers,
  maxPrice,
  setMaxPrice,
  inStock,
  setInStock,
  eligible,
  setEligible,
  toggle,
  onReset: reset,
  onPending: pending,
}) {
  return (
    <aside className="catalog-filters" aria-label="Product filters">
      <div className="catalog-filter-heading"><h2>Filters</h2><button onClick={reset}>Reset all</button></div>
      <fieldset><legend>CATEGORY</legend>
        <FilterOption label="All foods" count={6} checked={!selectedCategories.length} onChange={() => setCategories([])} />
        {categories.map(category => <FilterOption key={category} label={category} count={products.filter(p => p.category === category).length} checked={selectedCategories.includes(category)} onChange={() => toggle(category, selectedCategories, setCategories)} />)}
      </fieldset>
      <fieldset><legend>PRICE / USD</legend>
        <label className="catalog-sr-only" htmlFor="maximum-price">Maximum price in USD</label>
        <input id="maximum-price" type="range" min="3.5" max="8" step="0.5" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))} aria-valuetext={`$${maxPrice.toFixed(2)}`} />
        <div className="catalog-price-endpoints"><span>$3.50</span><output htmlFor="maximum-price">${maxPrice.toFixed(2)}</output></div>
      </fieldset>
      <fieldset><legend>SELLER</legend>{sellers.map(seller => <FilterOption key={seller} label={seller} count={3} checked={selectedSellers.includes(seller)} onChange={() => toggle(seller, selectedSellers, setSellers)} />)}</fieldset>
      <fieldset><legend>AVAILABILITY</legend>
        <FilterOption label="In stock" count={6} checked={inStock} onChange={() => setInStock(!inStock)} />
        <FilterOption label="UK eligible" count={6} checked={eligible} onChange={() => setEligible(!eligible)} />
      </fieldset>
      <div className="catalog-help"><Icon name="Sparkles" /><h2>Not sure where to start?</h2><p>Ask the AI assistant to compare these foods using seller-provided product details.</p><button onClick={() => pending('Ask the pantry')}>Ask the pantry ✧</button></div>
    </aside>
  );
}
