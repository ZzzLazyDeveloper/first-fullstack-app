import { useCallback, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '../firebase'

function getAuthMessage(error) {
  if (!error?.code) return 'Something went wrong. Try again.'

  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/missing-password': 'Enter a password.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
    'auth/weak-password': 'Use a password with at least 6 characters.',
  }

  return messages[error.code] || error.message || 'Authentication failed.'
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setIsAuthLoading(false)
    })

    return unsubscribe
  }, [])

  const runAuthAction = useCallback(async (action) => {
    setAuthError('')

    if (!isFirebaseConfigured) {
      setAuthError('Firebase environment variables are not fully configured.')
      return
    }

    try {
      await action()
    } catch (error) {
      setAuthError(getAuthMessage(error))
    }
  }, [])

  const signUp = useCallback(
    (email, password) =>
      runAuthAction(() => createUserWithEmailAndPassword(auth, email, password)),
    [runAuthAction],
  )

  const logIn = useCallback(
    (email, password) =>
      runAuthAction(() => signInWithEmailAndPassword(auth, email, password)),
    [runAuthAction],
  )

  const signInWithGoogle = useCallback(
    () => runAuthAction(() => signInWithPopup(auth, googleProvider)),
    [runAuthAction],
  )

  const logOut = useCallback(async () => {
    setAuthError('')

    if (!isFirebaseConfigured) {
      setAuthError('Firebase environment variables are not fully configured.')
      return
    }

    const previousUser = auth.currentUser
    setUser(null)

    try {
      await signOut(auth)
    } catch (error) {
      setUser(previousUser)
      setAuthError(getAuthMessage(error))
    }
  }, [])

  return {
    user,
    isAuthLoading,
    authError,
    isFirebaseConfigured,
    signUp,
    logIn,
    signInWithGoogle,
    logOut,
  }
}
