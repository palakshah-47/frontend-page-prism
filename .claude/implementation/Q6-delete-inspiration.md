# Q6. Delete an Inspiration

> As a designer, I want to remove an inspiration I no longer need.

**Time box:** about 10 min · **Depends on:** [Q5](Q5-add-inspiration-by-url.md) (an `inspirations` state array in `ProjectDetail`, loaded from `getInspirationsByProject`) · **Files:** [ProjectDetail.jsx](../../src/pages/ProjectDetail.jsx), [ProjectDetail.test.jsx](../../src/pages/ProjectDetail.test.jsx)

## Acceptance Criteria
1. Each inspiration has a **"Remove"** button, with an accessible name that includes the item (for example "Remove Stripe").
2. Clicking it deletes the inspiration from IndexedDB (`deleteInspiration(id)`) and removes it from the list.
3. While one item is being removed, its button is disabled, so a double click can't send two deletes.
4. If the delete fails, the item stays in the list and an inline error is shown.
5. Removing the last item shows "No inspirations added yet."

## Clarify Before Coding (say out loud)
- **Pessimistic or optimistic?**
  - *Pessimistic* (await the delete, then remove from state): simple and always correct. IndexedDB is local and fast, so the delay isn't noticeable. **Do this for the quick story.**
  - *Optimistic* (remove first, roll back on error): feels instant, but you have to restore the item at its original index.
  - *Deferred commit with undo* (Story 2): the best UX, but it needs a toast system and you must flush pending deletes on unmount.
- **Confirm before deleting?** One inspiration is low stakes, unlike a whole project (Q1). An undo toast is better than a confirm dialog here. Call it out as a follow-up.

## Implementation Steps

### Step 1: Track which items are being removed and any error
```jsx
const [removingIds, setRemovingIds] = useState(() => new Set())
const [inspirationError, setInspirationError] = useState('')
```
A `Set` lets several removals run at once without interfering with each other. Always create a **new** Set when you update it so React sees the change.

### Step 2: Handler
```jsx
const handleRemoveInspiration = async (inspirationId) => {
  setInspirationError('')
  setRemovingIds((prev) => new Set(prev).add(inspirationId))
  try {
    await deleteInspiration(inspirationId)
    setInspirations((prev) => prev.filter((i) => i.id !== inspirationId))
  } catch {
    setInspirationError('Could not remove that inspiration. Please try again.')
  } finally {
    setRemovingIds((prev) => {
      const next = new Set(prev)
      next.delete(inspirationId)
      return next
    })
  }
}
```
Talking point: use **functional updates** (`prev => ...`). Two removals finishing close together would otherwise both start from the same stale `inspirations` array, and one deleted item would reappear.

### Step 3: Add the button to each list item
```jsx
{inspirations.map((insp) => {
  const { title, url } = insp.websiteMetadata
  const label = title || url
  const isRemoving = removingIds.has(insp.id)
  return (
    <li key={insp.id} className="flex items-center justify-between gap-2">
      <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
      <Button
        type="button"
        onClick={() => handleRemoveInspiration(insp.id)}
        disabled={isRemoving}
        aria-label={`Remove ${label}`}
      >
        {isRemoving ? 'Removing...' : 'Remove'}
      </Button>
    </li>
  )
})}
{inspirationError && <p role="alert" className="text-sm text-red-600">{inspirationError}</p>}
```
- Without the `aria-label`, a screen reader hears "Remove, Remove, Remove" with no context.
- [Button.jsx](../../src/components/Button.jsx) spreads `...props` onto the `<button>`, so `aria-label` and `disabled` reach the DOM. It also defaults to `type="button"`, so it won't submit a form by accident. Use `variant="danger"` for Remove.

### Step 4 (optional): Extract `InspirationItem.jsx`
If the `<li>` grows (Q7 adds notes, Story 3 adds AI suggestions), move it into `src/components/InspirationItem.jsx` with props `{ inspiration, onRemove, isRemoving }`. That keeps `ProjectDetail` as the container and the item as a presentational component.

## Tests (add to [ProjectDetail.test.jsx](../../src/pages/ProjectDetail.test.jsx))
Add `deleteInspiration: jest.fn()` to the `../services/inspiration` mock.

```jsx
const inspirationA = {
  id: 'insp-a', projectId: 'project-1', notes: '',
  websiteMetadata: { url: 'https://a.com/', title: 'Site A' },
  createdAt: '2024-01-02T00:00:00.000Z', updatedAt: '2024-01-02T00:00:00.000Z',
}
const inspirationB = { ...inspirationA, id: 'insp-b',
  websiteMetadata: { url: 'https://b.com/', title: 'Site B' } }

it('removes an inspiration', async () => {
  getProject.mockResolvedValue(mockProject)
  getInspirationsByProject.mockResolvedValue([inspirationA, inspirationB])
  deleteInspiration.mockResolvedValue()
  render(<MemoryRouter><ProjectDetail /></MemoryRouter>)

  fireEvent.click(await screen.findByRole('button', { name: 'Remove Site A' }))

  await waitFor(() =>
    expect(screen.queryByText('Site A')).not.toBeInTheDocument()
  )
  expect(deleteInspiration).toHaveBeenCalledWith('insp-a')
  expect(deleteInspiration).toHaveBeenCalledTimes(1)
  expect(screen.getByText('Site B')).toBeInTheDocument()
})

it('keeps the item and shows an error if the delete fails', async () => {
  getProject.mockResolvedValue(mockProject)
  getInspirationsByProject.mockResolvedValue([inspirationA])
  deleteInspiration.mockRejectedValue(new Error('nope'))
  render(<MemoryRouter><ProjectDetail /></MemoryRouter>)

  fireEvent.click(await screen.findByRole('button', { name: 'Remove Site A' }))

  expect(await screen.findByRole('alert')).toHaveTextContent(/Could not remove/)
  expect(screen.getByText('Site A')).toBeInTheDocument()
})

it('shows the empty message after removing the last item', async () => {
  // single item → remove → 'No inspirations added yet.'
})
```

Run them: `npm test -- src/pages/ProjectDetail.test.jsx`

## Stretch / Follow-ups
- *"Add undo."* → Story 2's deferred commit: remove from state, start a 5 s timer to call `deleteInspiration`, cancel the timer on Undo, and **flush pending deletes on unmount or `pagehide`**.
- *"Where does focus go after the item disappears?"* → Move it to the next item's Remove button, or to the list heading. Otherwise focus drops to `<body>`, which breaks keyboard navigation.
- *"Another tab still shows the deleted item."* → Publish a change event on `BroadcastChannel('page-prism')` and re-sync when other tabs receive it.
