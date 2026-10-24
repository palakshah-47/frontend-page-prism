# Q5. Add an Inspiration by URL (Simple Version)

> As a designer, I want to paste a URL into a project and see it listed as an inspiration.

**Time box:** about 20 min · **Files:** [ProjectDetail.jsx](../../src/pages/ProjectDetail.jsx), [stringUtils.ts](../../src/utils/stringUtils.ts), new `src/components/AddInspirationForm.jsx`, [ProjectDetail.test.jsx](../../src/pages/ProjectDetail.test.jsx)

**Out of scope:** screenshots. See Story 1 in the interview doc for the full version with persisted Blobs.

## Acceptance Criteria
1. The project detail page has a labelled URL input and an **"Add"** button.
2. An empty or invalid URL shows an inline error (`role="alert"`) and **makes no service call**. A bare domain (`stripe.com`) is accepted.
3. On submit, call `getMetadata`. If it fails, fall back to `{ url, title: url }` and still save.
4. The inspiration is saved with `createInspiration` and appears in the list without a reload.
5. Each item's title links to the site in a new tab (`target="_blank" rel="noopener noreferrer"`).
6. The button is disabled and reads "Adding..." while saving. The input clears on success.
7. The list loads from `getInspirationsByProject(id)` and no longer reads `project.inspirations`.

## Clarify Before Coding (say out loud)
- **Source of truth:** the `inspirations` store plus its `by-project` index is canonical. I'll stop reading `project.inspirations` (Part 0, item 4). I won't write to the embedded array either, so there's no second copy to keep in sync.
- **What does `getMetadata` expect?** [api.js](../../src/utils/api.js) builds `https://screenshotof.com/${websiteUri}`, so it most likely wants `stripe.com`, not `https://stripe.com`. Check with curl before relying on it:
  `curl "https://screenshotof.com/stripe.com?f=json"`
- **Security:** allow only `http:` and `https:` URLs. A `javascript:` URL in an `href` is an XSS vector.

## Implementation Steps

### Step 1: `normalizeUrl` utility (TDD, 3 min)
Add to [stringUtils.ts](../../src/utils/stringUtils.ts):
```ts
/**
 * Normalizes user input into an absolute http(s) URL.
 * Returns null when the input is empty or not a valid http(s) URL.
 */
export const normalizeUrl = (input: string): string | null => {
  const trimmed = input.trim()
  if (!trimmed) return null
  const withScheme = /^[a-z][a-z\d+\-.]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.')) return null // rejects "foo", "localhost"
    return url.href
  } catch {
    return null
  }
}
```
Write `src/utils/stringUtils.test.ts` **first**:
| Input | Expected |
|---|---|
| `'stripe.com'` | `'https://stripe.com/'` |
| `'  https://x.com/a  '` | `'https://x.com/a'` |
| `'javascript:alert(1)'` | `null` |
| `'ftp://x.com'` | `null` |
| `''`, `'   '`, `'not a url'` | `null` |

### Step 2: Fallback metadata helper
`WebsiteMetadata` in [schema.ts](../../src/models/schema.ts) has many required fields. Add a helper (in `src/services/inspiration.ts` or a small `src/utils/metadata.ts`) so a failed metadata call still produces a valid record:
```ts
export const fallbackMetadata = (url: string): WebsiteMetadata => ({
  url, title: url, description: null, favicon: null, author: null, date: null,
  image: null, logo: null, publisher: null, ogTitle: null, ogDescription: null,
  ogImage: [], ogLocale: null, ogUrl: null, charset: null,
  urlRequested: url, urlResolved: url,
})
```

### Step 3: Load inspirations alongside the project
In [ProjectDetail.jsx](../../src/pages/ProjectDetail.jsx), fix the effect's cancellation bug (Part 0, item 1) while you're here, and load both in parallel:
```jsx
const [inspirations, setInspirations] = useState([])

useEffect(() => {
  let cancelled = false
  const load = async () => {
    setStatus('loading')
    try {
      const [projectData, items] = await Promise.all([
        getProject(id),
        getInspirationsByProject(id),
      ])
      if (cancelled) return
      if (!projectData) return setStatus('notfound')
      setProject(projectData)
      setInspirations(
        [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      )
      setStatus('ready')
    } catch {
      if (!cancelled) setStatus('error')
    }
  }
  load()
  return () => {
    cancelled = true
  }
}, [id])
```

### Step 4: `AddInspirationForm.jsx` (presentational plus a little logic)
```jsx
import { useState } from 'react'
import Button from './Button'
import { normalizeUrl } from '../utils/stringUtils'

const AddInspirationForm = ({ onAdd }) => {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = normalizeUrl(value)
    if (!url) {
      setError('Enter a valid website URL, e.g. stripe.com')
      return
    }
    setError('')
    setIsSaving(true)
    try {
      await onAdd(url)
      setValue('')
    } catch {
      setError('Could not add this inspiration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex gap-2 items-start">
      <label htmlFor="inspiration-url" className="sr-only">Website URL</label>
      <input
        id="inspiration-url"
        type="url"
        value={value}
        placeholder="Paste a website URL"
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'inspiration-error' : undefined}
        className="rounded border border-gray-300 bg-white p-2 text-gray-900"
      />
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Adding...' : 'Add'}
      </Button>
      {error && (
        <p id="inspiration-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}

export default AddInspirationForm
```
- `noValidate`: the browser's built-in `type="url"` check would reject `stripe.com`, so turn it off and validate yourself.
- The same `aria-invalid` / `aria-describedby` pattern is already used in [UpdateProject.jsx](../../src/pages/UpdateProject.jsx#L74-L75).

### Step 5: Orchestrate in `ProjectDetail`
```jsx
const handleAddInspiration = async (url) => {
  let websiteMetadata
  try {
    const { host, pathname } = new URL(url)
    websiteMetadata = await getMetadata(`${host}${pathname === '/' ? '' : pathname}`)
  } catch {
    websiteMetadata = fallbackMetadata(url) // metadata failure is non-fatal
  }
  const created = await createInspiration({
    projectId: id,
    websiteMetadata,
    screenshot_uri: '',
    notes: '',
  })
  setInspirations((prev) => [created, ...prev])
}
```
A failure from `createInspiration` propagates to the form, which shows the error. Later, this orchestration could move into a `captureInspiration` service or a `useProjectInspirations` hook (Story 1, steps 5–6).

### Step 6: Render the list
Replace the `project.inspirations` block:
```jsx
<AddInspirationForm onAdd={handleAddInspiration} />
{inspirations.length > 0 ? (
  <ul className={styles.inspirationList} aria-label="Inspirations">
    {inspirations.map((insp) => {
      const { title, url } = insp.websiteMetadata
      return (
        <li key={insp.id}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title || url}
          </a>
        </li>
      )
    })}
  </ul>
) : (
  <p>No inspirations added yet.</p>
)}
```

## Tests

> ⚠️ **The existing [ProjectDetail.test.jsx](../../src/pages/ProjectDetail.test.jsx) will break** once the page calls `getInspirationsByProject`. jsdom has no IndexedDB, so the real service rejects and the page shows the error state. Mock the inspiration service and the API module in that file:

```jsx
import { getInspirationsByProject, createInspiration } from '../services/inspiration'
import { getMetadata } from '../utils/api'

jest.mock('../services/inspiration', () => ({
  getInspirationsByProject: jest.fn(),
  createInspiration: jest.fn(),
}))
jest.mock('../utils/api', () => ({ getMetadata: jest.fn() }))

beforeEach(() => {
  jest.clearAllMocks()
  getInspirationsByProject.mockResolvedValue([])
})

it('adds an inspiration from a URL', async () => {
  getProject.mockResolvedValue(mockProject)
  getMetadata.mockResolvedValue({ url: 'https://stripe.com/', title: 'Stripe' })
  createInspiration.mockImplementation(async (i) => ({
    ...i, id: 'insp-1', createdAt: 'x', updatedAt: 'x',
  }))
  render(<MemoryRouter><ProjectDetail /></MemoryRouter>)
  await screen.findByText('Project one')

  fireEvent.change(screen.getByLabelText('Website URL'), { target: { value: 'stripe.com' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add' }))

  const link = await screen.findByRole('link', { name: 'Stripe' })
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  expect(createInspiration).toHaveBeenCalledWith(
    expect.objectContaining({ projectId: 'project-1', notes: '' })
  )
  expect(screen.getByLabelText('Website URL')).toHaveValue('')
})

it('shows an error and does not save for an empty URL', async () => {
  getProject.mockResolvedValue(mockProject)
  render(<MemoryRouter><ProjectDetail /></MemoryRouter>)
  await screen.findByText('Project one')

  fireEvent.click(screen.getByRole('button', { name: 'Add' }))

  expect(screen.getByRole('alert')).toHaveTextContent(/valid website URL/)
  expect(createInspiration).not.toHaveBeenCalled()
})

it('still saves with the URL as title when metadata fails', async () => {
  // getMetadata.mockRejectedValue(...) → link text is 'https://stripe.com/'
})

it('disables the button while saving', async () => {
  // createInspiration returns a pending promise → button is disabled and reads 'Adding...'
})
```

Run them: `npm test -- src/pages/ProjectDetail.test.jsx src/utils/stringUtils.test.ts`

## Stretch / Follow-ups
- *"Add screenshots."* → Story 1: run `Promise.allSettled([getMetadata, getScreenshotBlob])`, store the **Blob** (object URLs don't survive a reload), and revoke object URLs on unmount.
- *"Prevent duplicates."* → Check `inspirations.some(i => i.websiteMetadata.urlResolved === url)` client-side now, and add a compound index `[projectId, url]` later.
- *"Metadata takes 5 s."* → Insert an optimistic "pending" item straight away, then swap in the real record. Add an `AbortController` so navigating away cancels the request.
