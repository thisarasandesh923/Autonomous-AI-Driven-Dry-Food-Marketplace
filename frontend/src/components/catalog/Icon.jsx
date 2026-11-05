import React from 'react';

const assetPath = '/assets/catalog/';
export default function Icon({ name }) {
  return <img className="catalog-icon" src={`${assetPath}img${name}.svg`} alt="" />;
}

