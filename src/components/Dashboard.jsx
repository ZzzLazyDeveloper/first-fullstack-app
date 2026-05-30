import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ALL_NOTES_ID, DEFAULT_FOLDER_ID, useNotes } from '../hooks/useNotes'
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
    folders,
    isNotesLoading,
    notesError,
    addNote,
    addFolder,
    renameFolder,
    deleteFolder,
    updateNote,
    deleteNote,
    searchNotes,
  } = useNotes(user)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedFolderId, setSelectedFolderId] = useState(ALL_NOTES_ID)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [folderDeleteTargetId, setFolderDeleteTargetId] = useState(null)
  const [focusTitle, setFocusTitle] = useState(false)

  const searchedNotes = searchNotes(searchQuery)
  const visibleNotes = selectedFolderId === ALL_NOTES_ID
    ? searchedNotes
    : searchedNotes.filter((note) => note.folderId === selectedFolderId)
  const selectedNote = notes.find((n) => n.id === selectedId) ?? null
  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) ?? null
  const selectedNoteFolder = selectedNote
    ? folders.find((folder) => folder.id === selectedNote.folderId) ?? selectedFolder
    : selectedFolder

  useEffect(() => {
    setSelectedId(null)
    setSelectedFolderId(ALL_NOTES_ID)
    setSearchQuery('')
    setDeleteTargetId(null)
    setFolderDeleteTargetId(null)
    setFocusTitle(false)
  }, [user?.uid])

  useEffect(() => {
    if (selectedFolderId === ALL_NOTES_ID) return
    if (folders.some((folder) => folder.id === selectedFolderId)) return

    setSelectedFolderId(DEFAULT_FOLDER_ID)
  }, [folders, selectedFolderId])

  function handleNewNote() {
    const targetFolderId = selectedFolderId === ALL_NOTES_ID
      ? DEFAULT_FOLDER_ID
      : selectedFolderId
    const note = addNote(targetFolderId)
    setSelectedId(note.id)
    setSearchQuery('')
    setFocusTitle(true)
  }

  function handleSelect(id) {
    setSelectedId(id)
    setFocusTitle(false)
  }

  function handleSelectFolder(folderId) {
    setSelectedFolderId(folderId)
    setSelectedId(null)
    setFocusTitle(false)
  }

  function handleAddFolder() {
    const folder = addFolder()
    setSelectedFolderId(folder.id)
    setSelectedId(null)
  }

  function requestDelete(id) {
    setDeleteTargetId(id)
  }

  function requestFolderDelete(id) {
    setFolderDeleteTargetId(id)
  }

  function handleLogOut() {
    setSelectedId(null)
    setSelectedFolderId(ALL_NOTES_ID)
    setSearchQuery('')
    setDeleteTargetId(null)
    setFolderDeleteTargetId(null)
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

  function confirmFolderDelete() {
    if (!folderDeleteTargetId) return

    const selectedNoteIsInFolder = notes.some(
      (note) => note.id === selectedId && note.folderId === folderDeleteTargetId,
    )

    deleteFolder(folderDeleteTargetId)

    if (selectedFolderId === folderDeleteTargetId) {
      setSelectedFolderId(DEFAULT_FOLDER_ID)
    }

    if (selectedNoteIsInFolder) {
      setSelectedId(null)
    }

    setFolderDeleteTargetId(null)
  }

  return (
    <div className="dashboard">
      <Sidebar
        notes={notes}
        folders={folders}
        displayNotes={visibleNotes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedId={selectedId}
        selectedFolderId={selectedFolderId}
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
        onSelectFolder={handleSelectFolder}
        onNewNote={handleNewNote}
        onDelete={requestDelete}
        onAddFolder={handleAddFolder}
        onRenameFolder={renameFolder}
        onDeleteFolder={requestFolderDelete}
        onUpdateNote={updateNote}
      />

      <NoteEditor
        note={selectedNote}
        folders={folders}
        selectedFolder={selectedNoteFolder}
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

      {folderDeleteTargetId && (
        <ConfirmDialog
          title="Delete folder?"
          message="Notes in this folder will move to General. This action cannot be undone."
          confirmLabel="Delete folder"
          onConfirm={confirmFolderDelete}
          onCancel={() => setFolderDeleteTargetId(null)}
        />
      )}
    </div>
  )
}

export default Dashboard
