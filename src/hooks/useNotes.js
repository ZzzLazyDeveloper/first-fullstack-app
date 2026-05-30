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
const FOLDERS_STORAGE_KEY = 'notes-app-folders'
export const ALL_NOTES_ID = 'all-notes'
export const TRASH_ID = 'trash'
export const DEFAULT_FOLDER_ID = 'general'
const DEFAULT_FOLDER = {
  id: DEFAULT_FOLDER_ID,
  name: 'General',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) {
      return a.pinned ? -1 : 1
    }

    return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
  })
}

function sortTrashNotes(notes) {
  return [...notes].sort(
    (a, b) => new Date(b.deletedAt || b.updatedAt || b.createdAt || 0) - new Date(a.deletedAt || a.updatedAt || a.createdAt || 0),
  )
}

function sortFolders(folders) {
  return [...folders].sort((a, b) => {
    if (a.id === DEFAULT_FOLDER_ID) return -1
    if (b.id === DEFAULT_FOLDER_ID) return 1
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
}

function normalizeNote(note) {
  return {
    pinned: false,
    folderId: DEFAULT_FOLDER_ID,
    trashed: false,
    deletedAt: null,
    ...note,
  }
}

function normalizeFolder(folder) {
  return {
    ...folder,
    name: (folder.name || '').trim() || 'Untitled folder',
  }
}

function ensureDefaultFolder(folders) {
  const normalizedFolders = folders.map(normalizeFolder)
  const hasDefault = normalizedFolders.some((folder) => folder.id === DEFAULT_FOLDER_ID)

  return sortFolders(hasDefault ? normalizedFolders : [DEFAULT_FOLDER, ...normalizedFolders])
}

function loadNotes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? sortNotes(parsed.map(normalizeNote)) : []
  } catch {
    return []
  }
}

function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortNotes(notes.map(normalizeNote))))
  } catch {
    // localStorage can fail in private browsing or when storage is full.
  }
}

function getFoldersStorageKey(ownerId = 'local') {
  return ownerId === 'local' ? FOLDERS_STORAGE_KEY : `${FOLDERS_STORAGE_KEY}-${ownerId}`
}

function loadFolders(ownerId = 'local') {
  try {
    const stored = localStorage.getItem(getFoldersStorageKey(ownerId))
    const parsed = stored ? JSON.parse(stored) : []
    return ensureDefaultFolder(Array.isArray(parsed) ? parsed : [])
  } catch {
    return [DEFAULT_FOLDER]
  }
}

function saveFolders(folders, ownerId = 'local') {
  try {
    localStorage.setItem(getFoldersStorageKey(ownerId), JSON.stringify(ensureDefaultFolder(folders)))
  } catch {
    // localStorage can fail in private browsing or when storage is full.
  }
}

function createNote(folderId, title = '', content = '') {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    folderId,
    pinned: false,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  }
}

function userNotesCollection(userId) {
  return collection(db, 'users', userId, 'notes')
}

function userFoldersCollection(userId) {
  return collection(db, 'users', userId, 'folders')
}

export function useNotes(user) {
  const [notesState, setNotesState] = useState(() => ({
    ownerId: 'local',
    notes: loadNotes(),
  }))
  const [foldersState, setFoldersState] = useState(() => ({
    ownerId: 'local',
    folders: loadFolders(),
  }))
  const [isNotesLoading, setIsNotesLoading] = useState(false)
  const [notesError, setNotesError] = useState('')

  const notes = notesState.ownerId === (user?.uid || 'local')
    ? sortNotes(notesState.notes.map(normalizeNote).filter((note) => !note.trashed))
    : []
  const trashedNotes = notesState.ownerId === (user?.uid || 'local')
    ? sortTrashNotes(notesState.notes.map(normalizeNote).filter((note) => note.trashed))
    : []
  const folders = foldersState.ownerId === (user?.uid || 'local')
    ? ensureDefaultFolder(foldersState.folders)
    : [DEFAULT_FOLDER]

  const updateLocalNotes = useCallback((updater) => {
    setNotesState((prev) => {
      const currentNotes = prev.ownerId === 'local' ? prev.notes : loadNotes()
      const nextNotes = sortNotes(updater(currentNotes).map(normalizeNote))
      saveNotes(nextNotes)

      return {
        ownerId: 'local',
        notes: nextNotes,
      }
    })
  }, [])

  const updateLocalFolders = useCallback((updater) => {
    setFoldersState((prev) => {
      const currentFolders = prev.ownerId === 'local' ? prev.folders : loadFolders()
      const nextFolders = ensureDefaultFolder(updater(currentFolders))
      saveFolders(nextFolders)

      return {
        ownerId: 'local',
        folders: nextFolders,
      }
    })
  }, [])

  const updateStoredFolders = useCallback((ownerId, updater) => {
    setFoldersState((prev) => {
      const currentFolders = prev.ownerId === ownerId ? prev.folders : loadFolders(ownerId)
      const nextFolders = ensureDefaultFolder(updater(currentFolders))
      saveFolders(nextFolders, ownerId)

      return {
        ownerId,
        folders: nextFolders,
      }
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setNotesState({
        ownerId: 'local',
        notes: loadNotes(),
      })
      setFoldersState({
        ownerId: 'local',
        folders: loadFolders('local'),
      })
      setIsNotesLoading(false)
      setNotesError('')
      return undefined
    }

    setNotesState({
      ownerId: user.uid,
      notes: [],
    })
    setFoldersState({
      ownerId: user.uid,
      folders: loadFolders(user.uid),
    })
    setIsNotesLoading(true)
    setNotesError('')

    const notesQuery = query(
      userNotesCollection(user.uid),
      orderBy('updatedAt', 'desc'),
    )
    const foldersQuery = query(userFoldersCollection(user.uid))

    let isCurrentSubscription = true

    setDoc(doc(userFoldersCollection(user.uid), DEFAULT_FOLDER_ID), DEFAULT_FOLDER, { merge: true }).catch(
      (error) => {
        if (isCurrentSubscription) {
          setNotesError(error.code === 'permission-denied' ? '' : error.message || 'Could not prepare folders.')
        }
      },
    )

    const unsubscribeNotes = onSnapshot(
      notesQuery,
      (snapshot) => {
        if (!isCurrentSubscription) return

        setNotesState({
          ownerId: user.uid,
          notes: sortNotes(snapshot.docs.map((noteDoc) => normalizeNote(noteDoc.data()))),
        })
        setIsNotesLoading(false)
      },
      (error) => {
        if (!isCurrentSubscription) return

        setNotesError(error.message || 'Could not load notes.')
        setIsNotesLoading(false)
      },
    )
    const unsubscribeFolders = onSnapshot(
      foldersQuery,
      (snapshot) => {
        if (!isCurrentSubscription) return

        setFoldersState({
          ownerId: user.uid,
          folders: ensureDefaultFolder(snapshot.docs.map((folderDoc) => folderDoc.data())),
        })
        saveFolders(snapshot.docs.map((folderDoc) => folderDoc.data()), user.uid)
      },
      (error) => {
        if (!isCurrentSubscription) return

        setFoldersState({
          ownerId: user.uid,
          folders: loadFolders(user.uid),
        })
        setNotesError(error.code === 'permission-denied' ? '' : error.message || 'Could not load folders.')
      },
    )

    return () => {
      isCurrentSubscription = false
      unsubscribeNotes()
      unsubscribeFolders()
    }
  }, [user])

  const addNote = useCallback((folderId = DEFAULT_FOLDER_ID, title = '', content = '') => {
    const nextFolderId = folderId === ALL_NOTES_ID || folderId === TRASH_ID ? DEFAULT_FOLDER_ID : folderId
    const note = createNote(nextFolderId, title, content)

    if (user) {
      setDoc(doc(userNotesCollection(user.uid), note.id), note).catch((error) => {
        setNotesError(error.message || 'Could not save note.')
      })
    } else {
      updateLocalNotes((prev) => [note, ...prev])
    }

    return note
  }, [updateLocalNotes, user])

  const addFolder = useCallback((name = 'New folder') => {
    const now = new Date().toISOString()
    const folder = {
      id: crypto.randomUUID(),
      name: name.trim() || 'New folder',
      createdAt: now,
      updatedAt: now,
    }

    if (user) {
      updateStoredFolders(user.uid, (prev) => [...prev.filter((item) => item.id !== folder.id), folder])
      setDoc(doc(userFoldersCollection(user.uid), folder.id), folder).catch((error) => {
        setNotesError(error.code === 'permission-denied' ? '' : error.message || 'Could not create folder.')
      })
    } else {
      updateLocalFolders((prev) => [...prev, folder])
    }

    return folder
  }, [updateLocalFolders, updateStoredFolders, user])

  const renameFolder = useCallback((id, name) => {
    if (id === DEFAULT_FOLDER_ID) return

    const nextName = name.trim() || 'Untitled folder'
    const updates = { name: nextName, updatedAt: new Date().toISOString() }

    if (user) {
      updateStoredFolders(user.uid, (prev) =>
        prev.map((folder) => (folder.id === id ? { ...folder, ...updates } : folder)),
      )
      setDoc(doc(userFoldersCollection(user.uid), id), updates, { merge: true }).catch((error) => {
        setNotesError(error.code === 'permission-denied' ? '' : error.message || 'Could not rename folder.')
      })
      return
    }

    updateLocalFolders((prev) =>
      prev.map((folder) => (folder.id === id ? { ...folder, ...updates } : folder)),
    )
  }, [updateLocalFolders, updateStoredFolders, user])

  const deleteFolder = useCallback((id) => {
    if (id === DEFAULT_FOLDER_ID) return

    if (user) {
      updateStoredFolders(user.uid, (prev) => prev.filter((folder) => folder.id !== id))
      const noteMoves = notes
        .filter((note) => note.folderId === id)
        .map((note) =>
          setDoc(
            doc(userNotesCollection(user.uid), note.id),
            { folderId: DEFAULT_FOLDER_ID, updatedAt: new Date().toISOString() },
            { merge: true },
          ),
        )

      Promise.all([...noteMoves, deleteDoc(doc(userFoldersCollection(user.uid), id))]).catch((error) => {
        setNotesError(error.code === 'permission-denied' ? '' : error.message || 'Could not delete folder.')
      })
      return
    }

    updateLocalFolders((prev) => prev.filter((folder) => folder.id !== id))
    updateLocalNotes((prev) =>
      prev.map((note) =>
        note.folderId === id
          ? { ...note, folderId: DEFAULT_FOLDER_ID, updatedAt: new Date().toISOString() }
          : note,
      ),
    )
  }, [notes, updateLocalFolders, updateLocalNotes, updateStoredFolders, user])

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
    const now = new Date().toISOString()
    const updates = { trashed: true, deletedAt: now, pinned: false, updatedAt: now }

    if (user) {
      setDoc(doc(userNotesCollection(user.uid), id), updates, { merge: true }).catch((error) => {
        setNotesError(error.message || 'Could not delete note.')
      })
      return
    }

    updateLocalNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note)),
    )
  }, [updateLocalNotes, user])

  const restoreNote = useCallback((id) => {
    const note = trashedNotes.find((item) => item.id === id)
    const folderId = folders.some((folder) => folder.id === note?.folderId)
      ? note.folderId
      : DEFAULT_FOLDER_ID
    const updates = {
      trashed: false,
      deletedAt: null,
      folderId,
      updatedAt: new Date().toISOString(),
    }

    if (user) {
      setDoc(doc(userNotesCollection(user.uid), id), updates, { merge: true }).catch((error) => {
        setNotesError(error.message || 'Could not restore note.')
      })
      return
    }

    updateLocalNotes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }, [folders, trashedNotes, updateLocalNotes, user])

  const permanentlyDeleteNote = useCallback((id) => {
    if (user) {
      deleteDoc(doc(userNotesCollection(user.uid), id)).catch((error) => {
        setNotesError(error.message || 'Could not permanently delete note.')
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
    trashedNotes,
    folders,
    isNotesLoading,
    notesError,
    addNote,
    addFolder,
    renameFolder,
    deleteFolder,
    updateNote,
    deleteNote,
    restoreNote,
    permanentlyDeleteNote,
    searchNotes,
  }
}
