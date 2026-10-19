import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Projects from './Projects'
import { createProject, getAllProjects } from '../services/project'

jest.mock('../services/project', () => ({
  getAllProjects: jest.fn().mockResolvedValue([]),
  createProject: jest.fn(),
}))

const mockProjects = [
  {
    id: 'project-1',
    name: 'Project1',
    description: 'Project One',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'project-2',
    name: 'Project2',
    description: 'Project Two',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
]

describe('Projects', () => {
  it('focuses the project name input when the page loads', () => {
    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Name')).toHaveFocus()
  })

  it('view all projcets on the project page', async () => {
    getAllProjects.mockResolvedValue(mockProjects)

    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )

    expect(await screen.findByText('Project1')).toBeInTheDocument()
    expect(screen.getByText('Project2')).toBeInTheDocument()
  })

  it('filters projects by a case-insensitive search query', async () => {
    getAllProjects.mockResolvedValue([
      {
        id: 'project-brand',
        name: 'Brand Refresh',
        description: 'Updated visual identity',
        updatedAt: '2024-02-01T00:00:00.000Z',
      },
      {
        id: 'project-dashboard',
        name: 'Dashboard Redesign',
        description: 'Updated dashboard',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ])

    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )

    expect(await screen.findByText('Brand Refresh')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Redesign')).toBeInTheDocument()

    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search Projects:' }),
      {
        target: { value: '  BRAND  ' },
      }
    )

    expect(screen.getByText('Brand Refresh')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard Redesign')).not.toBeInTheDocument()
  })

  it('creates a project using trimmed values from the form fields', async () => {
    createProject.mockResolvedValue({
      id: 'project-1',
      name: 'My project',
      description: 'Design references',
    })

    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: '  My project  ' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: '  Design references  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create Project' }))

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        name: 'My project',
        description: 'Design references',
        inspirations: [],
      })
    })
  })
})
