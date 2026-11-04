import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function LoginPage() {
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    // The browser checks required fields and email format before submission.
    // Credentials are never sent, logged, or persisted.
    event.currentTarget.reset();
    setMessage('Backend integration pending.');
  }

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
        <section className="account-form" aria-labelledby="login-title">
          <p className="eyebrow">YOUR PANTRY ACCOUNT</p>
          <h1 id="login-title">Welcome back</h1>
          <p className="intro">Log in to shop and track your orders.</p>
          <form onSubmit={handleSubmit} onInput={() => setMessage('')}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email"
                placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password"
                placeholder="Enter your password" required />
            </div>
            <button className="login-button" type="submit">Log in</button>
          </form>
          <p className="registration">New to Ceylon Pantry?{' '}
            <a href="#registration-status" onClick={(event) => {
              event.preventDefault();
              setMessage('Registration is coming soon.');
            }}>Create an account</a>
          </p>
          <p className="status" id="registration-status" role="status">{message}</p>
        </section>
      </main>
    </>
  );
}

// Vite serves this entry for both / and /login. No registration route is created.
createRoot(document.getElementById('root')).render(<LoginPage />);
