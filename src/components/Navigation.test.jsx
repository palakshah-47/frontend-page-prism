import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Disclosure } from '@headlessui/react'
import DesktopNavigation from './DesktopNavigation'
import MobileNavigation from './MobileNavigation'

const variants = [
  {
    label: 'DesktopNavigation',
    Component: DesktopNavigation,
    currentClass: 'navItemCurrent',
    defaultClass: 'navItemDefault',
  },
  {
    label: 'MobileNavigation',
    Component: MobileNavigation,
    currentClass: 'navigationItemCurrent',
    defaultClass: 'navigationItemDefault',
  },
]

const renderAt = (Component, path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Disclosure defaultOpen>
        <Component />
      </Disclosure>
    </MemoryRouter>
  )

describe.each(variants)(
  '$label active state',
  ({ Component, currentClass, defaultClass }) => {
    const expectCurrent = (name) => {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveClass(currentClass)
      expect(link).not.toHaveClass(defaultClass)
      expect(link).toHaveAttribute('aria-current', 'page')
    }

    const expectNotCurrent = (name) => {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveClass(defaultClass)
      expect(link).not.toHaveClass(currentClass)
      expect(link).not.toHaveAttribute('aria-current')
    }

    it('highlights only Dashboard on /', () => {
      renderAt(Component, '/')
      expectCurrent('Dashboard')
      expectNotCurrent('Projects')
    })

    it.each(['/projects', '/projects/'])(
      'highlights only Projects on %s',
      (path) => {
        renderAt(Component, path)
        expectCurrent('Projects')
        expectNotCurrent('Dashboard')
      }
    )

    it.each(['/projects/abc123', '/projects/abc123/My%20Site'])(
      'keeps Projects highlighted on project detail %s',
      (path) => {
        renderAt(Component, path)
        expectCurrent('Projects')
        expectNotCurrent('Dashboard')
      }
    )

    it('does not highlight Projects on a lookalike path', () => {
      renderAt(Component, '/projects-archive')
      expectNotCurrent('Projects')
      expectNotCurrent('Dashboard')
    })
  }
)
