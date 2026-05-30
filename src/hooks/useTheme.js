import { useCallback, useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const THEME_STORAGE_KEY = 'notes-app-theme'

export const THEMES = [
  { id: 'cyberpunk-neon', name: 'Cyberpunk Neon' },
  { id: 'dark-professional', name: 'Dark Professional' },
  { id: 'midnight-blue', name: 'Midnight Blue' },
  { id: 'emerald-tech', name: 'Emerald Tech' },
  { id: 'light-mode', name: 'Light Mode' },
]

const DEFAULT_THEME = THEMES[0].id
const THEME_IDS = new Set(THEMES.map((theme) => theme.id))

function normalizeTheme(theme) {
  return THEME_IDS.has(theme) ? theme : DEFAULT_THEME
}

function loadStoredTheme() {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return DEFAULT_THEME
  }
}

function saveStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalizeTheme(theme))
  } catch {
    // localStorage can fail in private browsing or when storage is full.
  }
}

function userSettingsDoc(userId) {
  return doc(db, 'users', userId, 'settings', 'preferences')
}

export function useTheme(user) {
  const [theme, setThemeState] = useState(loadStoredTheme)

  useEffect(() => {
    const normalizedTheme = normalizeTheme(theme)
    document.documentElement.dataset.theme = normalizedTheme
    document.documentElement.style.colorScheme = normalizedTheme === 'light-mode' ? 'light' : 'dark'
    saveStoredTheme(normalizedTheme)
  }, [theme])

  useEffect(() => {
    if (!user) return undefined

    const settingsRef = userSettingsDoc(user.uid)
    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const nextTheme = normalizeTheme(snapshot.data().theme)
          setThemeState(nextTheme)
          saveStoredTheme(nextTheme)
          return
        }

        setDoc(settingsRef, { theme: loadStoredTheme(), updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {})
      },
      () => {},
    )

    return unsubscribe
  }, [user])

  const setTheme = useCallback((nextTheme) => {
    const normalizedTheme = normalizeTheme(nextTheme)
    setThemeState(normalizedTheme)
    saveStoredTheme(normalizedTheme)

    if (user) {
      setDoc(
        userSettingsDoc(user.uid),
        { theme: normalizedTheme, updatedAt: new Date().toISOString() },
        { merge: true },
      ).catch(() => {})
    }
  }, [user])

  return {
    theme,
    themes: THEMES,
    setTheme,
  }
}
