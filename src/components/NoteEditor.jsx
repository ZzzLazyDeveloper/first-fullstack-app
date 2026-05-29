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
          <span className="editor__welcome-icon">✨</span>
          <h2>Welcome to Notes</h2>
          <p>
            Select a note from the sidebar or create a new one to get started.
            Your notes are saved automatically in your browser.
          </p>
        </div>
      </div>
    )
  }

  function handleTitleChange(e) {
    onUpdate(note.id, { title: e.target.value })
  }

  function handleContentChange(e) {
    onUpdate(note.id, { content: e.target.value })
  }

  const wordCount = note.content.trim()
    ? note.content.trim().split(/\s+/).length
    : 0

  return (
    <div className="editor">
      <div className="editor__toolbar">
        <div className="editor__meta">
          <span>Last edited {formatDate(note.updatedAt)}</span>
          <span className="editor__meta-divider">·</span>
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
        </div>
        <button
          type="button"
          className="editor__delete-btn"
          onClick={() => onDelete(note.id)}
        >
          Delete Note
        </button>
      </div>

      <input
        ref={titleRef}
        type="text"
        className="editor__title"
        placeholder="Note title"
        value={note.title}
        onChange={handleTitleChange}
        aria-label="Note title"
      />

      <textarea
        className="editor__content"
        placeholder="Start writing..."
        value={note.content}
        onChange={handleContentChange}
        aria-label="Note content"
      />
    </div>
  )
}

export default NoteEditor
