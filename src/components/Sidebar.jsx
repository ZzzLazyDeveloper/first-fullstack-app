import { formatDate } from '../utils/formatDate'
import './Sidebar.css'

function NoteCard({ note, isActive, onSelect, onDelete }) {
  const title = (note.title || '').trim() || 'Untitled note'
  const preview = (note.content || '').trim() || 'No content yet'

  return (
    <article
      className={`note-card ${isActive ? 'note-card--active' : ''}`}
      onClick={() => onSelect(note.id)}
    >
      <div className="note-card__header">
        <h3 className="note-card__title">{title}</h3>
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
      <p className="note-card__preview">{preview}</p>
      <time className="note-card__date" dateTime={note.updatedAt}>
        Updated {formatDate(note.updatedAt)}
      </time>
    </article>
  )
}

function Sidebar({
  notes,
  filteredNotes,
  searchQuery,
  onSearchChange,
  selectedId,
  onSelect,
  onNewNote,
  onDelete,
}) {
  const displayNotes = searchQuery.trim() ? filteredNotes : notes

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
        <button type="button" className="sidebar__new-btn" onClick={onNewNote}>
          + New Note
        </button>
      </div>

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
        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        {searchQuery.trim() && displayNotes.length !== notes.length && (
          <span> / {displayNotes.length} found</span>
        )}
      </div>

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
              isActive={note.id === selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </aside>
  )
}

export default Sidebar
