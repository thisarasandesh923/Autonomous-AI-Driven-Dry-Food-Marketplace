import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function AccountPage({ isRegistration = false }) {
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    // The browser checks required fields and email format before submission.
    // Credentials are never sent, logged, or persisted.
    event.currentTarget.reset();
    setMessage(isRegistration ? 'Backend integration pending' : 'Backend integration pending.');
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
        <section className={isRegistration ? "account-form register-form" : "account-form"} aria-labelledby="account-title">
          <p className="eyebrow">YOUR PANTRY ACCOUNT</p>
          <h1 id="account-title">{isRegistration ? 'Create an account' : 'Welcome back'}</h1>
          <p className="intro">{isRegistration ? 'Keep your orders and delivery details in one place.' : 'Log in to shop and track your orders.'}</p>
          <form onSubmit={handleSubmit} onInput={() => setMessage('')}
            onInvalid={isRegistration ? (event) => setMessage(event.target.validationMessage) : undefined}>
            {isRegistration && (
              <div className="field">
                <label htmlFor="full-name">Full name</label>
                <input id="full-name" name="fullName" type="text" autoComplete="name"
                  placeholder="Your full name" required pattern=".*\S.*" title="Please enter your full name."
                  onInput={(event) => {
                    event.currentTarget.setCustomValidity(event.currentTarget.value.trim()
                      ? '' : 'Please enter your full name.');
                  }} />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email"
                placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete={isRegistration ? 'new-password' : 'current-password'}
                placeholder={isRegistration ? 'Create a password' : 'Enter your password'} required />
            </div>
            <button className="login-button" type="submit">{isRegistration ? 'Create account' : 'Log in'}</button>
          </form>
          <p className="registration">{isRegistration ? 'Already have an account?' : 'New to Ceylon Pantry?'}{' '}
            <a href={isRegistration ? '/login' : '/register'}>{isRegistration ? 'Log in' : 'Create an account'}</a>
          </p>
          <p className="status" id="registration-status" role="status">{message}</p>
        </section>
      </main>
    </>
  );
}

// Regular links and Vite's HTML fallback support direct loads and refreshes.
const isRegistration = window.location.pathname.replace(/\/$/, '') === '/register';
document.title = `${isRegistration ? 'Buyer registration' : 'Buyer login'} · Ceylon Pantry`;
createRoot(document.getElementById('root')).render(<AccountPage isRegistration={isRegistration} />);
