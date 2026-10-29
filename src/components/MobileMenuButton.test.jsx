import { render, screen, fireEvent } from '@testing-library/react'
import { Disclosure } from '@headlessui/react'
import MobileMenuButton from './MobileMenuButton'

const renderInDisclosure = () =>
  render(
    <Disclosure>
      {({ open }) => <MobileMenuButton open={open} />}
    </Disclosure>
  )

describe('MobileMenuButton', () => {
  it('has "Open main menu" accessible name when closed', () => {
    renderInDisclosure()
    expect(
      screen.getByRole('button', { name: 'Open main menu' })
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('changes accessible name to "Close main menu" when open', () => {
    renderInDisclosure()
    fireEvent.click(screen.getByRole('button', { name: 'Open main menu' }))
    expect(
      screen.getByRole('button', { name: 'Close main menu' })
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles back to "Open main menu" when closed again', () => {
    renderInDisclosure()
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button).toHaveAccessibleName('Open main menu')
  })
})
