import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Projects from './Projects'
import { createProject, getAllProjects } from '../services/project'

jest.mock('../services/project', () => ({
  createProject: jest.fn(),
  getAllProjects: jest.fn(),
}))

const mockProjects = [
  {
    id: 'p-1',
    name: 'Alpha',
    description: 'First project',
  },
  {
    id: 'p-2',
    name: 'Beta',
    description: 'Second project',
  },
]

describe('Projects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders projects from the service', async () => {
    getAllProjects.mockResolvedValueOnce(mockProjects)

    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )

    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('creates a new project and displays it', async () => {
    getAllProjects.mockResolvedValueOnce(mockProjects)
    createProject.mockResolvedValueOnce({
      id: 'p-3',
      name: 'New Project',
      description: 'A new project description',
    })

    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )

    await screen.findByText('Alpha')

    fireEvent.click(screen.getByRole('button', { name: 'Create New Project' }))

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText('New Project')).toBeInTheDocument()
  })
})
