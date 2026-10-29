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

  it('fills in the description after a successful suggestion', async () => {
    suggestDescription.mockResolvedValue('A generated portfolio description.')

    render(
      <MemoryRouter>
        <UpdateProject setProjects={jest.fn()} />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Portfolio' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Suggest/ }))

    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toHaveValue(
        'A generated portfolio description.'
      )
    })
    expect(suggestDescription).toHaveBeenCalledWith('Portfolio')
  })
})
