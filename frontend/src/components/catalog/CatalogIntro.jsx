import React from 'react';
import Icon from './Icon';

export default function CatalogIntro({ search, setSearch, setQuery, searchInput }) {
  return (
    <section className="catalog-intro" aria-labelledby="catalog-title">
      <p className="catalog-breadcrumb">Home / Shop pantry</p>
      <div className="catalog-heading"><div><h1 id="catalog-title">The island pantry.</h1><p>Good ingredients, honest origins. Find something worth bringing home.</p></div><span className="catalog-pill">United Kingdom · Demo destination</span></div>
      <form className="catalog-search" role="search" onSubmit={event => { event.preventDefault(); setQuery(search); }}>
        <Icon name="Search" /><label className="catalog-sr-only" htmlFor="catalog-search">Search foods, ingredients or sellers</label>
        <input ref={searchInput} id="catalog-search" type="search" placeholder="Search foods, ingredients or sellers" value={search} onChange={event => setSearch(event.target.value)} />
        <button type="submit" className="catalog-primary">Search</button>
      </form>
      <div className="catalog-note"><Icon name="Info" /><p>Showing only approved, active, in-stock items eligible for United Kingdom. All prices in USD. Shipping is charged per seller; demo shipping estimates appear before checkout.</p></div>
    </section>
  );
}
