# Q4. Dashboard Summary

> As a user, I want the dashboard to show how many projects I have and my most recent ones.

**Time box:** about 15 min · **Files:** [Dashboard.jsx](../../src/pages/Dashboard.jsx), new `src/pages/Dashboard.test.jsx`

## Acceptance Criteria
1. While fetching, the page shows a loading state (`role="status"`).
2. Once loaded, it shows **"You have N projects"** with correct plurals ("1 project", "0 projects").
3. It lists links to the **3 most recently updated** projects, each going to its detail page.
4. With no projects, it shows a friendly message and a link to `/projects`.
5. If the fetch fails, it shows an error message (`role="alert"`).

## Clarify Before Coding (say out loud)
- Should the link match the one on the Projects page? Yes. Projects links to `/projects/:id/:name` (see [Projects.jsx:67-68](../../src/pages/Projects.jsx#L67-L68) and the optional `:name?` segment in [routes.jsx](../../src/routes.jsx)). Reuse the same format, ideally from a shared helper.
- Should the counting and sorting happen in the component or in a service? Fine in the component for now. With a real backend you'd add a `getDashboardSummary()` endpoint so you don't download every project just to count them.

## Implementation Steps

### Step 1 (optional but nice): Shared link helper
Create `src/utils/routes.js`:
```js
export const projectPath = (project) =>
  `/projects/${project.id}/${encodeURIComponent(project?.name || 'project')}`
```
Use it in both `Projects.jsx` and `Dashboard.jsx` so the URL format is defined in one place.

### Step 2: Fetch with a status and a cancellation guard
```jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllProjects } from '../services/project'
import { projectPath } from '../utils/routes'

const RECENT_LIMIT = 3

const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    let cancelled = false
    getAllProjects()
      .then((all) => {
        if (cancelled) return
        setProjects(all)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])
```

### Step 3: Work out the recent projects (copy before sorting)
```jsx
  const recent = useMemo(
    () =>
      [...projects]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, RECENT_LIMIT),
    [projects]
  )
```
Say this out loud: `[...projects]` matters because `sort` mutates the array in place, and `projects` is React state.

### Step 4: Render each state
```jsx
  if (status === 'loading') return <p role="status">Loading your dashboard...</p>
  if (status === 'error')
    return <p role="alert">Could not load your projects. Please refresh.</p>

  const count = projects.length
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Welcome to the Dashboard</h2>
      <p>
        You have {count} {count === 1 ? 'project' : 'projects'}
      </p>

      {count === 0 ? (
        <p>
          <Link to="/projects" className="underline">Create your first project</Link>
        </p>
      ) : (
        <>
          <h3 className="font-medium">Recently updated</h3>
          <ul aria-label="Recently updated projects" className="space-y-1">
            {recent.map((p) => (
              <li key={p.id}>
                <Link to={projectPath(p)} className="underline">{p.name}</Link>{' '}
                <small className="text-gray-500">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
          <Link to="/projects">View all projects</Link>
        </>
      )}
    </section>
  )
}

export default Dashboard
```

> Optional: you can replace the plural ternary with `Intl.PluralRules`. Mention it as the i18n-ready approach, but the ternary is fine for an interview.

## Tests: `src/pages/Dashboard.test.jsx`
```jsx
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import { getAllProjects } from '../services/project'

jest.mock('../services/project', () => ({ getAllProjects: jest.fn() }))

const make = (id, name, updatedAt) => ({ id, name, description: '', updatedAt })

const renderPage = () =>
  render(<MemoryRouter><Dashboard /></MemoryRouter>)

beforeEach(() => jest.clearAllMocks())

it('shows a loading state first', () => {
  getAllProjects.mockReturnValue(new Promise(() => {}))
  renderPage()
  expect(screen.getByRole('status')).toBeInTheDocument()
})

it('shows the count and the 3 most recent projects as links', async () => {
  getAllProjects.mockResolvedValue([
    make('a', 'Oldest', '2024-01-01T00:00:00.000Z'),
    make('b', 'Newest', '2024-05-01T00:00:00.000Z'),
    make('c', 'Middle', '2024-03-01T00:00:00.000Z'),
    make('d', 'Second', '2024-04-01T00:00:00.000Z'),
  ])
  renderPage()

  expect(await screen.findByText('You have 4 projects')).toBeInTheDocument()

  const list = screen.getByRole('list', { name: 'Recently updated projects' })
  const links = within(list).getAllByRole('link')
  expect(links.map((l) => l.textContent)).toEqual(['Newest', 'Second', 'Middle'])
  expect(links[0]).toHaveAttribute('href', '/projects/b/Newest')
})

it('uses the singular for one project', async () => {
  getAllProjects.mockResolvedValue([make('a', 'Only', '2024-01-01T00:00:00.000Z')])
  renderPage()
  expect(await screen.findByText('You have 1 project')).toBeInTheDocument()
})

it('shows an error when loading fails', async () => {
  getAllProjects.mockRejectedValue(new Error('boom'))
  renderPage()
  expect(await screen.findByRole('alert')).toBeInTheDocument()
})
```

Run them: `npm test -- src/pages/Dashboard.test.jsx`

## Stretch / Follow-ups
- *"Show the total number of inspirations too."* → Add `countAllInspirations()` with `db.count('inspirations')`. Don't load every record to count it.
- *"The dashboard and the projects page both fetch all projects. How would you dedupe that?"* → Use a shared `useProjects()` hook backed by a context or TanStack Query cache.
- *"Make it feel faster."* → Show skeleton rows instead of text while loading, and cache the last result so the next visit renders instantly.
