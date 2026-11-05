import React from 'react';

export default function StorefrontFooter({ onPending: pending }) {
  return (
    <footer className="catalog-footer"><span>Ceylon Pantry</span><div><button onClick={() => pending('Help & shipping')}>Help &amp; shipping</button> · <button onClick={() => pending('Our makers')}>Our makers</button> · <button onClick={() => pending('Privacy & terms')}>Privacy &amp; terms</button></div><p>Demo · UK destination · USD checkout</p></footer>
  );
}
