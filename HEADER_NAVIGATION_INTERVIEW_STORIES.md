# Header and Navigation Interview Stories

Small UI changes you can use as frontend interview prompts. Each story is scoped to the existing header and responsive navigation.

## 1. Show the correct accessible name for the mobile menu button

**User story:** As a screen-reader user, I want the mobile menu button to describe its current action so that I know whether it will open or close the menu.

**Acceptance criteria**
- When the menu is closed, the button has an accessible name such as “Open main menu.”
- When the menu is open, its accessible name changes to “Close main menu.”
- The existing menu icons and open/close behavior remain unchanged.

**Likely touchpoints:** `MobileMenuButton.jsx`

**Coding steps**
1. Use the existing `open` prop to choose the button's accessible label.
2. Render “Close main menu” when `open` is true and “Open main menu” otherwise.
3. Keep the existing `DisclosureButton` and icon switching intact, then verify both states with a screen reader or a component test.

## 2. Keep Projects highlighted on project detail pages

**User story:** As a user viewing a project, I want the Projects navigation item to remain highlighted so that I can tell which section I am in.

**Acceptance criteria**
- The Projects item is current on `/projects` and on `/projects/:id` (including the optional project name segment).
- Dashboard is current only on `/`.
- Desktop and mobile navigation show the same current section and expose the appropriate `aria-current` value.

**Likely touchpoints:** `DesktopNavigation.jsx`, `MobileNavigation.jsx`

**Coding steps**
1. Define the active-state check so `/projects` and paths beginning with `/projects/` count as the Projects section, while `/` remains Dashboard only.
2. Apply the same check in both navigation components to select the current and default styles.
3. Preserve `aria-current="page"` for the active item and verify behavior at `/`, `/projects`, and a project detail URL.

## 3. Add a visible keyboard focus style to navigation links

**User story:** As a keyboard user, I want to see which navigation link has focus so that I can move through the app without a mouse.

**Acceptance criteria**
- Desktop and mobile navigation links have a clearly visible focus indicator.
- The indicator is distinguishable from the current-page and hover styles.
- Existing colors and layout remain consistent with the navbar.

**Likely touchpoints:** `DesktopNavigation.module.css`, `MobileNavigation.module.css`

**Coding steps**
1. Add a `:focus-visible` rule to the desktop and mobile link styles.
2. Choose a high-contrast outline or ring that is not confused with the current-page background or hover treatment.
3. Tab through both navigation layouts and confirm the focus indicator is visible and does not change layout.

## 4. Support an optional subtitle in the page header

**User story:** As a user, I want a short description below a page title when useful so that I have context about the page.

**Acceptance criteria**
- `Header` can receive an optional subtitle.
- When no subtitle is provided, the current title-only appearance is preserved.
- When provided, the subtitle appears beneath the title and wraps cleanly on narrow screens.

**Likely touchpoints:** `Header.jsx`, `Header.module.css`, `AppLayout.jsx`

**Coding steps**
1. Add an optional `subtitle` prop to `Header` and render a description element only when it has a value.
2. Add subtitle styling below the title, checking spacing and wrapping at narrow widths.
3. Pass subtitle text from `AppLayout` only if a page-specific source is available; otherwise keep the prop optional and verify existing title-only pages render unchanged.

## 5. Keep long page titles readable on small screens

**User story:** As a mobile user, I want long page titles to fit the header without overflowing so that the page remains easy to read.

**Acceptance criteria**
- A long title wraps within the header container rather than causing horizontal overflow.
- The title remains legible at narrow viewport widths.
- Desktop title styling remains unchanged.

**Likely touchpoints:** `Header.module.css`

**Coding steps**
1. Inspect the title's available width and current typography at the mobile breakpoint.
2. Adjust wrapping-related styles, such as `overflow-wrap`, only as needed to prevent long unbroken titles from overflowing.
3. Check both a normal title and a deliberately long title at narrow and desktop widths.

## 6. Navigate to the dashboard without a full page reload

**User story:** As a user, I want the logo to take me to the dashboard using client-side navigation so that navigation feels consistent with the rest of the app.

**Acceptance criteria**
- Activating the logo navigates to `/` through React Router.
- The logo remains a keyboard-accessible link with a meaningful accessible name.
- Other navigation behavior is unchanged.

**Likely touchpoints:** `Logo.jsx`

**Coding steps**
1. Replace the plain anchor with React Router's `Link` and set its destination to `/`.
2. Give the link an accessible name, using the image's corrected alt text or an `aria-label` if the image is decorative.
3. Activate the logo from a nested route and verify navigation happens without a full document reload.

## 7. Add a navigation item consistently on desktop and mobile

**User story:** As a user, I want a new approved destination to be available in both navigation layouts so that I can reach it regardless of screen size.

**Acceptance criteria**
- The agreed destination and label appear in desktop and mobile navigation.
- Both versions navigate to the same route.
- Current-page styling and `aria-current` work for the new destination.

**Likely touchpoints:** `DesktopNavigation.jsx`, `MobileNavigation.jsx`

**Interviewer follow-up:** Ask how the candidate would avoid the two navigation lists drifting apart if the list grows. Keep the requested implementation limited to the agreed destination.

**Coding steps**
1. Confirm the destination label, route, and expected active-state behavior before editing.
2. Add the item to both navigation lists using the existing item shape and styling conventions.
3. Verify both layouts navigate to the same route and show the correct current state, including `aria-current`.

## 8. Correct the logo’s accessible text

**User story:** As a screen-reader user, I want the logo image to have the correct brand name so that the brand is announced clearly.

**Acceptance criteria**
- Assistive technology announces the correct brand name, “Page Prism,” for the logo link.
- The logo remains linked to the dashboard.

**Likely touchpoints:** `Logo.jsx`

**Coding steps**
1. Correct the misspelling in the image's alternative text to “Page Prism.”
2. Confirm the image is inside the existing dashboard link and its alternative text gives that link a meaningful accessible name.
3. Inspect the rendered accessible name or test it with a screen reader.
