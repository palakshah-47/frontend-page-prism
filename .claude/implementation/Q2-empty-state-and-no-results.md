# Q2. Empty State and "No Results" on the Projects Page

> As a user, I want a clear message when I have no projects or my search matches nothing.

**Time box:** about 10 min · **Files:** [Projects.jsx](../../src/pages/Projects.jsx), [Projects.test.jsx](../../src/pages/Projects.test.jsx)

## Acceptance Criteria
1. When there are no projects, the page shows **"No projects yet. Create one above."**
2. When a search matches nothing, the page shows **No projects match "xyz"** and a **"Clear search"** button.
3. "Clear search" empties the search box and shows the full list again.
4. Neither message appears while projects are still loading.

## Clarify Before Coding (say out loud)
- `projects` starts as `[]`, so a plain `projects.length === 0` check makes "No projects yet" **flash before the data loads**. I need a loading status to tell "still loading" apart from "loaded, and the list is empty".
- Should the message use the raw query or the trimmed query? Use the trimmed query (`query.trim()`). That matches what the filter actually uses.
- Should "Clear search" move focus back to the search input? Yes. It's a small accessibility win.

## Implementation Steps

### Step 1: Add a load status
In [Projects.jsx](../../src/pages/Projects.jsx), add a `status` state and set it once the fetch finishes:

```jsx
const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

useEffect(() => {
  let cancelled = false
  const fetchProjects = async () => {
    try {
      const allProjects = await getAllProjects()
      if (cancelled) return
      setProjects(allProjects)
      setStatus('ready')
    } catch {
      if (!cancelled) setStatus('error')
    }
  }
  fetchProjects()
  return () => {
    cancelled = true
  }
}, [])
```

> Talking point: this also adds the cancellation guard (`cancelled`) in the right place. Compare it with the bug in `ProjectDetail.jsx` (Part 0, item 1).

### Step 2: Add a ref to the search input (for focus after clearing)
```jsx
const searchRef = useRef(null)
// ...
<input id="search" ref={searchRef} ... />
```

### Step 3: Render the states in order
Replace the bare `visibleProjects.map(...)` with a small set of branches:

```jsx
const trimmedQuery = query.trim()

const handleClearSearch = () => {
  setQuery('')
  searchRef.current?.focus()
}

// in JSX, below the search input:
{status === 'loading' && <p role="status">Loading projects...</p>}

{status === 'error' && (
  <p role="alert">Could not load projects. Please refresh the page.</p>
)}

{status === 'ready' && projects.length === 0 && (
  <p className="p-4 text-gray-600">No projects yet. Create one above.</p>
)}

{status === 'ready' && projects.length > 0 && visibleProjects.length === 0 && (
  <div className="p-4" role="status">
    <p className="text-gray-600">No projects match &quot;{trimmedQuery}&quot;</p>
    <Button type="button" onClick={handleClearSearch}>
      Clear search
    </Button>
  </div>
)}

{visibleProjects.map((project) => (/* existing card markup */))}
```

Notes:
- Order matters. Check "no projects at all" **before** "no matches". Otherwise an empty database with an empty query would hit the wrong branch. (An empty query matches every project, so `visibleProjects.length === 0` would be true here too.)
- `{trimmedQuery}` goes through JSX, so React escapes it. Never build this message with `dangerouslySetInnerHTML`.
- `role="status"` on the no-results block makes screen readers announce it as the user types.

### Step 4 (optional, 1 min): Remove dead code
The unused `name`, `description`, `error`, `isSaving`, `handleSubmit`, and `createProject` import in `Projects.jsx` (Part 0, item 7) can go in the same PR or a separate cleanup commit. Say which you'd choose. A separate commit keeps the diff easy to review.

## Tests (add to [Projects.test.jsx](../../src/pages/Projects.test.jsx))

> Gotcha: the existing tests call `getAllProjects.mockResolvedValue(...)` without resetting the mock, so one test's data leaks into the next. Add `beforeEach(() => jest.clearAllMocks())` and set the resolved value explicitly in every test.

```jsx
it('shows an empty state when there are no projects', async () => {
  getAllProjects.mockResolvedValue([])
  render(<MemoryRouter><Projects /></MemoryRouter>)

  expect(
    await screen.findByText('No projects yet. Create one above.')
  ).toBeInTheDocument()
})

it('does not show the empty state while loading', () => {
  getAllProjects.mockReturnValue(new Promise(() => {})) // never resolves
  render(<MemoryRouter><Projects /></MemoryRouter>)

  expect(screen.getByRole('status')).toHaveTextContent('Loading projects...')
  expect(screen.queryByText(/No projects yet/)).not.toBeInTheDocument()
})

it('shows "no results" and clears the search', async () => {
  getAllProjects.mockResolvedValue(mockProjects)
  render(<MemoryRouter><Projects /></MemoryRouter>)
  await screen.findByText('Project1')

  const search = screen.getByRole('searchbox', { name: 'Search Projects:' })
  fireEvent.change(search, { target: { value: 'xyz' } })

  expect(screen.getByText('No projects match "xyz"')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

  expect(search).toHaveValue('')
  expect(search).toHaveFocus()
  expect(screen.getByText('Project1')).toBeInTheDocument()
})
```

Run them: `npm test -- src/pages/Projects.test.jsx`

## Stretch / Follow-ups
- *"The empty state should have a call to action."* → Add a button that focuses the Name input in `UpdateProject`. You can expose it with `forwardRef`, or more simply rely on the input's existing `autoFocus`.
- *"Search should also match descriptions."* → Extend the filter: `(p.name + ' ' + p.description).toLowerCase().includes(q)`.
- *"Should the query survive a reload or be shareable?"* → Store it in the URL with `useSearchParams()` (`?q=brand`).
