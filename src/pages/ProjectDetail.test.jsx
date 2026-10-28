import { MemoryRouter } from 'react-router-dom'
import ProjectDetail from './ProjectDetail'
import { render, screen } from '@testing-library/react'
import { getProject } from '../services/project'

jest.mock('../services/project', () => ({
  getProject: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

const mockProject = {
  id: 'alpha',
  name: 'Alpha',
  description: 'Project alpha',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-02T00:00:00.000Z',
}

describe('Project detail', () => {
  it('Project description should be displayed but not the project name', async () => {
    getProject.mockResolvedValue(mockProject)
    render(
      <MemoryRouter>
        <ProjectDetail />
      </MemoryRouter>
    )

    expect(await screen.findByText('Project alpha')).toBeInTheDocument()
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
  })
})
