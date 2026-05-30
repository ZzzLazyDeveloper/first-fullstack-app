import { useCallback, useEffect, useState } from 'react'

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

export function useNotes() {
  const [notes, setNotes] = useState(loadNotes)

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const addNote = useCallback((title = '', content = '') => {
    const note = createNote(title, content)
    setNotes((prev) => [note, ...prev])
    return note
  }, [])

  const updateNote = useCallback((id, updates) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note,
      ),
    )
  }, [])

  const deleteNote = useCallback((id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }, [])

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

  return { notes, addNote, updateNote, deleteNote, searchNotes }
}
