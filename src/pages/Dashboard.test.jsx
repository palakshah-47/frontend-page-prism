import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import { getAllProjects } from '../services/project'
import { render, screen, fireEvent, within } from '@testing-library/react'

jest.mock('../services/project', () => ({
  getAllProjects: jest.fn().mockResolvedValue([]),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

const mockProjects = [
  {
    id: 'alpha',
    name: 'Alpha',
    description: 'Project alpha',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-21T00:00:00.000Z',
    inspirations: [],
  },
  {
    id: 'beta',
    name: 'Beta',
    description: 'Project beta',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-22T00:00:00.000Z',
    inspirations: [],
  },
]

describe('Dashboard page', () => {
  it('shows message when no projects available', async () => {
    getAllProjects.mockResolvedValue([])
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(
      await screen.findByText('Create your first project')
    ).toBeInTheDocument()
  })

  it('shows the projects and link to the project detail', async () => {
    getAllProjects.mockResolvedValue(mockProjects)
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByText('You have 2 projects')).toBeInTheDocument()
    const list = screen.getByRole('list', { name: 'Recently updated Projects' })
    const links = within(list).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Beta', 'Alpha'])
    expect(links[0]).toHaveAttribute('href', '/projects/beta/Beta')
  })
})
