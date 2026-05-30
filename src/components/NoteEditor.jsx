import { useEffect, useRef } from 'react'
import { formatDate } from '../utils/formatDate'
import './NoteEditor.css'

function NoteEditor({ note, focusTitle, onUpdate, onDelete }) {
  const titleRef = useRef(null)

  useEffect(() => {
    if (note && focusTitle && titleRef.current) {
      titleRef.current.focus()
    }
  }, [note?.id, focusTitle])

  if (!note) {
    return (
      <div className="editor editor--empty">
        <div className="editor__welcome">
          <span className="editor__welcome-icon" aria-hidden="true">+</span>
          <h2>No note selected</h2>
          <p>
            Select a note from the sidebar or create a new one. Edits save
            automatically to Firestore when signed in, or localStorage when
            signed out.
          </p>
        </div>
      </div>
    )
  }

  function handleTitleChange(event) {
    onUpdate(note.id, { title: event.target.value })
  }

  function handleContentChange(event) {
    onUpdate(note.id, { content: event.target.value })
  }

  const content = note.content || ''
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0

  return (
    <main className="editor">
      <div className="editor__toolbar">
        <div className="editor__meta">
          <span>Updated {formatDate(note.updatedAt)}</span>
          <span className="editor__meta-divider">/</span>
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
        </div>
        <button
          type="button"
          className="editor__delete-btn"
          onClick={() => onDelete(note.id)}
        >
          Delete
        </button>
      </div>

      <input
        ref={titleRef}
        type="text"
        className="editor__title"
        placeholder="Untitled note"
        value={note.title || ''}
        onChange={handleTitleChange}
        aria-label="Note title"
      />

      <textarea
        className="editor__content"
        placeholder="Start writing..."
        value={content}
        onChange={handleContentChange}
        aria-label="Note content"
      />
    </main>
  )
}

export default NoteEditor
