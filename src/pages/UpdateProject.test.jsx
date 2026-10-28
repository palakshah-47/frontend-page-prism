import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import UpdateProject from './UpdateProject'
import { suggestDescription } from '../services/ai'

jest.mock('../services/project', () => ({
  createProject: jest.fn(),
  updateProject: jest.fn(),
}))

jest.mock('../services/ai', () => ({
  suggestDescription: jest.fn(),
}))

describe('UpdateProject description suggestions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('stops generating and keeps the partial description in the textarea', async () => {
    suggestDescription.mockImplementation((_name, signal, onPartial) => {
      return new Promise((resolve) => {
        onPartial('A partial description')
        signal.addEventListener('abort', () => resolve('A partial description'))
      })
    })

    render(
      <MemoryRouter>
        <UpdateProject setProjects={jest.fn()} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Portfolio' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Suggest/ }))

    const stopButton = await screen.findByRole('button', { name: 'Stop' })
    fireEvent.click(stopButton)

    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toHaveValue(
        'A partial description'
      )
    })
    expect(suggestDescription.mock.calls[0][1].aborted).toBe(true)
    expect(screen.getByRole('button', { name: /Suggest/ })).toBeEnabled()
  })
})
