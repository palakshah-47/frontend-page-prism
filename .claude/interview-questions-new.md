# Staff Engineer Interview Prep: Page Prism User Stories

## How to Use This Doc
The interview will likely give you **two feature stories** and **one small AI-workflow story** on this repo. The stories below fit the current code (as of branch `second_interview_prep`). Each one has:
- **User story and acceptance criteria**: what "done" means
- **Design discussion**: the Staff-level trade-offs to say out loud before you write code
- **Implementation steps**: an ordered, incremental plan, with each step shippable and testable
- **Tests**: what to verify
- **Stretch / follow-ups**: where the interviewer may push next

> Staff-level signal: before you write code, restate the requirement, point out ambiguities, name the trade-offs, and agree on scope. Ship a thin vertical slice first, then iterate.

---

## Part 0: Codebase Recon (spend 5 min on this in the interview)

Things worth noticing and mentioning. Interviewers often plant these.

| # | Location | Observation | Why it matters |
|---|----------|-------------|----------------|
| 1 | [ProjectDetail.jsx:15-35](../src/pages/ProjectDetail.jsx#L15-L35) | The cleanup function is returned from *inside* the async `fetchProject`, not from the `useEffect`. `cancelled` is never set to `true` where React can see it. | Race condition when navigating quickly between projects: stale data can overwrite fresh data. Fix: declare `let cancelled = false` in the effect body and `return () => { cancelled = true }` from the effect. |
| 2 | [ProjectDetail.jsx:21-26](../src/pages/ProjectDetail.jsx#L21-L26) | `setProject` / `setStatus` run without checking `cancelled`. | Same race; also a set-state-after-unmount risk. |
| 3 | [project.ts:88-95](../src/services/project.ts#L88-L95) | `deleteProject` does not delete the project's inspirations. | Orphaned rows in the `inspirations` store. Fix with a single multi-store transaction. |
| 4 | [schema.ts:10](../src/models/schema.ts#L10) and [indexedDB.ts](../src/utils/indexedDB.ts) | `Project.inspirations` is an embedded array, **and** there's a separate `inspirations` store with a `by-project` index. | Two sources of truth. Pick one (recommend the store plus index as canonical, and drop or derive the embedded array). |
| 5 | [indexedDB.ts:35-37](../src/utils/indexedDB.ts#L35-L37) | `getDB()` calls `openDB` on every service call. | Wasteful. Memoize the promise (`let dbPromise; return dbPromise ??= initDB()`). |
| 6 | [api.js:24-25](../src/utils/api.js#L24-L25) | `getScreenshot` returns `URL.createObjectURL(blob)`. | Object URLs die on reload. Saving one as `screenshot_uri` gives a broken image after refresh. Store the **Blob** in IndexedDB instead. |
| 7 | [Projects.jsx:30-51](../src/pages/Projects.jsx#L30-L51) | `handleSubmit`, `name`, `description`, `error`, `isSaving` are unused (creation moved into `UpdateProject`). | Dead code. Clean it up. |
| 8 | [Projects.jsx:45](../src/pages/Projects.jsx#L45) / [UpdateProject.jsx:35](../src/pages/UpdateProject.jsx#L35) | New projects are appended, but the list is sorted by `updatedAt` desc. | Works because `useMemo` re-sorts, but worth confirming. |
| 9 | [UpdateProject.jsx:49-50](../src/pages/UpdateProject.jsx#L49-L50) | After an edit, the code navigates to `/projects` instead of updating the detail view in place. It also saves untrimmed values. | UX inconsistency. A callback such as `onSaved(updated)` is cleaner. |
| 10 | [ProjectDetail.jsx:50](../src/pages/ProjectDetail.jsx#L50) | Typo: "coundn't". | Minor, but shows attention to detail. |
| 11 | [ProjectDetail.jsx:37-44](../src/pages/ProjectDetail.jsx#L37-L44) | Delete has no confirmation and uses `alert`. | Destructive action with no confirm or undo. |

---

## Part 1: Quick Stories (Easy to Implement, 10–20 min each)

Small, self-contained stories that use the services you already have. Practise these first. The detailed stories further down are for deeper discussion.

### Q1. Confirm Before Deleting a Project
> As a user, I want to confirm before a project is deleted, so I don't delete one by accident.

- **Done when:** Clicking "Delete Project" asks "Delete this project?". Cancel does nothing. OK deletes and goes to `/projects`.
- **How:** In `handleDelete` in [ProjectDetail.jsx](../src/pages/ProjectDetail.jsx), return early if `window.confirm(...)` is false. Replace `alert` with an inline error message in state.
- **Test:** Mock `window.confirm` to return `false` and check that `deleteProject` is not called.

### Q2. Empty State and "No Results" on the Projects Page
> As a user, I want a clear message when I have no projects or my search matches nothing.

- **Done when:** With no projects, the page shows "No projects yet. Create one above." When a search matches nothing, it shows "No projects match "xyz"" and a "Clear search" button.
- **How:** In [Projects.jsx](../src/pages/Projects.jsx), check `projects.length === 0` and `visibleProjects.length === 0`. "Clear search" calls `setQuery('')`.
- **Test:** Render with an empty list, then type a search term that doesn't match.

### Q3. Sort Projects
> As a user, I want to sort my projects by name or by last updated.

- **Done when:** A `<select>` offers "Recently updated" (the default) and "Name A–Z", and the list re-orders right away.
- **How:** Add a `sortBy` state. In the existing `useMemo`, pick the comparator based on `sortBy` (use `localeCompare` for name). Add `sortBy` to the dependency array. Copy the array before sorting: `[...filtered].sort(...)`.
- **Test:** Change the select and check the order of the headings.

### Q4. Dashboard Summary
> As a user, I want the dashboard to show how many projects I have and my most recent ones.

- **Done when:** [Dashboard.jsx](../src/pages/Dashboard.jsx) shows "You have N projects" and links to the 3 most recently updated projects. It shows a loading state while fetching.
- **How:** Call `getAllProjects()` in `useEffect`, sort by `updatedAt` descending, `slice(0, 3)`, and render each one as a `<Link>`.
- **Test:** Mock `getAllProjects` and check the count text and the 3 links.

### Q5. Add an Inspiration by URL (Simple Version)
> As a designer, I want to paste a URL into a project and see it listed as an inspiration.

- **Done when:** On the project detail page, a URL input and an "Add" button save an inspiration. It appears in the list, and its title links to the site in a new tab. An empty or invalid URL shows an error. The button is disabled while saving.
- **How:**
  1. Call `getMetadata(url)` from [api.js](../src/utils/api.js). If it fails, fall back to `{ url, title: url }`.
  2. Call `createInspiration({ projectId: id, websiteMetadata, notes: '' })`.
  3. Load the list with `getInspirationsByProject(id)` instead of reading `project.inspirations`.
- **Skip for now:** screenshots (see Story 1 below for the full version).
- **Test:** Mock both services. Submitting adds a list item. An empty input shows an error and doesn't call the service.

### Q6. Delete an Inspiration
> As a designer, I want to remove an inspiration I no longer need.

- **Done when:** Each inspiration has a "Remove" button. Clicking it removes the inspiration from the list and from IndexedDB.
- **How:** Call `deleteInspiration(inspiration.id)`, then `setInspirations(prev => prev.filter(i => i.id !== inspiration.id))`.
- **Test:** Click Remove and check that the item is gone and `deleteInspiration` was called with the right id.

### Q7. Edit Notes on an Inspiration
> As a designer, I want to add a short note to an inspiration.

- **Done when:** Each inspiration has an "Edit note" button that opens a textarea with Save and Cancel. Save persists the note, and the note shows under the title.
- **How:** Keep `editingId` and `draft` in state. On Save, call `updateInspiration(id, { notes: draft })` and replace that item in the list with the returned object.
- **Test:** Edit, save, and check that the note text is shown and `updateInspiration` was called.

### Q8. Fix the Project Detail Loading Race (Bug Story)
> As a user, when I switch quickly between projects, I want to see the right project.

- **Done when:** Navigating from project A to project B never shows A's data on B's page.
- **How:** Declare `let cancelled = false` in the effect body (not inside `fetchProject`). Check `if (!cancelled)` before each `setState`. Return `() => { cancelled = true }` from the `useEffect` itself.
- **Test:** Hard to unit test. Explain the bug, and test by resolving the two `getProject` mocks out of order.

### Q9. Small AI Story: Suggest a Project Description
> As a user, I want a "Suggest description" button that fills in a description from the project name.

- **Done when:** In the create/edit form, clicking "✨ Suggest" fills the description field with suggested text. The user can still edit it before saving. The button shows "Thinking..." while waiting. On failure, it shows an error and the field is left unchanged.
- **How:**
  1. Create `src/services/ai.ts` with `suggestDescription(name)`. For the interview, return mock text after `mockLatency(800)`.
  2. Explain that a real version would `fetch('/api/suggest')` through a small server proxy, so the API key is never in the browser.
  3. Treat the AI text as plain text: trim it, cap its length, and never render it as HTML.
- **Test:** Mock `suggestDescription`. Clicking fills the textarea. A rejected promise shows the error.

| Story | Main skill shown | Rough time |
|-------|------------------|-----------|
| Q1 Confirm delete | Event handling, UX safety | 5 min |
| Q2 Empty / no results | Conditional rendering | 10 min |
| Q3 Sort | `useMemo`, derived state | 10 min |
| Q4 Dashboard | Data fetching, `Link` | 15 min |
| Q5 Add inspiration | Forms, services, async | 20 min |
| Q6 Delete inspiration | List state updates | 10 min |
| Q7 Edit notes | Inline editing | 15 min |
| Q8 Race fix | `useEffect` cleanup | 10 min |
| Q9 AI suggest | Async UI, AI safety basics | 15 min |

---

## Story 1: Capture an Inspiration from a URL

### User Story
> **As a** designer working on a project,
> **I want to** paste a website URL and save it as an inspiration with a screenshot and page metadata,
> **so that** I can build a visual reference board for that project.

### Acceptance Criteria
1. On `/projects/:id`, there is an "Add inspiration" form with a URL input and a submit button.
2. The URL is validated. Invalid input shows an inline error (`role="alert"`) and makes no network call. Bare domains (`stripe.com`) are accepted.
3. On submit, the app fetches **metadata** (`getMetadata`) and the **screenshot** (`getScreenshot`) **in parallel**.
4. While the request is pending, the button is disabled and shows "Capturing..."; the user can't double-submit.
5. On success, the inspiration is saved to IndexedDB and appears at the top of the project's inspiration grid without a full reload.
6. Each card shows the screenshot thumbnail, title (fallback: URL), favicon, and a link that opens the site in a new tab (`rel="noopener noreferrer"`).
7. **Screenshots survive a page refresh.**
8. If the metadata call fails but the screenshot call succeeds (or the other way round), the inspiration is still saved with whatever data came back, and the user sees a non-blocking warning. If both calls fail, nothing is saved and an error is shown.
9. Inspirations are loaded with `getInspirationsByProject(projectId)`, which uses the index.

### Design Discussion (say these out loud)
- **Source of truth:** Use the `inspirations` store plus the `by-project` index as canonical. Stop writing to `Project.inspirations`, or derive it on read. Updating a nested array inside the project record on every inspiration write causes write contention and duplicate data.
- **Screenshot persistence:** An object URL is a session-scoped pointer. Options:
  - (a) Store the `Blob` in IndexedDB. IndexedDB supports Blobs natively. Create the object URL at render time and **revoke it on unmount**. *Recommended.*
  - (b) Convert to a base64 data URL. This is about 33% larger, but simple to store.
  - (c) Store only the remote screenshotof.com URL. Smallest, but depends on a third party and doesn't work offline, which breaks the app's offline-first promise.
- **Schema change:** Adding a `screenshotBlob` field doesn't require a new index, so no version bump is strictly needed. If you add an index (for example `by-createdAt`), bump `DB_VERSION` to 2 and make `upgrade(db, oldVersion, newVersion, tx)` handle migrations step by step (`if (oldVersion < 2) { ... }`).
- **Parallel fetch and partial failure:** Use `Promise.allSettled([getMetadata(url), getScreenshot(url)])`, not `Promise.all`, so one failure doesn't discard the other result.
- **Race and unmount safety:** Use an `AbortController` for the fetches (add a `signal` param to `api.js`) and an "is mounted / cancelled" guard on the state updates.
- **Separation of concerns:** Put the orchestration (validate → fetch both → build record → persist) in a service or hook, e.g. `captureInspiration(projectId, url)` or `useCaptureInspiration`. Keep the component presentational.
- **Security:** Normalize the URL with the `URL` constructor, allow only `http:` and `https:`, and never render user input as HTML. Use `rel="noopener noreferrer"` on external links.

### Implementation Steps
1. **Fix the groundwork first** (small, separate commit):
   - Memoize `getDB()`.
   - Fix the `useEffect` cancellation bug in `ProjectDetail.jsx`.
2. **URL utility** in [stringUtils.ts](../src/utils/stringUtils.ts): `normalizeUrl(input): string | null`. Trim the input, prepend `https://` if there's no scheme, parse with `new URL()`, reject non-http(s) schemes, and return `null` when invalid. Unit test it first (TDD).
3. **Model:** Add `screenshotBlob?: Blob` to `Inspiration` in [schema.ts](../src/models/schema.ts). Keep `screenshot_uri` for backward compatibility (the remote URL) and document it.
4. **API layer:** Add an optional `{ signal }` argument to `getScreenshot` and `getMetadata`. Add a `getScreenshotBlob` variant that returns the `Blob` rather than an object URL, or refactor `getScreenshot` to return the blob and let callers create the URL.
5. **Service:** `captureInspiration(projectId, rawUrl, { signal })` in [inspiration.ts](../src/services/inspiration.ts):
   - `normalizeUrl`, then throw a typed validation error if the URL is invalid
   - `Promise.allSettled` for metadata and the screenshot blob
   - If both calls were rejected, throw. Otherwise build a fallback `WebsiteMetadata` (`{ url, title: null, ... }`).
   - `createInspiration({ projectId, websiteMetadata, screenshotBlob, screenshot_uri, notes: '' })`
   - Return `{ inspiration, warnings: [] }`
6. **Hook:** `useProjectInspirations(projectId)` in `src/hooks/` returns `{ inspirations, status, add, remove }`. It loads with `getInspirationsByProject` and sorts by `createdAt` desc.
7. **Components:**
   - `AddInspirationForm.jsx`: controlled input, inline validation, disabled while pending, `aria-invalid` / `aria-describedby` (match the patterns in `UpdateProject.jsx`).
   - `InspirationCard.jsx`: builds the object URL from `screenshotBlob` in `useEffect` and **revokes it in cleanup**. Lazy-load images (`loading="lazy"`), set `alt` to the title, and show a placeholder when there's no screenshot.
   - `InspirationGrid.jsx`: responsive Tailwind grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
8. **Wire into `ProjectDetail.jsx`:** Replace the current `project.inspirations` list with the hook-driven grid.
9. **Clean up:** Remove the unused state in `Projects.jsx`.

### Tests (Jest + RTL; mock `../services/inspiration` and `../utils/api`)
- `normalizeUrl`: `stripe.com` → `https://stripe.com/`; `javascript:alert(1)` → `null`; empty → `null`; `  https://x.com  ` → trimmed.
- `captureInspiration`: both calls succeed; only metadata fails (still saves, returns a warning); both fail (throws, `createInspiration` not called).
- `AddInspirationForm`: an invalid URL shows the alert and doesn't call the service; the button is disabled while pending; the input clears on success.
- `InspirationCard`: `URL.revokeObjectURL` is called on unmount (mock `URL.createObjectURL` / `revokeObjectURL` in jsdom).
- `ProjectDetail`: the new inspiration appears in the grid after submit.

### Stretch / Follow-ups the Interviewer May Ask
- *"Screenshots are 500 KB each. What happens at 1,000 inspirations?"* → Generate thumbnails on a canvas or with `createImageBitmap` and store the full image separately. Use `navigator.storage.estimate()` and `navigator.storage.persist()`, and handle `QuotaExceededError`.
- *"How would you prevent duplicate URLs in a project?"* → Add a compound index `[projectId, websiteMetadata.urlResolved]` (DB v2) and check it before inserting.
- *"Capture takes 8 s. How do you improve the UX?"* → Optimistically insert a skeleton card with a `pending` status and reconcile when the call returns. Allow cancel through the `AbortController`.
- *"How would this change with a real backend?"* → Move to TanStack Query (cache keys `['inspirations', projectId]`, `useMutation` with optimistic updates). The service layer stays the same, so only the hook changes.

---

## Story 2: Curate Inspirations (Edit Notes, Delete with Undo, Safe Project Deletion)

### User Story
> **As a** designer curating a reference board,
> **I want to** add notes to an inspiration, remove inspirations I no longer need (with a chance to undo), and delete a whole project without leaving data behind,
> **so that** my boards stay clean and I don't lose work by accident.

### Acceptance Criteria
**Notes**
1. Each inspiration card has an editable "Notes" field. Clicking "Edit" (or the notes area) switches it to a `<textarea>`.
2. Notes **autosave** after 600 ms with no typing (debounced) and also save on blur. A small status shows "Saving..." → "Saved" → "Couldn't save. Retry".
3. Notes are limited to 1,000 characters, with a live counter. `Esc` cancels the edit and reverts the text. `Cmd/Ctrl+Enter` saves.
4. `updatedAt` on the inspiration changes after a save.

**Delete with undo**
5. Each card has a "Remove" button. Clicking it removes the card from the UI **immediately** (optimistic) and shows a toast: "Inspiration removed. Undo" for 5 s.
6. Clicking "Undo" restores the card in its original position. If the toast expires, the delete is committed to IndexedDB.
7. If the user navigates away before the toast expires, the delete is still committed (no lost intent).

**Project deletion**
8. "Delete Project" opens a confirmation dialog (accessible: focus trap, `Esc` closes, focus returns to the trigger). The dialog shows how many inspirations will be deleted.
9. Deleting a project also deletes **all** of its inspirations **atomically**: either everything is deleted or nothing is.

### Design Discussion
- **Optimistic UI vs. a deferred commit for undo.** Two models:
  - (a) Delete from the DB immediately and re-insert on undo. Simple, but the re-insert can fail, and identity and timestamps need care.
  - (b) **Deferred commit:** remove from UI state, schedule the DB delete for when the toast expires, and cancel the timer on undo. *Recommended.* It's simpler to reason about, and undo can't fail. You must flush pending deletes on unmount and on `beforeunload`/`pagehide`.
- **Debounced autosave pitfalls:**
  - Out-of-order writes. If save #1 resolves after save #2, the stale text wins. Mitigate with a monotonically increasing request id, or serialize saves with "latest wins".
  - Flush the pending debounce on blur and unmount, or the last edit is lost.
  - Don't let the server response overwrite text the user is still typing.
- **Atomic cascade delete:** Use `db.transaction(['projects', 'inspirations'], 'readwrite')`. Iterate `tx.objectStore('inspirations').index('by-project').openKeyCursor(projectId)` and delete each key, delete the project, then `await tx.done`. An IndexedDB transaction rolls back on error. Mention that idb transactions **auto-commit when the event loop goes idle**, so don't `await` non-IDB work (fetch, timers) inside the transaction.
- **Shared toast/notification system:** Build a small `ToastProvider` (Context) with a `useToast()` hook rather than one-off state. Render toasts in an `aria-live="polite"` region.
- **Reusable dialog:** Use a native `<dialog>` with `showModal()`, which gives a focus trap and `Esc` handling, or a small `ConfirmDialog` component. Reusable beats ad hoc.

### Implementation Steps
1. **Service: atomic cascade delete.** Add `deleteProjectCascade(id)`, or fix `deleteProject` in place, in [project.ts](../src/services/project.ts) using a multi-store transaction. Also add `countInspirationsByProject(projectId)` with `index.count(projectId)` for the confirmation dialog.
2. **Utility: `useDebouncedCallback(fn, ms)`** hook that exposes `flush()` and `cancel()`. Unit test it with Jest fake timers.
3. **`InspirationNotes.jsx`:** view/edit modes, controlled textarea, counter, keyboard shortcuts, save status. Calls `updateInspiration(id, { notes })` through the debounced callback, flushes on blur and unmount, and uses a request-sequence guard.
4. **`ToastProvider` + `useToast`** in `src/components/Toast/`. API: `showToast({ message, action: { label, onClick }, duration })`. Mount it in `AppLayout`.
5. **Deferred delete** in `useProjectInspirations` (from Story 1):
   - `remove(id)`: snapshot the item and its index, remove it from state, start a 5 s timer that calls `deleteInspiration(id)`, and show the toast with Undo.
   - `undo(id)`: clear the timer and splice the item back in at its original index.
   - Keep pending timers in a `useRef(Map)`. On unmount and `pagehide`, commit every pending delete.
6. **`ConfirmDialog.jsx`** built on `<dialog>`. Use it in `ProjectDetail` for "Delete Project", show the inspiration count, and call the cascade delete. Replace `alert()` with an inline error or toast.
7. **Tests** (below), then remove `Project.inspirations` usage if it wasn't already removed in Story 1.

### Tests
- `deleteProjectCascade`: seed a project and 3 inspirations (plus 1 belonging to another project). After the delete, the project is gone, its 3 inspirations are gone, and the other project's inspiration is untouched. Use `fake-indexeddb` in Jest (`import 'fake-indexeddb/auto'` in `setupTests.ts`).
- `useDebouncedCallback`: with fake timers, the callback fires once after 600 ms; `flush()` fires it immediately; `cancel()` prevents it.
- `InspirationNotes`: typing triggers one `updateInspiration` call after the debounce; `Esc` reverts; blur flushes; the counter blocks input past 1,000 characters.
- Delete and undo: after clicking Remove, the card is gone and the toast is visible. Undo restores the card and `deleteInspiration` is never called. Advancing 5 s calls `deleteInspiration` once. Unmounting before 5 s still calls it.
- `ConfirmDialog`: `Esc` closes it, Cancel doesn't delete, Confirm calls the cascade and navigates to `/projects`.

### Stretch / Follow-ups
- *"Two tabs are open on the same project. One deletes an inspiration. How does the other tab find out?"* → Use a `BroadcastChannel('page-prism')` to publish change events, and refetch or patch state on receipt. Handle the IndexedDB `versionchange` event for schema upgrades across tabs.
- *"How would you add tags and filter by tag?"* → Add a `tags: string[]` field and a `multiEntry` index `by-tag` (DB v2 migration).
- *"How would you make Undo work across a page reload?"* → Soft delete: set `deletedAt`, filter it out on read, and run a garbage-collection sweep later.

---

## Story 3 (Small, AI Workflow): AI-Suggested Notes and Tags for an Inspiration

### User Story
> **As a** designer capturing an inspiration,
> **I want** the app to suggest a short design-focused summary and a few tags (for example "minimal", "dark-mode", "pricing-page") based on the page metadata,
> **so that** I can organize references faster without typing everything by hand.

### Acceptance Criteria
1. Each inspiration card has a "✨ Suggest notes" button.
2. Clicking it sends the inspiration's `websiteMetadata` (title, description, ogTitle, ogDescription, URL) to an LLM. It does **not** send the screenshot in v1.
3. The response is **structured**: `{ summary: string (≤ 280 chars), tags: string[] (3–6, lowercase, kebab-case) }`, validated before use.
4. The suggestion appears as a **preview** with "Accept", "Edit", and "Discard". Nothing overwrites the user's existing notes without explicit acceptance.
5. A loading state shows while waiting. On error or timeout (10 s), the user sees a friendly message and a Retry button.
6. **No API key in the browser bundle.**

### Design Discussion
- **Where does the call happen?** This is a client-only Vite app, and putting `ANTHROPIC_API_KEY` in `import.meta.env.VITE_*` would ship the key to every user. Options:
  - (a) A tiny serverless proxy (Cloudflare Worker, Vercel function, or a Vite dev-server middleware for the demo) that holds the key and forwards requests. *Recommended.*
  - (b) Bring-your-own-key, stored in `localStorage`. Acceptable only for a personal tool, and the risk should be stated.
- **Model choice:** A small, fast model is enough for short summaries and tags. Use `claude-haiku-5-5` for cost and latency, and move up to `claude-sonnet-5-5` if quality isn't good enough. Keep the model id in config, not hard-coded across files.
- **Structured output:** Define a tool or JSON schema and force the model to call it (`tool_choice`), then **validate on the client too** (zod or a hand-written guard). Never trust LLM output blindly: trim, cap the lengths, lowercase the tags, and remove duplicates.
- **Prompt injection:** Page metadata is untrusted third-party text. Put it in a clearly delimited data block, tell the model to treat it as data only, and render the output as plain text (never `dangerouslySetInnerHTML`).
- **Privacy:** Only URL and metadata leave the device, so the offline-first app now makes one opt-in network call. Say this in the UI.
- **Cost and abuse controls:** Debounce or disable the button while a request is in flight, cache results per inspiration id (stored in IndexedDB as `aiSuggestion`), and rate-limit at the proxy.
- **Abstraction:** Use an `aiService.suggestNotes(metadata)` interface so the provider can be swapped or mocked in tests.

### Implementation Steps
1. **Proxy endpoint** `POST /api/suggest`: accepts `{ metadata }`, calls the Anthropic Messages API with a system prompt and a forced tool call (`suggest_inspiration_notes` with an input schema for `summary` and `tags`), and returns the tool input JSON. Set the timeout and max_tokens low (about 300).
2. **Client service** `src/services/ai.ts`: `suggestNotes(metadata, { signal })` → `fetch('/api/suggest')` → validate the shape → return `{ summary, tags }`. Throw typed errors (`TimeoutError`, `InvalidResponseError`).
3. **Model:** Add optional `tags?: string[]` and `aiSuggestion?: { summary, tags, model, createdAt }` to `Inspiration`.
4. **UI:** `SuggestNotesButton.jsx` and a preview panel inside `InspirationCard`. Accept → `updateInspiration(id, { notes: summary, tags })`. Reuse the save-status pattern from Story 2.
5. **Tests:** Mock `suggestNotes`. Cover: loading state; preview renders; Accept persists; Discard leaves notes unchanged; malformed response shows an error; a model response containing `<script>` renders as text.

### Alternate Reading: AI in the Developer Workflow
If the interviewer means *"show how you use AI tools while you build"*, be ready to show:
- **CLAUDE.md** already exists at the repo root. Explain how it gives an AI agent project context (commands, architecture, conventions), and propose adding the new patterns (Blob storage, cascade delete, toast system).
- **Spec → plan → incremental implementation:** Ask Claude Code to draft the acceptance criteria and plan first, review them, then implement one slice at a time with tests.
- **A custom slash command or skill**, e.g. `.claude/commands/new-component.md`, that scaffolds `Component.jsx`, `Component.module.css`, and `Component.test.jsx` following repo conventions.
- **A hook** in `.claude/settings.json` that runs `npm run lint` and `npm test -- --findRelatedTests <file>` after each edit, so AI-generated code is checked automatically.
- **Human in the loop:** Review every AI diff, have the AI write tests *before* the implementation, and never let it commit or push without review. Use `/code-review` and `/security-review` before opening a PR.

---

## Suggested Time Plan (about 60–90 min session)

| Phase | Time | What to do |
|-------|------|------------|
| Clarify and recon | 5–10 min | Restate the story, ask questions, point out codebase issues from Part 0 |
| Design | 5–10 min | Data model, component tree, trade-offs (sketch them) |
| Story 1 thin slice | 20–25 min | URL → save → render (no blob persistence yet), then add Blob persistence |
| Story 2 thin slice | 15–20 min | Cascade delete (transaction) → notes autosave → undo |
| Story 3 | 10 min | Service interface + mocked UI flow; talk through the proxy and security |
| Wrap-up | 5 min | What you'd do next, risks, testing gaps, rollout |

## Clarifying Questions to Ask Up Front
1. Is the screenshotof.com API rate-limited, or does it have CORS restrictions I should plan for?
2. Should screenshots work fully offline after capture (which means storing the Blob)?
3. Can I change the IndexedDB schema and bump the version? Are there existing users with data to migrate?
4. Is `Project.inspirations` relied on anywhere else, or can I make the `inspirations` store canonical?
5. For undo: is a 5 s window acceptable? Does undo need to survive a reload?
6. For AI: is there an existing backend or proxy, and are there data or privacy constraints on sending URLs to a third-party LLM?
