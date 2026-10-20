# Q3. Sort Projects

> As a user, I want to sort my projects by name or by last updated.

**Time box:** about 10 min · **Files:** [Projects.jsx](../../src/pages/Projects.jsx), [Projects.test.jsx](../../src/pages/Projects.test.jsx)

## Acceptance Criteria
1. A labelled `<select>` ("Sort by") offers **"Recently updated"** (the default) and **"Name A–Z"**.
2. Changing it re-orders the list right away, with no refetch.
3. Sorting works together with the search filter.

## Clarify Before Coding (say out loud)
- Should name sorting be case-sensitive? No. "apple" and "Banana" should sort as a person expects. Use `localeCompare` with `sensitivity: 'base'` and `numeric: true` so "Project 2" comes before "Project 10".
- What happens with ties? Fall back to `updatedAt` descending so the order is stable and predictable.
- Should the choice persist? Not in scope. Mention `localStorage` or a URL param as a follow-up.

## Design Notes
- The sorted list is **derived state**. Keep it in the existing `useMemo` and don't store a second sorted copy in state.
- About mutation: `filter()` already returns a new array, so the current `.filter().sort()` does **not** mutate `projects`. If you ever drop the filter, write `[...projects].sort(...)`. `Array.prototype.sort` sorts in place, and mutating React state causes subtle bugs.
- Keep the comparators in a map outside the component. They don't depend on props or state, they stay stable across renders, and you can unit test them.

## Implementation Steps

### Step 1: Define the comparators (top of `Projects.jsx`, outside the component)
```jsx
const byUpdatedDesc = (a, b) => b.updatedAt.localeCompare(a.updatedAt)

const SORTERS = {
  updated: byUpdatedDesc,
  name: (a, b) =>
    a.name.localeCompare(b.name, undefined, {
      sensitivity: 'base',
      numeric: true,
    }) || byUpdatedDesc(a, b),
}
```
(Comparing ISO-8601 strings with `localeCompare` is safe because the timestamps come from `toISOString()`, so they all have the same format.)

### Step 2: Add the state
```jsx
const [sortBy, setSortBy] = useState('updated')
```

### Step 3: Update the `useMemo`
```jsx
const visibleProjects = useMemo(() => {
  const q = query.trim().toLowerCase()
  return projects
    .filter((p) => p.name.toLowerCase().includes(q))
    .sort(SORTERS[sortBy])
}, [projects, query, sortBy])
```
Point out that `sortBy` **must** be in the dependency array. Without it the memo returns a stale order. The `react-hooks/exhaustive-deps` lint rule catches this.

### Step 4: Add the control next to the search input
```jsx
<label htmlFor="sort" className="ml-4">Sort by:</label>
<select
  id="sort"
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value)}
  className="p-2 rounded border bg-transparent ml-2"
>
  <option value="updated">Recently updated</option>
  <option value="name">Name A–Z</option>
</select>
```

## Tests (add to [Projects.test.jsx](../../src/pages/Projects.test.jsx))

Choose data where the two orders differ. Here the most recently updated project has the name that sorts last:

```jsx
it('sorts by recently updated by default and by name when selected', async () => {
  getAllProjects.mockResolvedValue([
    { id: '1', name: 'zeta', description: '', updatedAt: '2024-03-01T00:00:00.000Z' },
    { id: '2', name: 'Alpha', description: '', updatedAt: '2024-01-01T00:00:00.000Z' },
    { id: '3', name: 'beta', description: '', updatedAt: '2024-02-01T00:00:00.000Z' },
  ])
  render(<MemoryRouter><Projects /></MemoryRouter>)
  await screen.findByText('zeta')

  const headingTexts = () =>
    screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)

  expect(headingTexts()).toEqual(['zeta', 'beta', 'Alpha'])

  fireEvent.change(screen.getByLabelText('Sort by:'), {
    target: { value: 'name' },
  })

  expect(headingTexts()).toEqual(['Alpha', 'beta', 'zeta']) // case-insensitive
})

it('keeps the sort order while filtering', async () => {
  // same data; search "a" → Alpha, beta, zeta all match; then sort by name
  // and check the order still holds after the filter is applied
})
```

> If you add any other `<h2>` to the page later, scope the query with `within(list)` so the test doesn't break.

Run them: `npm test -- src/pages/Projects.test.jsx`

## Stretch / Follow-ups
- *"Add 'Oldest first' and 'Name Z–A'."* → Add entries to `SORTERS`, or store `{ key, direction }` and multiply the result by `-1`.
- *"Remember my choice."* → `useSearchParams` (shareable) or a small `useLocalStorageState` hook.
- *"10,000 projects?"* → The sort is O(n log n) on every keystroke. Debounce the search, or sort once on load and only filter after that. With a real backend, sort on the server with an IndexedDB index such as `by-updatedAt`.
