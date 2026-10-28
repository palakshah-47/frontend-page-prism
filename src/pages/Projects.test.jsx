import { MemoryRouter } from 'react-router-dom'
import { getAllProjects, createProject } from '../services/project'
import { render, fireEvent, screen } from '@testing-library/react'
import Projects from './Projects'

jest.mock('../services/project', () => ({
  getAllProjects: jest.fn().mockResolvedValue([]),
  createProject: jest.fn(),
}))

beforeEach(() => jest.clearAllMocks())

const mockProjects = [
  {
    id: 'alpha',
    name: 'Alpha',
    description: 'project alpha',
    updatedAt: '2026-10-27T00:00:00.000Z',
  },
  {
    id: 'beta',
    name: 'Beta',
    description: 'project beta',
    updatedAt: '2026-10-28T00:00:00.000Z',
  },
]

describe('Projects', () => {
  it('focuses the project name input when the page loads', async () => {
    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )
    expect(await screen.findByLabelText('Name')).toHaveFocus()
  })

  it('shows the projects on the page with names', async () => {
    getAllProjects.mockResolvedValue(mockProjects)

    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )

    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('creates new project with name and des')
})
