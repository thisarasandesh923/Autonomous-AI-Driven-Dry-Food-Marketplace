import React, { useState } from 'react';
import AccountLayout from '../layouts/AccountLayout';
import AccountForm from '../components/account/AccountForm';

export default function AccountPage({ isRegistration = false }) {
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    // The browser checks required fields and email format before submission.
    // Credentials are never sent, logged, or persisted.
    event.currentTarget.reset();
    setMessage(isRegistration ? 'Backend integration pending' : 'Backend integration pending.');
  }

  return (
    <AccountLayout>
        <section className={isRegistration ? "account-form register-form" : "account-form"} aria-labelledby="account-title">
          <p className="eyebrow">YOUR PANTRY ACCOUNT</p>
          <h1 id="account-title">{isRegistration ? 'Create an account' : 'Welcome back'}</h1>
          <p className="intro">{isRegistration ? 'Keep your orders and delivery details in one place.' : 'Log in to shop and track your orders.'}</p>
          <AccountForm isRegistration={isRegistration} onSubmit={handleSubmit}
            onInput={() => setMessage('')}
            onInvalid={isRegistration ? (event) => setMessage(event.target.validationMessage) : undefined} />
          <p className="registration">{isRegistration ? 'Already have an account?' : 'New to Ceylon Pantry?'}{' '}
            <a href={isRegistration ? '/login' : '/register'}>{isRegistration ? 'Log in' : 'Create an account'}</a>
          </p>
          <p className="status" id="registration-status" role="status">{message}</p>
        </section>
    </AccountLayout>
  );
}
