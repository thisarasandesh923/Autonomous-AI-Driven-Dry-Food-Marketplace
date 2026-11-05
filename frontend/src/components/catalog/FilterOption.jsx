import React from 'react';

export default function FilterOption({ label, count, checked, onChange }) {
  return <label className="catalog-option">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span>{label}</span><small>{count}</small>
  </label>;
}

