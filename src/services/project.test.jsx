import { deleteProject } from './project'
import { getDB } from '../utils/indexedDB'

jest.mock('../utils/indexedDB', () => ({
  getDB: jest.fn(),
}))

describe('deleteProject', () => {
  it(
    'deletes the project and its inspirations but leaves other projects intact',
    async () => {
      const projects = new Map([
        ['project-1', { id: 'project-1' }],
        ['project-2', { id: 'project-2' }],
      ])
      const inspirations = new Map([
        ['inspiration-1', { id: 'inspiration-1', projectId: 'project-1' }],
        ['inspiration-2', { id: 'inspiration-2', projectId: 'project-1' }],
        ['inspiration-3', { id: 'inspiration-3', projectId: 'project-2' }],
      ])
      const inspirationStore = {
        index: jest.fn(() => ({
          getAllKeys: jest.fn((projectId) =>
            Promise.resolve(
              Array.from(inspirations.values())
                .filter((inspiration) => inspiration.projectId === projectId)
                .map((inspiration) => inspiration.id)
            )
          ),
        })),
        delete: jest.fn((id) => Promise.resolve(inspirations.delete(id))),
      }
      const projectStore = {
        delete: jest.fn((id) => Promise.resolve(projects.delete(id))),
      }
      const transaction = {
        objectStore: jest.fn((storeName) =>
          storeName === 'projects' ? projectStore : inspirationStore
        ),
        done: Promise.resolve(),
      }

      getDB.mockResolvedValue({
        transaction: jest.fn(() => transaction),
      })

      await deleteProject('project-1')

      expect(projects.has('project-1')).toBe(false)
      expect(inspirations.has('inspiration-1')).toBe(false)
      expect(inspirations.has('inspiration-2')).toBe(false)
      expect(projects.has('project-2')).toBe(true)
      expect(inspirations.has('inspiration-3')).toBe(true)
    }
  )
})
