# Q7. Edit Notes on an Inspiration

> As a designer, I want to add a short note to an inspiration.

**Time box:** about 15 min · **Depends on:** [Q5](Q5-add-inspiration-by-url.md) (an `inspirations` state array) · **Files:** [ProjectDetail.jsx](../../src/pages/ProjectDetail.jsx) or a new `src/components/InspirationItem.jsx`, [ProjectDetail.test.jsx](../../src/pages/ProjectDetail.test.jsx)

## Acceptance Criteria
1. Each inspiration has an **"Edit note"** button (labelled "Add note" if it has no note yet).
2. Clicking it shows a labelled `<textarea>` filled with the current note, plus **Save** and **Cancel**.
3. **Save** calls `updateInspiration(id, { notes })`, replaces that item in the list with the returned object, and closes the editor. The note shows under the title.
4. **Cancel** (or `Esc`) closes the editor without saving, and the original note is unchanged.
5. While saving, Save is disabled and reads "Saving...". On failure the editor stays open with the draft intact and shows an error.
6. Notes are trimmed and limited to 1,000 characters (`maxLength` plus a counter).
7. Only one note is edited at a time.

## Clarify Before Coding (say out loud)
- **Where does editing state live?** "One editor at a time" means a single `editingId` and `draft` in the parent works. If several editors could be open, move the state into each `InspirationItem`.
- **Explicit save or autosave?** Explicit Save and Cancel for the quick story. Debounced autosave is Story 2. Mention its pitfalls: out-of-order writes, and flushing on blur and unmount.
- **Rendering:** notes are user text. Render them with `{notes}` in JSX and `whitespace-pre-wrap` so line breaks show. Never use `dangerouslySetInnerHTML`.

## Implementation Steps

### Step 1: State in `ProjectDetail`
```jsx
const NOTE_MAX = 1000

const [editingId, setEditingId] = useState(null)
const [draft, setDraft] = useState('')
const [isSavingNote, setIsSavingNote] = useState(false)
const [noteError, setNoteError] = useState('')
```

### Step 2: Handlers
```jsx
const startEditing = (insp) => {
  setEditingId(insp.id)
  setDraft(insp.notes ?? '')
  setNoteError('')
}

const cancelEditing = () => {
  setEditingId(null)
  setDraft('')
  setNoteError('')
}

const saveNote = async () => {
  setIsSavingNote(true)
  setNoteError('')
  try {
    const updated = await updateInspiration(editingId, {
      notes: draft.trim().slice(0, NOTE_MAX),
    })
    setInspirations((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    cancelEditing()
  } catch {
    setNoteError('Could not save the note. Please try again.')
  } finally {
    setIsSavingNote(false)
  }
}
```
Talking points:
- Replace the item with the **returned** object, not a local merge. The returned record has the new `updatedAt` from the service, so the UI matches the database.
- `.slice(0, NOTE_MAX)` on save is a backstop. `maxLength` on the textarea is the main guard, but pasted text and programmatic changes can get around it.

### Step 3: Render each item's notes area
```jsx
{editingId === insp.id ? (
  <div className="mt-2 space-y-1">
    <label htmlFor={`note-${insp.id}`} className="sr-only">
      Note for {label}
    </label>
    <textarea
      id={`note-${insp.id}`}
      autoFocus
      value={draft}
      maxLength={NOTE_MAX}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') cancelEditing()
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveNote()
      }}
      aria-describedby={`note-count-${insp.id}`}
      className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900"
    />
    <small id={`note-count-${insp.id}`}>{draft.length}/{NOTE_MAX}</small>
    {noteError && <p role="alert" className="text-sm text-red-600">{noteError}</p>}
    <div className="flex gap-2">
      <Button type="button" onClick={saveNote} disabled={isSavingNote}>
        {isSavingNote ? 'Saving...' : 'Save'}
      </Button>
      <Button type="button" onClick={cancelEditing} disabled={isSavingNote}>
        Cancel
      </Button>
    </div>
  </div>
) : (
  <>
    {insp.notes && (
      <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{insp.notes}</p>
    )}
    <Button
      type="button"
      onClick={() => startEditing(insp)}
      aria-label={`${insp.notes ? 'Edit' : 'Add'} note for ${label}`}
    >
      {insp.notes ? 'Edit note' : 'Add note'}
    </Button>
  </>
)}
```

### Step 4 (recommended): Extract `InspirationItem.jsx`
After Q6 and Q7 the `<li>` is large. Extract it with props:
`{ inspiration, isEditing, draft, onDraftChange, onStartEdit, onSave, onCancel, isSaving, error, onRemove, isRemoving }`.
Alternatively, move `draft`, `isSaving`, and `error` **into** the item and keep only `editingId` in the parent. The item can then call `onSaved(updated)`. That gives fewer props and better encapsulation. Say which you'd pick and why.

### Step 5: Return focus
After Save or Cancel, focus should go back to the "Edit note" button for that item. Use a ref map (`useRef(new Map())`), or keep the state in the item component and put a ref on its button. This is a nice touch if there's time.

## Tests (add to [ProjectDetail.test.jsx](../../src/pages/ProjectDetail.test.jsx))
Add `updateInspiration: jest.fn()` to the `../services/inspiration` mock. Reuse `inspirationA` from Q6.

```jsx
it('edits and saves a note', async () => {
  getProject.mockResolvedValue(mockProject)
  getInspirationsByProject.mockResolvedValue([inspirationA])
  updateInspiration.mockImplementation(async (id, updates) => ({
    ...inspirationA, ...updates, updatedAt: '2024-02-01T00:00:00.000Z',
  }))
  render(<MemoryRouter><ProjectDetail /></MemoryRouter>)

  fireEvent.click(await screen.findByRole('button', { name: 'Add note for Site A' }))
  fireEvent.change(screen.getByLabelText('Note for Site A'), {
    target: { value: '  Love the hero section  ' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))

  expect(await screen.findByText('Love the hero section')).toBeInTheDocument()
  expect(updateInspiration).toHaveBeenCalledWith('insp-a', { notes: 'Love the hero section' })
  expect(screen.queryByLabelText('Note for Site A')).not.toBeInTheDocument()
})

it('cancel and Escape discard the draft', async () => {
  // open → type → press Escape (fireEvent.keyDown(textarea, { key: 'Escape' }))
  // → textarea gone, original note shown, updateInspiration not called
})

it('keeps the editor open with the draft when save fails', async () => {
  // updateInspiration.mockRejectedValue → alert shown, textarea still has the draft
})
```

Run them: `npm test -- src/pages/ProjectDetail.test.jsx`

## Stretch / Follow-ups
- *"Autosave instead of a Save button."* → Story 2: write a `useDebouncedCallback` with `flush` and `cancel`, flush on blur and unmount, and use a request-sequence guard so a slow earlier save can't overwrite a newer one.
- *"Warn before losing unsaved changes."* → If `draft !== original`, ask before switching to another item, and use `beforeunload` for page navigation.
- *"Let AI draft the note."* → Story 3 (AI-suggested notes and tags with Ollama). The suggestion fills `draft` and the user still clicks Save.
