import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const STORAGE_KEY = 'notes-app-data'

function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // localStorage can fail in private browsing or when storage is full.
  }
}

function createNote(title = '', content = '') {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  }
}

function userNotesCollection(userId) {
  return collection(db, 'users', userId, 'notes')
}

export function useNotes(user) {
  const [notesState, setNotesState] = useState(() => ({
    ownerId: 'local',
    notes: loadNotes(),
  }))
  const [isNotesLoading, setIsNotesLoading] = useState(false)
  const [notesError, setNotesError] = useState('')

  const notes = notesState.ownerId === (user?.uid || 'local')
    ? notesState.notes
    : []

  const updateLocalNotes = useCallback((updater) => {
    setNotesState((prev) => {
      const currentNotes = prev.ownerId === 'local' ? prev.notes : loadNotes()
      const nextNotes = updater(currentNotes)
      saveNotes(nextNotes)

      return {
        ownerId: 'local',
        notes: nextNotes,
      }
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setNotesState({
        ownerId: 'local',
        notes: loadNotes(),
      })
      setIsNotesLoading(false)
      setNotesError('')
      return undefined
    }

    setNotesState({
      ownerId: user.uid,
      notes: [],
    })
    setIsNotesLoading(true)
    setNotesError('')

    const notesQuery = query(
      userNotesCollection(user.uid),
      orderBy('updatedAt', 'desc'),
    )

    let isCurrentSubscription = true

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        if (!isCurrentSubscription) return

        setNotesState({
          ownerId: user.uid,
          notes: snapshot.docs.map((noteDoc) => noteDoc.data()),
        })
        setIsNotesLoading(false)
      },
      (error) => {
        if (!isCurrentSubscription) return

        setNotesError(error.message || 'Could not load notes.')
        setIsNotesLoading(false)
      },
    )

    return () => {
      isCurrentSubscription = false
      unsubscribe()
    }
  }, [user])

  const addNote = useCallback((title = '', content = '') => {
    const note = createNote(title, content)

    if (user) {
      setDoc(doc(userNotesCollection(user.uid), note.id), note).catch((error) => {
        setNotesError(error.message || 'Could not save note.')
      })
    } else {
      updateLocalNotes((prev) => [note, ...prev])
    }

    return note
  }, [updateLocalNotes, user])

  const updateNote = useCallback((id, updates) => {
    const nextUpdates = { ...updates, updatedAt: new Date().toISOString() }

    if (user) {
      setDoc(doc(userNotesCollection(user.uid), id), nextUpdates, { merge: true }).catch(
        (error) => {
          setNotesError(error.message || 'Could not update note.')
        },
      )
      return
    }

    updateLocalNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...nextUpdates } : note)),
    )
  }, [updateLocalNotes, user])

  const deleteNote = useCallback((id) => {
    if (user) {
      deleteDoc(doc(userNotesCollection(user.uid), id)).catch((error) => {
        setNotesError(error.message || 'Could not delete note.')
      })
      return
    }

    updateLocalNotes((prev) => prev.filter((note) => note.id !== id))
  }, [updateLocalNotes, user])

  const searchNotes = useCallback(
    (query) => {
      const trimmed = query.trim().toLowerCase()
      if (!trimmed) return notes

      return notes.filter(
        (note) =>
          (note.title || '').toLowerCase().includes(trimmed) ||
          (note.content || '').toLowerCase().includes(trimmed),
      )
    },
    [notes],
  )

  return {
    notes,
    isNotesLoading,
    notesError,
    addNote,
    updateNote,
    deleteNote,
    searchNotes,
  }
}
