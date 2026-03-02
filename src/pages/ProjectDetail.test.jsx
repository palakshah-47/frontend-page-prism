import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { deleteProject, getProject } from '../services/project'
import ProjectDetail from './ProjectDetail'

jest.mock('../services/project', () => ({
  getProject: jest.fn(),
  deleteProject: jest.fn(),
  updateProject: jest.fn(),
}))
jest.mock('../components/UpdateProject', () => ({
  UpdateProject: () => <div>UpdateProjectForm</div>,
}))
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'p-1' }),
  useNavigate: () => mockNavigate,
}))

const mockProject = {
  id: 'p-1',
  name: 'Alpha',
  description: 'First project',
  createdAt: '2024-01-02T00:00:00.000Z',
  updatedAt: '2024-02-03T00:00:00.000Z',
  inspirations: [],
}

describe('Project detail page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders project details from the service', async () => {
    getProject.mockResolvedValueOnce(mockProject)
    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )
    expect(await screen.findByText('First project')).toBeInTheDocument()
    expect(screen.getByText('Project Details')).toBeInTheDocument()
  })

  it('shows update form after clicking Edit Project', async () => {
    getProject.mockResolvedValueOnce(mockProject)
    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    await screen.findByText('First project')
    fireEvent.click(screen.getByRole('button', { name: 'Edit Project' }))
    expect(screen.getByText('UpdateProjectForm')).toBeInTheDocument()
  })

  it('deletes project and navigates to /projects', async () => {
    getProject.mockResolvedValueOnce(mockProject)
    deleteProject.mockResolvedValueOnce()
    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    await screen.findByText('First project')
    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }))

    await waitFor(() => {
      expect(deleteProject).toHaveBeenCalledWith('p-1')
    })
    expect(mockNavigate).toHaveBeenCalledWith('/projects')
  })
})
