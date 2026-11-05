import React from 'react';

export default function AccountForm({ isRegistration, onSubmit, onInput, onInvalid }) {
  return (
    <form onSubmit={onSubmit} onInput={onInput}
      onInvalid={onInvalid}>
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
  );
}
