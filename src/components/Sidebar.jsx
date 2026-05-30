import { formatDate } from '../utils/formatDate'
import { ALL_NOTES_ID, DEFAULT_FOLDER_ID, TRASH_ID } from '../hooks/useNotes'
import AuthPanel from './AuthPanel'
import './Sidebar.css'

function NoteCard({
  note,
  isActive,
  folderName,
  isTrashView,
  onSelect,
  onTogglePinned,
  onDelete,
  onRestore,
  onPermanentDelete,
}) {
  const title = (note.title || '').trim() || 'Untitled note'
  const preview = (note.content || '').trim() || 'No content yet'
  const pinLabel = note.pinned ? 'Unpin' : 'Pin'
  const deleteLabel = isTrashView ? 'Permanent Delete' : 'Delete'

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
          {isTrashView ? (
            <button
              type="button"
              className="note-card__restore"
              aria-label={`Restore ${title}`}
              title="Restore"
              onClick={(event) => {
                event.stopPropagation()
                onRestore(note.id)
              }}
            >
              Restore
            </button>
          ) : (
            <button
              type="button"
              className={`note-card__pin ${note.pinned ? 'note-card__pin--active' : ''}`}
              aria-label={note.pinned ? `Unpin ${title}` : `Pin ${title}`}
              title={pinLabel}
              onClick={(event) => {
                event.stopPropagation()
                onTogglePinned(note.id, !note.pinned)
              }}
            >
              {pinLabel}
            </button>
          )}
          <button
            type="button"
            className="note-card__delete"
            aria-label={isTrashView ? `Permanently delete ${title}` : `Delete ${title}`}
            title={deleteLabel}
            onClick={(event) => {
              event.stopPropagation()
              if (isTrashView) {
                onPermanentDelete(note.id)
              } else {
                onDelete(note.id)
              }
            }}
          >
            {deleteLabel}
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
  trashedNotes,
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
  onRestore,
  onPermanentDelete,
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
  const isTrashView = selectedFolderId === TRASH_ID

  function handleRenameFolder(folder) {
    const nextName = window.prompt('Rename folder', folder.name)
    if (nextName === null) return

    onRenameFolder(folder.id, nextName)
  }

  return (
    <aside className={`sidebar ${isTrashView ? 'sidebar--trash' : ''}`} aria-label="Notes">
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
          New Note
        </button>
      </div>

      <nav className="folder-nav" aria-label="Folders">
        <div className="sidebar__section-heading">
          <span>Folder list</span>
        </div>
        <button
          type="button"
          className={`folder-nav__item ${selectedFolderId === ALL_NOTES_ID ? 'folder-nav__item--active' : ''}`}
          onClick={() => onSelectFolder(ALL_NOTES_ID)}
        >
          <span>All Notes</span>
          <strong>{notes.length}</strong>
        </button>

        <button
          type="button"
          className={`folder-nav__item ${selectedFolderId === TRASH_ID ? 'folder-nav__item--active' : ''}`}
          onClick={() => onSelectFolder(TRASH_ID)}
        >
          <span>Trash</span>
          <strong>{trashedNotes.length}</strong>
        </button>

        <div className="folder-nav__label">
          <span>Folders</span>
          <button type="button" onClick={onAddFolder} aria-label="New Folder" title="New Folder">
            New Folder
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
                    title="Rename"
                    onClick={() => handleRenameFolder(folder)}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${folder.name}`}
                    title="Delete"
                    onClick={() => onDeleteFolder(folder.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar__search">
        <span className="sidebar__search-label">Search</span>
        <input
          type="search"
          className="sidebar__search-input"
          placeholder={isTrashView ? 'Trash is not searched' : 'Search notes'}
          value={searchQuery}
          disabled={isTrashView}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Search notes"
        />
        {!isTrashView && searchQuery && (
          <button
            type="button"
            className="sidebar__search-clear"
            aria-label="Clear search"
            title="Clear search"
            onClick={() => onSearchChange('')}
          >
            Clear
          </button>
        )}
      </div>

      <div className="sidebar__list-header">
        <span className="sidebar__section-heading">Note list</span>
        <span className="sidebar__stats">
          {isNotesLoading ? 'Loading notes' : `${displayNotes.length} ${displayNotes.length === 1 ? 'note' : 'notes'}`}
          {user && <span> / cloud</span>}
          {!isTrashView && pinnedCount > 0 && <span> / {pinnedCount} pinned</span>}
          {isTrashView && <span> / trash</span>}
          {!isTrashView && searchQuery.trim() && (
            <span> / search on</span>
          )}
        </span>
      </div>
      {notesError && <p className="sidebar__error">{notesError}</p>}

      <div className="sidebar__list" key={selectedFolderId}>
        {displayNotes.length === 0 ? (
          <div className="sidebar__empty">
            <span className="sidebar__empty-icon" aria-hidden="true">
              Notes
            </span>
            <strong>
              {searchQuery.trim() ? 'No matches found' : isTrashView ? 'Trash is empty' : 'No notes yet'}
            </strong>
            <p>
              {isTrashView
                ? 'Deleted notes will wait here until you restore them or delete them forever.'
                : searchQuery.trim()
                ? 'Try a different search phrase or clear the filter.'
                : 'Use New Note to write your first note. Markdown works in the editor preview.'}
            </p>
            {!isTrashView && !searchQuery.trim() && (
              <button type="button" onClick={onNewNote}>
                New Note
              </button>
            )}
          </div>
        ) : (
          displayNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              folderName={folderNames[note.folderId] || 'General'}
              isActive={note.id === selectedId}
              isTrashView={isTrashView}
              onSelect={onSelect}
              onTogglePinned={(id, pinned) => onUpdateNote(id, { pinned })}
              onDelete={onDelete}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          ))
        )}
      </div>
    </aside>
  )
}

export default Sidebar
