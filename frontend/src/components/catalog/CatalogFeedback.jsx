import React from 'react';

export default function CatalogFeedback({ notice, onDismiss }) {
  return (
    notice && <div className="catalog-feedback"><p role="status">{notice}</p><button aria-label="Dismiss message" onClick={onDismiss}>×</button></div>
  );
}
