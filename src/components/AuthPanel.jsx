import { useState } from 'react'
import './AuthPanel.css'

function AuthPanel({
  user,
  isAuthLoading,
  authError,
  isFirebaseConfigured,
  onSignUp,
  onLogIn,
  onGoogleSignIn,
  onLogOut,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event, action) {
    event.preventDefault()
    action(email.trim(), password)
  }

  if (isAuthLoading) {
    return <div className="auth-panel auth-panel--muted">Checking session...</div>
  }

  if (user) {
    return (
      <section className="auth-panel" aria-label="Account">
        <div className="auth-panel__user">
          <span className="auth-panel__label">Signed in</span>
          <strong>{user.displayName || user.email}</strong>
        </div>
        <button type="button" className="auth-panel__secondary" onClick={onLogOut}>
          Log out
        </button>
      </section>
    )
  }

  return (
    <section className="auth-panel" aria-label="Sign in">
      <form
        className="auth-panel__form"
        onSubmit={(event) => handleSubmit(event, onLogIn)}
      >
        <input
          type="email"
          className="auth-panel__input"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          aria-label="Email"
        />
        <input
          type="password"
          className="auth-panel__input"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          aria-label="Password"
        />
        <div className="auth-panel__actions">
          <button
            type="submit"
            className="auth-panel__primary"
            disabled={!isFirebaseConfigured}
          >
            Log in
          </button>
          <button
            type="button"
            className="auth-panel__secondary"
            disabled={!isFirebaseConfigured}
            onClick={(event) => handleSubmit(event, onSignUp)}
          >
            Sign up
          </button>
        </div>
      </form>
      <button
        type="button"
        className="auth-panel__google"
        disabled={!isFirebaseConfigured}
        onClick={onGoogleSignIn}
      >
        Continue with Google
      </button>
      {!isFirebaseConfigured && (
        <p className="auth-panel__message">
          Add VITE Firebase variables to enable sign-in.
        </p>
      )}
      {authError && <p className="auth-panel__message">{authError}</p>}
    </section>
  )
}

export default AuthPanel
