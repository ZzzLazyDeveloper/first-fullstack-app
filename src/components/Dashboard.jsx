import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNotes } from '../hooks/useNotes'
import Sidebar from './Sidebar'
import NoteEditor from './NoteEditor'
import ConfirmDialog from './ConfirmDialog'
import './Dashboard.css'

function Dashboard() {
  const {
    user,
    isAuthLoading,
    authError,
    isFirebaseConfigured,
    signUp,
    logIn,
    signInWithGoogle,
    logOut,
  } = useAuth()
  const {
    notes,
    isNotesLoading,
    notesError,
    addNote,
    updateNote,
    deleteNote,
    searchNotes,
  } = useNotes(user)
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [focusTitle, setFocusTitle] = useState(false)

  const filteredNotes = searchNotes(searchQuery)
  const selectedNote = notes.find((n) => n.id === selectedId) ?? null

  useEffect(() => {
    setSelectedId(null)
    setSearchQuery('')
    setDeleteTargetId(null)
    setFocusTitle(false)
  }, [user?.uid])

  function handleNewNote() {
    const note = addNote()
    setSelectedId(note.id)
    setSearchQuery('')
    setFocusTitle(true)
  }

  function handleSelect(id) {
    setSelectedId(id)
    setFocusTitle(false)
  }

  function requestDelete(id) {
    setDeleteTargetId(id)
  }

  function handleLogOut() {
    setSelectedId(null)
    setSearchQuery('')
    setDeleteTargetId(null)
    setFocusTitle(false)
    logOut()
  }

  function confirmDelete() {
    if (!deleteTargetId) return

    deleteNote(deleteTargetId)

    if (selectedId === deleteTargetId) {
      setSelectedId(null)
    }

    setDeleteTargetId(null)
  }

  return (
    <div className="dashboard">
      <Sidebar
        notes={notes}
        filteredNotes={filteredNotes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedId={selectedId}
        user={user}
        isAuthLoading={isAuthLoading}
        authError={authError}
        isFirebaseConfigured={isFirebaseConfigured}
        isNotesLoading={isNotesLoading}
        notesError={notesError}
        onSignUp={signUp}
        onLogIn={logIn}
        onGoogleSignIn={signInWithGoogle}
        onLogOut={handleLogOut}
        onSelect={handleSelect}
        onNewNote={handleNewNote}
        onDelete={requestDelete}
      />

      <NoteEditor
        note={selectedNote}
        focusTitle={focusTitle}
        onUpdate={updateNote}
        onDelete={requestDelete}
      />

      {deleteTargetId && (
        <ConfirmDialog
          title="Delete note?"
          message={`This action cannot be undone. The note will be removed from ${user ? 'Firestore' : 'localStorage'}.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
