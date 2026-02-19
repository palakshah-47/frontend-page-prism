import { v4 as uuidv4 } from 'uuid'
import { getDB } from '../utils/indexedDB'
import { Inspiration, Project } from '../models/schema'
import { deleteInspiration, getInspirationsByProject } from './inspiration'
import mockLatency from '../utils/mockLatency'
import { mockProjects } from '../utils/mockData'

/**
 * Creates a new project in the database.
 * @param project - The project object to create (without id, createdAt, and updatedAt).
 * @param latencyMs - Optional. The number of milliseconds to simulate latency.
 * @returns A Promise that resolves to the newly created Project.
 */
export async function createProject(
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  latencyMs?: number
): Promise<Project> {
  await mockLatency(latencyMs)
  const db = await getDB()
  const projectsInDb = await db.getAll('projects')
  const existingProjectIds = new Set(projectsInDb.map((p) => p.id))
  const unusedMockProject = mockProjects.find(
    (mockProject) => !existingProjectIds.has(mockProject.id)
  )

  let newProject: Project
  if (unusedMockProject) {
    const mockProject = unusedMockProject
    newProject = {
      ...mockProject,
      id: mockProject.id,
      createdAt: mockProject.createdAt,
      updatedAt: mockProject.updatedAt,
      inspirations: mockProject.inspirations ?? [],
    }
  } else {
    const now = new Date().toISOString()
    newProject = {
      ...project,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      inspirations: [],
    }
  }
  if (unusedMockProject) {
    const tx = db.transaction(['projects', 'inspirations'], 'readwrite')
    await tx.objectStore('projects').add(newProject)
    for (const inspiration of newProject.inspirations ?? []) {
      await tx.objectStore('inspirations').add(inspiration)
    }
    await tx.done
  } else {
    await db.add('projects', newProject)
  }
  return newProject
}

/**
 * Retrieves a project from the database by its ID.
 * @param id - The ID of the project to retrieve.
 * @param latencyMs - Optional. The number of milliseconds to simulate latency.
 * @returns A Promise that resolves to the Project if found, or undefined if not found.
 */
export async function getProject(
  id: string,
  latencyMs?: number
): Promise<Project | undefined> {
  await mockLatency(latencyMs)
  const db = await getDB()
  const tx = db.transaction(['projects', 'inspirations'], 'readonly')
  const project = await tx.objectStore('projects').get(id)
  if (!project) {
    await tx.done
    return undefined
  }
  const inspirations = await tx
    .objectStore('inspirations')
    .index('by-project')
    .getAll(id)
  await tx.done
  return { ...project, inspirations }
}

/**
 * Retrieves all projects from the database.
 * @param latencyMs - Optional. The number of milliseconds to simulate latency.
 * @returns A Promise that resolves to an array of all Projects.
 */
export async function getAllProjects(latencyMs?: number): Promise<Project[]> {
  await mockLatency(latencyMs)
  const db = await getDB()
  const projects = await db.getAll('projects')
  const existingProjectIds = new Set(projects.map((p) => p.id))

  // Add first 2 mock projects to DB if not yet present
  const mockToAdd = mockProjects
    .slice(0, 2)
    .filter((mp) => !existingProjectIds.has(mp.id))

  if (mockToAdd.length > 0) {
    const tx = db.transaction(['projects', 'inspirations'], 'readwrite')
    for (const mockProject of mockToAdd) {
      const projectToAdd: Project = {
        ...mockProject,
        inspirations: [],
      }
      tx.objectStore('projects').add(projectToAdd)
      for (const inspiration of mockProject.inspirations ?? []) {
        tx.objectStore('inspirations').add(inspiration)
      }
    }
    await tx.done
  }

  // Fetch all projects and inspirations after potential adds
  const tx = db.transaction(['projects', 'inspirations'], 'readonly')
  const allProjects = await tx.objectStore('projects').getAll()
  const allInspirations = await tx.objectStore('inspirations').getAll()
  await tx.done

  const inspirationsByProject = allInspirations.reduce((acc, inspiration) => {
    acc.set(inspiration.projectId, [
      ...(acc.get(inspiration.projectId) || []),
      inspiration,
    ])
    return acc
  }, new Map<string, Inspiration[]>())

  return allProjects.map((project) => ({
    ...project,
    inspirations: inspirationsByProject.get(project.id) || [],
  }))
}

/**
 * Updates an existing project in the database.
 * @param id - The ID of the project to update.
 * @param updates - Partial Project object containing the fields to update.
 * @param latencyMs - Optional. The number of milliseconds to simulate latency.
 * @returns A Promise that resolves to the updated Project.
 * @throws Error if the project is not found.
 */
export async function updateProject(
  id: string,
  updates: Partial<Project>,
  latencyMs?: number
): Promise<Project> {
  await mockLatency(latencyMs)
  const db = await getDB()
  const project = await db.get('projects', id)
  if (!project) {
    throw new Error('Project not found')
  }
  const updatedProject: Project = {
    ...project,
    ...updates,
    inspirations: updates.inspirations ?? project.inspirations ?? [],
    updatedAt: new Date().toISOString(),
  }
  await db.put('projects', updatedProject)
  return updatedProject
}

/**
 * Deletes a project from the database.
 * @param id - The ID of the project to delete.
 * @param latencyMs - Optional. The number of milliseconds to simulate latency.
 * @returns A Promise that resolves when the project is deleted.
 */
export async function deleteProject(
  id: string,
  latencyMs?: number
): Promise<void> {
  await mockLatency(latencyMs)
  const inspirations = await getInspirationsByProject(id)
  await Promise.all(
    inspirations.map((inspiration) => deleteInspiration(inspiration.id))
  )
  const db = await getDB()
  await db.delete('projects', id)
}
