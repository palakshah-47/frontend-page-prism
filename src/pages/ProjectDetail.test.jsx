import { MemoryRouter } from 'react-router-dom'
import ProjectDetail from './ProjectDetail'
import { getProject, deleteProject, updateProject } from '../services/project'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('../services/project', () => ({
  getProject: jest.fn(),
  deleteProject: jest.fn(),
  updateProject: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})

const mockProject = {
  id: 'project-1',
  name: 'Alpha',
  description: 'Project one',
  createdAt: '2024-01-20T00:00:00.000Z',
  updatedAt: '2024-01-21T00:00:00.000Z',
  inspirations: [],
}
const mockUpdateProject = {
  id: 'project-1',
  name: 'Alpha 1',
  description: 'Project Alpha',
  createdAt: '2024-01-20T00:00:00.000Z',
  updatedAt: '2024-01-22T00:00:00.000Z',
  inspirations: [],
}

describe('project detail page renders on page load', () => {
  it('renders project details from the service', async () => {
    getProject.mockResolvedValue(mockProject)
    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )
    expect(await screen.findByText('Project one')).toBeInTheDocument()
    expect(screen.getByText('Project Details')).toBeInTheDocument()
  })

  it('updates the project when clicking update project button', async () => {
    getProject.mockResolvedValue(mockProject)
    updateProject.mockResolvedValue(mockUpdateProject)

    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    expect(await screen.findByText('Project one')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit Project' }))
    expect(screen.getByLabelText('Name')).toHaveValue('Alpha')
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Alpha 1' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Project Alpha' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update Project' }))
    await waitFor(() => {
      expect(updateProject).toHaveBeenCalledWith('project-1', {
        name: 'Alpha 1',
        description: 'Project Alpha',
      })
    })
  })

  it('deletes the project when clicking on delete Project button', async () => {
    getProject.mockResolvedValue(mockProject)
    deleteProject.mockResolvedValue()
    jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    expect(await screen.findByText('Project one')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }))

    await waitFor(() => {
      expect(deleteProject).toHaveBeenCalledWith('project-1')
    })
    expect(window.confirm).toHaveBeenCalledWith(
      'Deleting this project will also delete all its inspirations. Are you sure?'
    )
  })

  it('does not delete the project when deletion is canceled', async () => {
    getProject.mockResolvedValue(mockProject)
    jest.spyOn(window, 'confirm').mockReturnValue(false)

    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    expect(await screen.findByText('Project one')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete Project' }))

    expect(window.confirm).toHaveBeenCalled()
    expect(deleteProject).not.toHaveBeenCalled()
  })
})
