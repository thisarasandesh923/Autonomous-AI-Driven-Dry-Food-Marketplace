import React from 'react';

export default function AccountLayout({ children }) {
  return (
    <>
      <header className="masthead">
        <span className="brand">Ceylon Pantry</span>
        <span className="account-caption">BUYER ACCOUNT</span>
      </header>
      <main className="login-layout">
        <aside className="editorial" aria-label="From the island, Sri Lanka">
          <img className="food-photo" src="/assets/island-ingredients.png"
            alt="Dried fruit, cinnamon, spices, curry leaves and coconut arranged on a linen-covered table" />
          <div className="editorial-copy">
            <p className="island-caption">FROM THE ISLAND <span>/</span> SRI LANKA</p>
            <h2>A little island.<br />A generous pantry.</h2>
          </div>
        </aside>
        {children}
      </main>
    </>
  );
}
