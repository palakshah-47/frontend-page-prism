import { MemoryRouter } from 'react-router-dom'
import ProjectDetail from './ProjectDetail'
import { getProject, deleteProject, updateProject } from '../services/project'
import {
  createInspiration,
  getInspirationsByProject,
} from '../services/inspiration'
import { getMetadata } from '../utils/api'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('../services/project', () => ({
  getProject: jest.fn(),
  deleteProject: jest.fn(),
  updateProject: jest.fn(),
}))

jest.mock('../services/inspiration', () => ({
  createInspiration: jest.fn(),
  getInspirationsByProject: jest.fn().mockResolvedValue([]),
}))

jest.mock('../utils/api', () => ({
  getMetadata: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  getInspirationsByProject.mockResolvedValue([])
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

  it('loads and displays inspirations in newest-first order', async () => {
    getProject.mockResolvedValue(mockProject)
    getInspirationsByProject.mockResolvedValue([
      {
        id: 'inspiration-old',
        createdAt: '2024-01-20T00:00:00.000Z',
        websiteMetadata: { title: 'Older inspiration', url: 'old.example' },
      },
      {
        id: 'inspiration-new',
        createdAt: '2024-01-22T00:00:00.000Z',
        websiteMetadata: { title: 'Newer inspiration', url: 'new.example' },
      },
    ])

    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    const newer = await screen.findByText('Newer inspiration')
    const older = screen.getByText('Older inspiration')
    expect(newer.compareDocumentPosition(older)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('does not show an error after successfully saving an inspiration', async () => {
    getProject.mockResolvedValue(mockProject)
    getMetadata.mockResolvedValue({
      title: 'Stripe',
      url: 'https://stripe.com/',
    })
    createInspiration.mockResolvedValue({
      id: 'inspiration-stripe',
      websiteMetadata: { title: 'Stripe', url: 'https://stripe.com/' },
    })

    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    await screen.findByText('Project one')
    fireEvent.change(screen.getByLabelText('Website URL'), {
      target: { value: 'stripe.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Stripe')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an error message when url is empty and clicked on Add', async () => {
    getProject.mockResolvedValue(mockProject)
    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    await screen.findByText('Project one')

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByRole('alert')).toHaveTextContent(/Enter a valid URL/)
    expect(createInspiration).not.toHaveBeenCalled()
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
