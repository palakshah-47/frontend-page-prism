import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Projects from './Projects'
import { createProject, getAllProjects } from '../services/project'

jest.mock('../services/project', () => ({
  getAllProjects: jest.fn().mockResolvedValue([]),
  createProject: jest.fn(),
}))

beforeEach(() => jest.clearAllMocks())

const LocationDisplay = () => {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

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

  it('shows a message when no projects are there', async () => {
    getAllProjects.mockResolvedValue([])
    render(
      <MemoryRouter>
        <Projects />
      </MemoryRouter>
    )
    expect(
      await screen.findByText('No projects yet. Create one above.')
    ).toBeInTheDocument()
  })

  it('shows a message when no matching projects are there for search', async () => {
    getAllProjects.mockResolvedValue([
      { id: 'project-1', name: 'alpha', description: 'project1' },
    ])

    render(
      <MemoryRouter>
        <Projects />
        <LocationDisplay />
      </MemoryRouter>
    )

    expect(await screen.findByText('alpha')).toBeInTheDocument()
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search Projects:' }),
      {
        target: { value: '  beta  ' },
      }
    )

    expect(
      await screen.findByText('No projects match "beta"')
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear Search' }))

    expect(
      screen.getByRole('searchbox', { name: 'Search Projects:' })
    ).toHaveValue('')
    expect(
      screen.getByRole('searchbox', { name: 'Search Projects:' })
    ).toHaveFocus()
    expect(screen.getByText('alpha')).toBeInTheDocument()
    expect(
      new URLSearchParams(screen.getByTestId('location').textContent).has(
        'search'
      )
    ).toBe(false)
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
        <LocationDisplay />
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
    expect(
      new URLSearchParams(screen.getByTestId('location').textContent).get(
        'search'
      )
    ).toBe('  BRAND  ')
  })

  it('restores the project search from the URL when the page loads', async () => {
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
      <MemoryRouter initialEntries={['/projects?search=BRAND']}>
        <Projects />
        <LocationDisplay />
      </MemoryRouter>
    )

    expect(
      await screen.findByRole('searchbox', { name: 'Search Projects:' })
    ).toHaveValue('BRAND')
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
