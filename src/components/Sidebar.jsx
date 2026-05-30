import { formatDate } from '../utils/formatDate'
import './Sidebar.css'

function NoteCard({ note, isActive, onSelect, onDelete }) {
  const preview = note.content.trim() || 'No content yet'

  return (
    <article
      className={`note-card ${isActive ? 'note-card--active' : ''}`}
      onClick={() => onSelect(note.id)}
    >
      <div className="note-card__header">
        <h3 className="note-card__title">
          {note.title.trim() || 'Untitled'}
        </h3>
        <button
          type="button"
          className="note-card__delete"
          aria-label="Delete note"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
        >
          ✕
        </button>
      </div>
      <p className="note-card__preview">{preview}</p>
      <time className="note-card__date" dateTime={note.updatedAt}>
        {formatDate(note.updatedAt)}
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
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__brand">
          <span className="sidebar__logo">📝</span>
          <h1 className="sidebar__title">Yubo's Notes App</h1>
        </div>
        <button type="button" className="sidebar__new-btn" onClick={onNewNote}>
          + New Note
        </button>
      </div>

      <div className="sidebar__search">
        <span className="sidebar__search-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          className="sidebar__search-input"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search notes"
        />
        {searchQuery && (
          <button
            type="button"
            className="sidebar__search-clear"
            aria-label="Clear search"
            onClick={() => onSearchChange('')}
          >
            ✕
          </button>
        )}
      </div>

      <div className="sidebar__stats">
        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        {searchQuery.trim() && displayNotes.length !== notes.length && (
          <span> · {displayNotes.length} found</span>
        )}
      </div>

      <div className="sidebar__list">
        {displayNotes.length === 0 ? (
          <p className="sidebar__empty">
            {searchQuery.trim()
              ? 'No notes match your search.'
              : 'No notes yet. Create your first one!'}
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
