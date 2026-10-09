# Frontend Interview Questions - Page Prism Repo

## Context
This document provides a curated set of frontend interview questions (basic to intermediate) based on the Page Prism repository. Each question includes solution steps without modifying the actual codebase.

---

## BASIC LEVEL QUESTIONS

### Q1: Component Props and State
**Question**: "In the Button component (src/components/Button.jsx), how would you pass different styling variants (primary, secondary, danger) and handle them? Walk me through your approach."

**Solution Steps**:
1. Open src/components/Button.jsx and Button.module.css
2. Understand current Button structure (read the component)
3. Identify how CSS Module classes are organized in Button.module.css
4. Design approach:
   - Add a `variant` prop to Button component (type: string)
   - Use clsx library (already imported in the project) to combine base button styles with variant-specific styles
   - Create variant classes in Button.module.css (e.g., `buttonPrimary`, `buttonSecondary`, `buttonDanger`)
   - Apply conditional className based on variant prop
5. Plan the implementation (don't code):
   - Import clsx at top of Button.jsx
   - Add variant prop with default value
   - Update className attribute to use clsx with base style + variant class
   - Add corresponding CSS rules in Button.module.css

**Concepts Tested**: Component props, conditional styling, CSS Modules, clsx utility

---

### Q2: React Router Navigation
**Question**: "How does routing work in this app? Explain the routes and how you'd navigate from Projects page to a specific project detail page."

**Solution Steps**:
1. Read src/routes.jsx to understand routing structure
2. Identify three routes: `/`, `/projects`, `/projects/:id`
3. Understand flow:
   - Projects.jsx displays list of all projects
   - Each project should link to `/projects/:projectId`
   - ProjectDetail.jsx receives :id param via useParams hook
4. Explain approach:
   - Use React Router's Link component to navigate between routes
   - Use useParams() hook in ProjectDetail to get the :id parameter
   - Use that id to fetch project data via getProject service
5. Implementation plan:
   - In Projects.jsx, import Link from react-router-dom
   - Wrap project items in Link to="/projects/{projectId}"
   - In ProjectDetail.jsx, use useParams to extract id
   - Call getProject(id) in useEffect to load project data

**Concepts Tested**: React Router setup, useParams hook, Link component, route parameters

---

### Q3: Data Flow with Services
**Question**: "Explain how data flows from the UI to the database in this app. Use creating a new project as an example."

**Solution Steps**:
1. Trace data flow:
   - User clicks "Create Project" button in Projects.jsx
   - Form collects name and description
   - Handler calls createProject service function
   - Service receives project data, adds auto-generated id, createdAt, updatedAt
   - Service calls IndexedDB to persist data
   - Service returns created project
   - Component updates state to reflect new project
2. Explain each layer:
   - **UI Layer** (Projects.jsx): Collects input, calls service
   - **Service Layer** (src/services/project.ts): Business logic, calls database
   - **Data Layer** (src/utils/indexedDB.ts): Direct IndexedDB operations
3. Highlight key files:
   - src/services/project.ts (createProject function)
   - src/utils/indexedDB.ts (getDB function)
   - src/models/schema.ts (Project type)

**Concepts Tested**: Data flow, service layer pattern, async operations, TypeScript types

---

### Q4: CSS Modules vs Global Styles
**Question**: "This project uses CSS Modules with Tailwind. Why use both? What are the trade-offs?"

**Solution Steps**:
1. Examine Button.module.css and Button.jsx
2. Check tailwind.config.js and how Tailwind is included
3. Understand dual approach:
   - **CSS Modules** (Button.module.css): Component-scoped styles to prevent naming conflicts
   - **Tailwind** (utility classes): Quick, consistent styling via class names
4. Explain benefits:
   - CSS Modules prevent style leakage between components
   - Tailwind provides rapid development with utility classes
   - Together: Structured component styles + quick utility fixes
5. Trade-offs:
   - Dual-system can be confusing for new developers
   - Requires discipline to use both appropriately
   - Alternative: Use only one system (pure Tailwind or pure CSS Modules)

**Concepts Tested**: CSS architecture, component isolation, styling strategies

---

### Q5: Hook Usage - usePageTitle
**Question**: "Look at the usePageTitle hook in src/hooks/usePageTitle.jsx. What does it do and why would you use it?"

**Solution Steps**:
1. Read src/hooks/usePageTitle.jsx
2. Understand it:
   - Takes current route/path
   - Maps it to a display title
   - Returns title string
3. Explain use case:
   - Header component needs to display different titles on different pages
   - Without hook: each page would manually set title or pass it as prop
   - With hook: centralized, reusable logic
4. How it's used:
   - Header.jsx calls usePageTitle to get current page title
   - No prop drilling needed
5. Implementation concept:
   - Uses useLocation from react-router to get current path
   - Contains switch/case logic to map paths to titles
   - Returns appropriate title

**Concepts Tested**: Custom hooks, hook patterns, separation of concerns, reusability

---

## INTERMEDIATE LEVEL QUESTIONS

### Q6: Async Data Fetching with Mock Latency
**Question**: "Services in this project have a latencyMs parameter for mocking network delays. How would you implement data fetching with this mock latency, and why is this useful for development?"

**Solution Steps**:
1. Open src/services/project.ts and src/utils/mockLatency.js
2. Study mockLatency function:
   - Takes optional milliseconds parameter
   - Returns a Promise that resolves after that delay
   - Simulates network latency
3. See how services use it:
   - Every service function calls `await mockLatency(latencyMs)` at start
   - Allows testing loading states and timeout scenarios without real network
4. Approach to implement:
   - Create async function that needs latency simulation
   - Call mockLatency(300) to simulate 300ms network delay
   - Proceed with actual logic
5. Benefits:
   - Test loading spinners
   - Debug race conditions
   - Understand performance impact
   - Works without backend server
6. Implementation in component:
   - Call service function with latencyMs: `await createProject(project, 500)`
   - Show loading state while promise is pending
   - Handle response or error

**Concepts Tested**: Async/await, Promise handling, mock latency, testing strategies

---

### Q7: IndexedDB Operations and Querying
**Question**: "Explain how IndexedDB is set up in this project. How does getInspirationsByProject use indexes for efficient querying?"

**Solution Steps**:
1. Read src/utils/indexedDB.ts
2. Understand DB schema:
   - Two object stores: 'projects' and 'inspirations'
   - 'inspirations' store has index on 'projectId' field
3. Examine getInspirationsByProject in src/services/inspiration.ts:
   - Uses `db.getAllFromIndex('inspirations', 'by-project', projectId)`
   - This queries using the index instead of scanning all records
4. Explain benefits:
   - Without index: O(n) scan of all inspirations
   - With index: O(log n) lookup by projectId
   - Massive performance improvement with large datasets
5. Diagram the structure:
   ```
   Database: PagePrismDB (v1)
   ├── Store: projects (key: id)
   └── Store: inspirations (key: id)
       └── Index: by-project (indexes on projectId field)
   ```
6. Implementation pattern:
   - Define indexes in DBSchema interface
   - Create indexes in upgrade callback
   - Use getAllFromIndex to query by index
   - Alternative: getAllFromIndex vs getAll performance difference

**Concepts Tested**: IndexedDB, database design, indexes, query optimization

---

### Q8: TypeScript Type Safety
**Question**: "This project uses TypeScript. In src/services/project.ts, the createProject function uses `Omit<Project, ...>`. Explain why and how this improves type safety."

**Solution Steps**:
1. Open src/models/schema.ts and src/services/project.ts
2. Understand Project type:
   - Has fields: id, name, description, createdAt, updatedAt, inspirations
3. Study createProject signature:
   ```
   createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, ...)
   ```
4. Explain the pattern:
   - `Omit<Project, ...>` removes auto-generated fields
   - Forces caller to provide only user-input fields (name, description)
   - Prevents accidental overriding of auto-generated fields
   - Type system ensures completeness
5. Benefits:
   - Compiler catches missing fields
   - Prevents bugs from forgotten fields
   - Self-documenting: clear which fields are required
6. Alternative approaches:
   - Create separate ProjectInput type (more verbose)
   - Use Partial types (loses type safety)
   - Use Omit (recommended, flexible)

**Concepts Tested**: TypeScript generics, type utilities, type safety patterns

---

### Q9: React Component Lifecycle and useEffect
**Question**: "How would you fetch a project's data when the component mounts and when the URL parameter changes? Walk through the dependency array."

**Solution Steps**:
1. Context: ProjectDetail component needs project data
2. Read ProjectDetail.jsx
3. Understand requirements:
   - Fetch when component mounts
   - Re-fetch if the :id param changes (user navigates to different project)
4. Implementation approach:
   - Use useEffect hook
   - Extract id via useParams()
   - Dependency array should include [id]
5. Code structure (conceptual):
   ```
   const { id } = useParams()
   const [project, setProject] = useState(null)
   
   useEffect(() => {
     const loadProject = async () => {
       const data = await getProject(id)
       setProject(data)
     }
     loadProject()
   }, [id])  // Re-run if id changes
   ```
6. Explanation:
   - Empty array [] → runs once on mount
   - [id] → runs on mount AND whenever id changes
   - This ensures fresh data when navigating between projects
7. Alternative patterns:
   - Multiple useEffects for different concerns
   - Custom hook to encapsulate fetch logic
   - SWR or React Query (production alternative)

**Concepts Tested**: useEffect hook, dependency arrays, lifecycle management, async data loading

---

### Q10: Error Handling in Async Operations
**Question**: "How should you handle errors when fetching project data? Create a strategy for displaying error messages to users."

**Solution Steps**:
1. Current challenge: getProject might return undefined or throw errors
2. Error scenarios:
   - Project doesn't exist (not found)
   - Database is corrupted
   - Network timeout (in real backend)
3. Implementation strategy:
   - Add error state to component: `const [error, setError] = useState(null)`
   - Wrap service call in try-catch
   - Store error message in state
   - Render error UI if error exists
4. Code pattern (conceptual):
   ```
   useEffect(() => {
     const loadProject = async () => {
       try {
         const data = await getProject(id)
         if (!data) {
           setError('Project not found')
           return
         }
         setProject(data)
         setError(null)
       } catch (err) {
         setError('Failed to load project: ' + err.message)
       }
     }
     loadProject()
   }, [id])
   ```
5. UI strategy:
   - Show loading state while fetching
   - Show error message if error exists
   - Show project data if successful
   - Provide retry button
6. User experience considerations:
   - Clear error messages
   - Don't lose user's place
   - Offer recovery options

**Concepts Tested**: Error handling, try-catch patterns, state management, UX design

---

### Q11: Testing React Components with Jest
**Question**: "How would you test the Button component? Write test cases for different variants."

**Solution Steps**:
1. Examine src/components/Button.test.jsx (existing test file)
2. Understand Jest + React Testing Library setup:
   - jest.config.mjs defines environment as jsdom
   - setupTests.ts initializes test utilities
   - CSS Modules mocked via identity-obj-proxy
3. Test structure:
   ```
   describe('Button Component', () => {
     it('renders with default variant', () => { ... })
     it('renders with primary variant', () => { ... })
     it('renders with secondary variant', () => { ... })
     it('calls onClick handler when clicked', () => { ... })
   })
   ```
4. Testing approach:
   - Import render from @testing-library/react
   - Render component with props
   - Query elements using screen.getByRole or screen.getByText
   - Assert expected behavior
5. Example test pattern:
   - Test rendering with different props
   - Test disabled state
   - Test click handler
   - Test className application
6. Run tests:
   - `npm test` runs all tests
   - `npm test Button.test.jsx` runs single file
   - Watch mode: `npm test -- --watch`

**Concepts Tested**: Jest setup, React Testing Library, component testing, assertions

---

### Q12: Component Composition and Props
**Question**: "The Navbar component has multiple sub-components (NavbarDesktop, NavbarMobile). How does component composition work here? Why split into separate components?"

**Solution Steps**:
1. Examine these files:
   - src/components/Navbar.jsx
   - src/components/NavbarDesktop.jsx
   - src/components/NavbarMobile.jsx
2. Understand the pattern:
   - Navbar is main component
   - NavbarDesktop and NavbarMobile are conditional renders
   - Decision made based on screen size (media query or window width)
3. Benefits of this approach:
   - Separate concerns: each component has one responsibility
   - Easier to test each variant independently
   - Cleaner code than one monolithic component with multiple branches
   - Allows independent styling for each variant
4. Implementation pattern (conceptual):
   ```
   const Navbar = () => {
     return (
       <>
         <NavbarDesktop />
         <NavbarMobile />
       </>
     )
   }
   ```
   - CSS handles which one shows via media queries
   - Or use window.matchMedia to conditionally render
5. Props flow:
   - Parent passes down needed data via props
   - Each sub-component only accepts props it needs
   - Keeps prop interface clean and explicit
6. Alternatives:
   - Render props pattern
   - Compound components pattern
   - Higher-order components

**Concepts Tested**: Component composition, separation of concerns, responsive design, props patterns

---

### Q13: State Management Across Components
**Question**: "If you needed to share the current project data across multiple pages (Projects, ProjectDetail, Dashboard), what strategies would you use?"

**Solution Steps**:
1. Current architecture:
   - Each page fetches its own data
   - No global state management
   - Data isolated to component
2. Strategies for sharing state:

   **Strategy 1: Lift State Up**
   - Move state to App.jsx (common parent)
   - Pass via props to child pages
   - Pros: Simple, no external dependencies
   - Cons: Prop drilling, not scalable

   **Strategy 2: Context API**
   - Create ProjectContext
   - Wrap app with ProjectProvider
   - Use useContext hook in any component
   - Pros: Avoids prop drilling, built-in
   - Cons: Can cause unnecessary re-renders

   **Strategy 3: Custom Hook + Local Storage**
   - Create useProjects hook
   - Store in localStorage
   - Persist across sessions
   - Pros: Offline support, persists
   - Cons: More complex implementation

   **Strategy 4: State Management Library**
   - Use Redux, Zustand, or similar
   - Centralized store
   - Pros: Powerful, debuggable
   - Cons: Overkill for simple app

3. Decision for this project:
   - Current IndexedDB already provides persistence
   - Recommend Context API for medium complexity
   - Could add Redux if app grows
4. Implementation outline:
   - Create context file with reducer
   - Create provider component
   - Use useContext in pages
   - Handle loading/error states

**Concepts Tested**: State management patterns, scalability thinking, architecture decisions

---

### Q14: Performance Optimization
**Question**: "This app uses CSS Modules and Tailwind. How would you identify performance issues related to CSS? What metrics would you check?"

**Solution Steps**:
1. Performance metrics to check:
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - First Input Delay (FID)
   - CSS bundle size
   - Unused CSS
2. Tools to use:
   - Chrome DevTools Lighthouse
   - Chrome DevTools Coverage tab
   - WebPageTest
   - Bundlesize analyzers
3. Common CSS issues:
   - Unused Tailwind classes (include only needed)
   - Inefficient selectors in CSS Modules
   - Missing media queries causing mobile issues
   - Large images or unoptimized assets
4. Optimization strategies:
   - Tailwind PurgeCSS: Remove unused classes
   - Code split CSS per route
   - Lazy load non-critical CSS
   - Minify CSS in production
   - Use CSS-in-JS if dynamic styling needed
5. Vite specific:
   - Vite automatically minifies in build
   - Check vite.config.ts for optimization settings
   - Use npm run build && npm run preview
   - Analyze bundle with vite-plugin-visualizer
6. Testing approach:
   - Run Lighthouse audit
   - Compare before/after metrics
   - Monitor Core Web Vitals

**Concepts Tested**: Performance optimization, metrics, tools, CSS best practices

---

### Q15: Debugging and Problem-Solving Scenario
**Question**: "A user reports that when they create a new project, it doesn't appear in the Projects list immediately. Walk me through how you'd debug this."

**Solution Steps**:
1. Problem statement:
   - Create project button works (no error)
   - Project doesn't appear in list
   - Possible causes: state not updated, IndexedDB not saved, query issue
2. Debugging approach:

   **Step 1: Check Console**
   - Open DevTools console
   - Look for JavaScript errors
   - Check for async errors in network tab

   **Step 2: Check Component State**
   - Is projects state updating after creation?
   - Add console.log before/after createProject call
   - Verify state setter is called

   **Step 3: Check Database**
   - Open DevTools → Application → IndexedDB
   - Navigate to PagePrismDB
   - Check if new project exists in 'projects' store
   - If exists in DB but not in UI → state issue
   - If doesn't exist in DB → service issue

   **Step 4: Trace Service Call**
   - Check createProject in src/services/project.ts
   - Verify UUID is generated
   - Verify timestamps are set
   - Check IndexedDB write is awaited

   **Step 5: Check Component Logic**
   - Projects.jsx fetches all projects on mount
   - After creation, does it re-fetch or update local state?
   - Should it refetch or push to array?

3. Root causes and solutions:
   - **Issue**: State not updated after creation
     - Solution: Call getAllProjects again or push to state array
   - **Issue**: Created project not in IndexedDB
     - Solution: Check for exceptions in createProject
   - **Issue**: Projects fetched on mount but not updated
     - Solution: Trigger refetch after creation

4. Testing the fix:
   - Create project → verify appears immediately
   - Refresh page → verify still there (persisted)
   - Check DevTools → verify in IndexedDB
   - Check console → no errors

**Concepts Tested**: Debugging methodology, problem-solving, understanding data flow

---

## ADDITIONAL ADVANCED CONCEPTS (For Deep Dives)

### Q16: Responsive Design Implementation
**Question**: "How is responsive design handled in this project for the Navbar? Explain mobile-first vs desktop-first approach."

**Solution Steps**:
1. Examine responsive implementation:
   - NavbarMobile and NavbarDesktop components
   - CSS Modules with media queries
   - Tailwind breakpoints
2. Understand approach used:
   - Likely CSS-based hiding/showing
   - Check Button.module.css for media query examples
3. Mobile-first pattern:
   - Start with mobile styles as base
   - Use media queries to enhance for larger screens
   - Progressive enhancement
4. Desktop-first pattern:
   - Start with desktop styles
   - Use media queries to reduce for mobile
   - Older approach

---

### Q17: Handling Forms and Validation
**Question**: "How would you create a form for editing project details with validation? What validation would you need?"

**Solution Steps**:
1. Requirements:
   - Text inputs for name and description
   - Validation: non-empty, max length
   - Error messages below fields
   - Submit and cancel buttons
   - Loading state while saving
2. Implementation outline:
   - Use useState for form values
   - Use useState for validation errors
   - onChange handlers for inputs
   - onSubmit handler
   - Validation function before submission
3. Validation checklist:
   - Name: required, min 1 char, max 100 chars
   - Description: optional, max 500 chars
   - Show errors inline
   - Disable submit if invalid
4. Testing approach:
   - Test with empty values
   - Test with max length exceeded
   - Test successful submission
   - Test cancel button

---

### Q18: Accessibility Considerations
**Question**: "How would you ensure the Button component is accessible? What ARIA attributes and keyboard support matter?"

**Solution Steps**:
1. Accessibility checklist for Button:
   - Proper semantic HTML (button element, not div)
   - Keyboard navigation: Tab focus, Enter/Space to activate
   - ARIA labels for icon-only buttons
   - Color contrast ratio > 4.5:1
   - Disabled state should be accessible
2. Implementation:
   - Use native button element (already done likely)
   - Add aria-label for clarity
   - Add aria-disabled for disabled state
   - Ensure focus ring visible
   - Test with keyboard only
3. Testing:
   - Tab through components
   - Use screen readers (NVDA, JAWS)
   - Check color contrast
   - Run axe DevTools

---

## SUMMARY TABLE

| Level | Question | Topic | Key Skills |
|-------|----------|-------|------------|
| Basic | Q1 | Component Props & Styling | React, CSS Modules, clsx |
| Basic | Q2 | React Router | Routing, useParams, Link |
| Basic | Q3 | Data Flow | Services, async, state |
| Basic | Q4 | CSS Architecture | CSS Modules, Tailwind |
| Basic | Q5 | Custom Hooks | usePageTitle, hook patterns |
| Intermediate | Q6 | Mock Latency & Async | Promises, async/await |
| Intermediate | Q7 | IndexedDB & Indexes | Database design, optimization |
| Intermediate | Q8 | TypeScript Utilities | Omit, generics, type safety |
| Intermediate | Q9 | useEffect & Dependencies | Lifecycle, dependencies |
| Intermediate | Q10 | Error Handling | Try-catch, error state |
| Intermediate | Q11 | Testing | Jest, React Testing Library |
| Intermediate | Q12 | Component Composition | Props, composition patterns |
| Intermediate | Q13 | State Management | Context, patterns, scalability |
| Intermediate | Q14 | Performance | Metrics, optimization, tools |
| Intermediate | Q15 | Debugging | Problem-solving methodology |
| Advanced | Q16 | Responsive Design | Media queries, mobile-first |
| Advanced | Q17 | Forms & Validation | Form handling, validation |
| Advanced | Q18 | Accessibility | ARIA, keyboard support, a11y |

