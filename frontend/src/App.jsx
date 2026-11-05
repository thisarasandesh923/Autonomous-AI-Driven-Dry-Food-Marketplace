import React, { useEffect } from 'react';
import AccountPage from './pages/AccountPage';
import CatalogPage from './pages/CatalogPage';
import './styles/styles.css';
import './styles/catalog.css';

export default function App() {
  // Preserve the existing pathname routing and normal browser navigation.
  const pathname = window.location.pathname.replace(/\/$/, '');
  const isRegistration = pathname === '/register';
  const isCatalog = pathname === '/shop';
  const title = isCatalog ? 'Product catalog' : isRegistration ? 'Buyer registration' : 'Buyer login';

  useEffect(() => {
    document.title = title + ' · Ceylon Pantry';
  }, [title]);

  return isCatalog ? <CatalogPage /> : <AccountPage isRegistration={isRegistration} />;
}
