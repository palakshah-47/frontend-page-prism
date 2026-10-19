import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllProjects, createProject } from '../services/project'
import Button from '../components/Button'
import UpdateProject from './UpdateProject'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchProjects = async () => {
      const allProjects = await getAllProjects()
      setProjects(allProjects)
    }
    fetchProjects()
  }, [])

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects
      .filter((p) => p.name.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [projects, query])

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
      <UpdateProject setProjects={setProjects} />
      <label htmlFor="search">Search Projects:</label>
      <input
        id="search"
        value={query}
        placeholder="Search Projects..."
        type="search"
        onChange={(e) => setQuery(e.target.value)}
        className="p-2 rounded border border-separate bg-transparent ml-2"
      ></input>
      {visibleProjects.map((project) => (
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
