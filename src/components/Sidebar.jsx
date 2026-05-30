import { formatDate } from '../utils/formatDate'
import { ALL_NOTES_ID, DEFAULT_FOLDER_ID } from '../hooks/useNotes'
import AuthPanel from './AuthPanel'
import './Sidebar.css'

function NoteCard({ note, isActive, folderName, onSelect, onTogglePinned, onDelete }) {
  const title = (note.title || '').trim() || 'Untitled note'
  const preview = (note.content || '').trim() || 'No content yet'

  return (
    <article
      className={`note-card ${isActive ? 'note-card--active' : ''}`}
      onClick={() => onSelect(note.id)}
    >
      <div className="note-card__header">
        <div className="note-card__heading">
          <h3 className="note-card__title">{title}</h3>
          <span className="note-card__folder">{folderName}</span>
        </div>
        <div className="note-card__actions">
          <button
            type="button"
            className={`note-card__pin ${note.pinned ? 'note-card__pin--active' : ''}`}
            aria-label={note.pinned ? `Unpin ${title}` : `Pin ${title}`}
            onClick={(event) => {
              event.stopPropagation()
              onTogglePinned(note.id, !note.pinned)
            }}
          >
            <span aria-hidden="true">^</span>
          </button>
          <button
            type="button"
            className="note-card__delete"
            aria-label={`Delete ${title}`}
            onClick={(event) => {
              event.stopPropagation()
              onDelete(note.id)
            }}
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>
      </div>
      <p className="note-card__preview">{preview}</p>
      <time className="note-card__date" dateTime={note.updatedAt}>
        Updated {formatDate(note.updatedAt)}
      </time>
    </article>
  )
}

function Sidebar({
  notes,
  folders,
  displayNotes,
  searchQuery,
  onSearchChange,
  selectedId,
  selectedFolderId,
  user,
  isAuthLoading,
  authError,
  isFirebaseConfigured,
  isNotesLoading,
  notesError,
  onSignUp,
  onLogIn,
  onGoogleSignIn,
  onLogOut,
  onSelect,
  onSelectFolder,
  onNewNote,
  onDelete,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  onUpdateNote,
}) {
  const folderCounts = notes.reduce((counts, note) => {
    const folderId = note.folderId || DEFAULT_FOLDER_ID
    counts[folderId] = (counts[folderId] || 0) + 1
    return counts
  }, {})
  const folderNames = folders.reduce((names, folder) => {
    names[folder.id] = folder.name
    return names
  }, {})
  const pinnedCount = displayNotes.filter((note) => note.pinned).length

  function handleRenameFolder(folder) {
    const nextName = window.prompt('Rename folder', folder.name)
    if (nextName === null) return

    onRenameFolder(folder.id, nextName)
  }

  return (
    <aside className="sidebar" aria-label="Notes">
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">N</span>
          <div>
            <p className="sidebar__eyebrow">Local workspace</p>
            <h1 className="sidebar__title">Notes</h1>
          </div>
        </div>
        <AuthPanel
          user={user}
          isAuthLoading={isAuthLoading}
          authError={authError}
          isFirebaseConfigured={isFirebaseConfigured}
          onSignUp={onSignUp}
          onLogIn={onLogIn}
          onGoogleSignIn={onGoogleSignIn}
          onLogOut={onLogOut}
        />
        <button type="button" className="sidebar__new-btn" onClick={onNewNote}>
          + New Note
        </button>
      </div>

      <nav className="folder-nav" aria-label="Folders">
        <button
          type="button"
          className={`folder-nav__item ${selectedFolderId === ALL_NOTES_ID ? 'folder-nav__item--active' : ''}`}
          onClick={() => onSelectFolder(ALL_NOTES_ID)}
        >
          <span>All Notes</span>
          <strong>{notes.length}</strong>
        </button>

        <div className="folder-nav__label">
          <span>Folders</span>
          <button type="button" onClick={onAddFolder} aria-label="Create folder">
            +
          </button>
        </div>

        <div className="folder-nav__list">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`folder-nav__row ${selectedFolderId === folder.id ? 'folder-nav__row--active' : ''}`}
            >
              <button
                type="button"
                className="folder-nav__folder"
                onClick={() => onSelectFolder(folder.id)}
              >
                <span>{folder.name}</span>
                <strong>{folderCounts[folder.id] || 0}</strong>
              </button>
              {folder.id !== DEFAULT_FOLDER_ID && (
                <div className="folder-nav__actions">
                  <button
                    type="button"
                    aria-label={`Rename ${folder.name}`}
                    onClick={() => handleRenameFolder(folder)}
                  >
                    edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${folder.name}`}
                    onClick={() => onDeleteFolder(folder.id)}
                  >
                    x
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar__search">
        <span className="sidebar__search-icon" aria-hidden="true">/</span>
        <input
          type="search"
          className="sidebar__search-input"
          placeholder="Search notes"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search notes"
        />
        {searchQuery && (
          <button
            type="button"
            className="sidebar__search-clear"
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
          >
            x
          </button>
        )}
      </div>

      <div className="sidebar__stats">
        {isNotesLoading ? 'Loading notes' : `${displayNotes.length} ${displayNotes.length === 1 ? 'note' : 'notes'}`}
        {user && <span> / cloud</span>}
        {pinnedCount > 0 && <span> / {pinnedCount} pinned</span>}
        {searchQuery.trim() && (
          <span> / search on</span>
        )}
      </div>
      {notesError && <p className="sidebar__error">{notesError}</p>}

      <div className="sidebar__list">
        {displayNotes.length === 0 ? (
          <p className="sidebar__empty">
            {searchQuery.trim()
              ? 'No notes match your search.'
              : 'No notes yet. Create your first note.'}
          </p>
        ) : (
          displayNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              folderName={folderNames[note.folderId] || 'General'}
              isActive={note.id === selectedId}
              onSelect={onSelect}
              onTogglePinned={(id, pinned) => onUpdateNote(id, { pinned })}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </aside>
  )
}

export default Sidebar
