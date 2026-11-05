import React from 'react';
import useCatalog from '../hooks/useCatalog';
import StorefrontHeader from '../components/catalog/StorefrontHeader';
import CatalogIntro from '../components/catalog/CatalogIntro';
import CatalogFilters from '../components/catalog/CatalogFilters';
import CatalogResults from '../components/catalog/CatalogResults';
import StorefrontFooter from '../components/catalog/StorefrontFooter';
import CatalogFeedback from '../components/catalog/CatalogFeedback';

export default function CatalogPage() {
  const catalog = useCatalog();
  return <div className="catalog-page">
    <StorefrontHeader onPending={catalog.pending} onSearchFocus={() => catalog.searchInput.current?.focus()} />
    <main>
      <CatalogIntro search={catalog.search} setSearch={catalog.setSearch} setQuery={catalog.setQuery} searchInput={catalog.searchInput} />
      <div className="catalog-body">
        <CatalogFilters selectedCategories={catalog.selectedCategories} setCategories={catalog.setCategories}
          selectedSellers={catalog.selectedSellers} setSellers={catalog.setSellers}
          maxPrice={catalog.maxPrice} setMaxPrice={catalog.setMaxPrice}
          inStock={catalog.inStock} setInStock={catalog.setInStock} eligible={catalog.eligible} setEligible={catalog.setEligible}
          toggle={catalog.toggle} onReset={catalog.reset} onPending={catalog.pending} />
        <CatalogResults visibleProducts={catalog.visibleProducts} selectedCategories={catalog.selectedCategories}
          sort={catalog.sort} setSort={catalog.setSort} eligible={catalog.eligible} setEligible={catalog.setEligible}
          inStock={catalog.inStock} setInStock={catalog.setInStock} onPending={catalog.pending} />
      </div>
    </main>
    <StorefrontFooter onPending={catalog.pending} />
    <CatalogFeedback notice={catalog.notice} onDismiss={() => catalog.setNotice('')} />
  </div>;
}
