# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Page Prism is a design inspiration management tool built with React. It enables users to create projects, capture website screenshots as inspirations, organize them, and manage design references. The app uses IndexedDB for local persistence, providing an offline-first experience.

## Development Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Compile TypeScript and build for production
npm run lint      # Run ESLint on the codebase
npm run preview   # Preview production build locally
npm test          # Run Jest test suite
```

Run a single test file:
```bash
npm test -- src/components/Button.test.jsx
```

## Architecture

### Tech Stack
- **React 18** with TypeScript for type-safe components
- **Vite** as the build tool and dev server with SWC for faster compilation
- **React Router v6** for client-side routing
- **IndexedDB** (via idb library) for local data persistence
- **CSS Modules** paired with **Tailwind CSS** for styling
- **Jest** with jsdom for testing React components

### Data Model
The app manages two core entities via IndexedDB:

**Project**: Contains `id`, `name`, `description`, `createdAt`, `updatedAt`, and array of `inspirations`

**Inspiration**: Belongs to a project, contains `id`, `projectId`, `websiteMetadata` (parsed from external APIs), `screenshot_uri`, `notes`, `createdAt`, `updatedAt`. The `inspirations` store has an index on `projectId` for efficient project-scoped queries.

### Routing Structure
```
/                    → Dashboard (overview page)
/projects            → Projects list (all projects)
/projects/:id        → Project detail (single project with inspirations)
```

All routes are nested under the main App layout which provides the Navbar and Header components.

### Service Layer
Two service files handle data operations with IndexedDB:

**src/services/project.ts**: CRUD operations for projects (`createProject`, `getProject`, `getAllProjects`, `updateProject`, `deleteProject`). Each function accepts an optional `latencyMs` parameter to simulate network delays for testing.

**src/services/inspiration.ts**: CRUD operations for inspirations. Special function `getInspirationsByProject` queries inspirations by projectId using the IndexedDB index.

### Component Organization
- **pages/**: Route-level components (Dashboard, Projects, ProjectDetail)
- **components/**: Reusable UI components (Button, Header, Navbar, etc.) with co-located CSS Modules
- **layouts/**: Layout wrapper (AppLayout) that provides consistent structure
- **hooks/**: Custom hooks like `usePageTitle` for derived state
- **utils/**: Utility functions (API helpers, IndexedDB setup, mock latency, string utilities)
- **models/**: TypeScript interfaces for type safety (Project, Inspiration, WebsiteMetadata)

### Styling Approach
- CSS Modules for component-scoped styling to prevent conflicts
- Tailwind CSS configured in `tailwind.config.js` for utility classes
- PostCSS for processing Tailwind directives
- ESLint configured to catch common React issues and enforce React Hooks rules

### Database Setup
IndexedDB is initialized with two object stores:
- `projects` store (key: id)
- `inspirations` store (key: id, with index on projectId for efficient lookups)

The database initializes on first access via `getDB()` in utils/indexedDB.ts.

## Testing Strategy

Tests use Jest with `jsdom` environment for DOM simulation. CSS Modules are mocked via `identity-obj-proxy` to avoid errors during test runs. TypeScript and JSX/TSX files are transpiled via Babel presets for Jest.

Test files are co-located with source files (e.g., `Button.test.jsx` next to `Button.jsx`).

## Code Patterns & Conventions

- **Functional components** with hooks; no class components
- **TypeScript** for type safety in services and models; `.jsx` for presentational components
- **React Router** params accessed via `useParams()` hook
- **Mock latency** in services for simulating real network conditions during development
- **Component composition** over inheritance; use wrapper components or custom hooks for shared logic

## Configuration Notes

- **Node version**: 18.20.2 (specified in .nvmrc, enforced via nvm)
- **TypeScript**: Separate configs for app (tsconfig.app.json) and build tools (tsconfig.node.json)
- **Prettier** formatting configured in .prettierrc
- **Vite** uses React plugin with SWC for speed
