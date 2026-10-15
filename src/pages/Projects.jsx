import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProjects, createProject } from '../services/project'
import Button from '../components/Button'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      const allProjects = await getAllProjects()
      setProjects(allProjects)
    }
    fetchProjects()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Project name is required.')
      return
    }
    setError('')
    setIsSaving(true)
    try {
      const createdProj = await createProject({
        name: name.trim(),
        description: description.trim(),
        inspirations: [],
      })
      setProjects((prev) => [...prev, createdProj])
    } catch (err) {
      setError('Could not create Project. Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="project-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'project-error' : undefined}
            className="mt-1 w-[50%] rounded border border-gray-300 p-2 bg-transparent"
          ></input>
        </div>
        <div>
          <label htmlFor="project-desc" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="project-desc"
            value={description}
            className="mt-1 w-[50%] rounded border border-gray-300 bg-transparent"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        {error && (
          <p id="project-error" role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSaving} className="">
          {isSaving ? 'Creating...' : 'Create Project'}
        </Button>
      </form>
      {projects.map((project) => (
        <div key={project.id} className="p-4 border-b border-gray-200">
          <Link
            to={`/projects/${project.id}/${encodeURIComponent(project?.name || 'project')}`}
            className="block"
          >
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <small>{project.id}</small>
            <p className="text-sm text-gray-600">{project.description}</p>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Projects
