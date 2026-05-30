import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../utils/formatDate'
import './NoteEditor.css'

function safeHref(href) {
  const trimmed = href.trim()
  return /^(https?:\/\/|mailto:|#|\/)/i.test(trimmed) ? trimmed : '#'
}

function renderInlineMarkdown(text, keyPrefix) {
  const parts = []
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    const key = `${keyPrefix}-${match.index}`

    if (token.startsWith('`')) {
      parts.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else if (token.startsWith('**')) {
      parts.push(<strong key={key}>{renderInlineMarkdown(token.slice(2, -2), key)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={key}>{renderInlineMarkdown(token.slice(1, -1), key)}</em>)
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        parts.push(
          <a key={key} href={safeHref(linkMatch[2])} target="_blank" rel="noreferrer">
            {renderInlineMarkdown(linkMatch[1], key)}
          </a>,
        )
      }
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

function isMarkdownBlockStart(line) {
  return /^#{1,6}\s+/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^>\s?/.test(line) ||
    /^```/.test(line)
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (/^```/.test(line)) {
      const codeLines = []
      index += 1

      while (index < lines.length && !/^```/.test(lines[index])) {
        codeLines.push(lines[index])
        index += 1
      }

      if (index < lines.length) index += 1
      blocks.push(<pre key={`code-${index}`}><code>{codeLines.join('\n')}</code></pre>)
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      const level = Math.min(heading[1].length, 6)
      const HeadingTag = `h${level}`
      blocks.push(
        <HeadingTag key={`heading-${index}`}>
          {renderInlineMarkdown(heading[2], `heading-${index}`)}
        </HeadingTag>,
      )
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items = []

      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ''))
        index += 1
      }

      blocks.push(
        <ul key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`list-${index}-${itemIndex}`}>
              {renderInlineMarkdown(item, `list-${index}-${itemIndex}`)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = []

      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ''))
        index += 1
      }

      blocks.push(
        <ol key={`ordered-list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`ordered-list-${index}-${itemIndex}`}>
              {renderInlineMarkdown(item, `ordered-list-${index}-${itemIndex}`)}
            </li>
          ))}
        </ol>,
      )
      continue
    }

    if (/^>\s?/.test(line)) {
      const quoteLines = []

      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }

      blocks.push(
        <blockquote key={`quote-${index}`}>
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={`quote-${index}-${quoteIndex}`}>
              {renderInlineMarkdown(quoteLine, `quote-${index}-${quoteIndex}`)}
            </p>
          ))}
        </blockquote>,
      )
      continue
    }

    const paragraphLines = [line]
    index += 1

    while (index < lines.length && lines[index].trim() && !isMarkdownBlockStart(lines[index])) {
      paragraphLines.push(lines[index])
      index += 1
    }

    blocks.push(
      <p key={`paragraph-${index}`}>
        {renderInlineMarkdown(paragraphLines.join(' '), `paragraph-${index}`)}
      </p>,
    )
  }

  return blocks
}

function NoteEditor({
  note,
  folders,
  selectedFolder,
  isTrashView,
  focusTitle,
  onUpdate,
  onDelete,
  onRestore,
  onPermanentDelete,
}) {
  const titleRef = useRef(null)
  const [mode, setMode] = useState('edit')

  useEffect(() => {
    if (note && focusTitle && titleRef.current) {
      titleRef.current.focus()
    }
  }, [note?.id, focusTitle])

  if (!note) {
    return (
      <div className="editor editor--empty">
        <div className="editor__welcome">
          <span className="editor__welcome-icon" aria-hidden="true">N</span>
          <h2>No note selected</h2>
          <p>
            Select a note from the sidebar or create a new one. Your workspace
            keeps saving through Firestore when signed in, with localStorage
            ready when signed out.
          </p>
          <div className="editor__welcome-grid" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    )
  }

  function handleTitleChange(event) {
    if (isTrashView) return
    onUpdate(note.id, { title: event.target.value })
  }

  function handleContentChange(event) {
    if (isTrashView) return
    onUpdate(note.id, { content: event.target.value })
  }

  function handleFolderChange(event) {
    if (isTrashView) return
    onUpdate(note.id, { folderId: event.target.value })
  }

  function handlePinnedChange() {
    if (isTrashView) return
    onUpdate(note.id, { pinned: !note.pinned })
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
          <span className="editor__meta-divider">/</span>
          <span>{isTrashView ? 'Trash' : selectedFolder?.name || 'All Notes'}</span>
        </div>
        <div className="editor__actions">
          <div className="editor__mode-toggle" aria-label="Markdown mode">
            <button
              type="button"
              className={mode === 'edit' ? 'editor__mode-btn editor__mode-btn--active' : 'editor__mode-btn'}
              onClick={() => setMode('edit')}
            >
              Edit
            </button>
            <button
              type="button"
              className={mode === 'preview' ? 'editor__mode-btn editor__mode-btn--active' : 'editor__mode-btn'}
              onClick={() => setMode('preview')}
            >
              Preview
            </button>
          </div>
          {isTrashView ? (
            <>
              <button
                type="button"
                className="editor__restore-btn"
                onClick={() => onRestore(note.id)}
              >
                Restore
              </button>
              <button
                type="button"
                className="editor__delete-btn"
                onClick={() => onPermanentDelete(note.id)}
              >
                Permanent Delete
              </button>
            </>
          ) : (
            <>
              <select
                className="editor__folder-select"
                value={note.folderId}
                onChange={handleFolderChange}
                aria-label="Move note to folder"
              >
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={`editor__pin-btn ${note.pinned ? 'editor__pin-btn--active' : ''}`}
                onClick={handlePinnedChange}
              >
                {note.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                type="button"
                className="editor__delete-btn"
                onClick={() => onDelete(note.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <input
        ref={titleRef}
        type="text"
        className="editor__title"
        placeholder="Untitled note"
        value={note.title || ''}
        onChange={handleTitleChange}
        readOnly={isTrashView}
        aria-label="Note title"
      />

      <textarea
        className={mode === 'edit' ? 'editor__content' : 'editor__content editor__content--hidden'}
        placeholder="Start writing with Markdown..."
        value={content}
        onChange={handleContentChange}
        readOnly={isTrashView}
        aria-label="Note content"
      />

      {mode === 'preview' && (
        <div className="editor__preview" aria-label="Markdown preview">
          {content.trim() ? (
            renderMarkdown(content)
          ) : (
            <div className="editor__preview-empty">
              <strong>Preview is empty</strong>
              <p>Switch to Edit and write Markdown to see formatted text here.</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default NoteEditor
