import React from 'react';
import Icon from './Icon';

export default function StorefrontHeader({ onPending: pending, onSearchFocus }) {
  return (
    <header>
      <div className="catalog-prototype"><span>A little island. A generous pantry.</span><span>DESIGN PROTOTYPE · Illustrative sellers, products &amp; prices · USD</span></div>
      <div className="catalog-navigation">
        <a className="catalog-brand" href="/shop"><Icon name="Sprout" />Ceylon Pantry</a>
        <nav aria-label="Storefront"><button onClick={() => pending('Explore')}>Explore</button><a href="/shop" aria-current="page">Shop pantry</a><button onClick={() => pending('Our makers')}>Our makers</button></nav>
        <div className="catalog-utilities">
          <button className="catalog-destination" onClick={() => pending('Destination selection')}><Icon name="MapPin" />United Kingdom<Icon name="ChevronDown" /></button>
          <button aria-label="Focus product search" onClick={onSearchFocus}><Icon name="Search" /></button>
          <a href="/login" aria-label="Buyer login"><Icon name="UserRound" /></a>
          <button aria-label="Cart, 3 illustrative items" onClick={() => pending('Cart')}><Icon name="ShoppingBag" /><span>3</span></button>
        </div>
      </div>
    </header>
  );
}
