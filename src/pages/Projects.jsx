import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProjects, createProject } from '../services/project'
import { getInspirationsByProject } from '../services/inspiration'
import Button from '../components/Button'
import ErrorMessage from '../components/ErrorMessage'
import { ProjectCard } from '../components/projects/ProjectCard'

const getErrorMessage = (error) =>
  error?.message || 'Something went wrong. Please try again.'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inspirationByProject, setInspirationByProject] = useState({})

  const fetchProjects = async () => {
    setError(null)
    setLoading(true)
    try {
      const allProjects = await getAllProjects()
      setProjects(allProjects)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (projects.length === 0) return
    const loadInspirations = async () => {
      setError(null)
      try {
        const next = {}
        for (const project of projects) {
          const inspirations = await getInspirationsByProject(project.id)
          next[project.id] = {
            count: inspirations.length,
            thumbnailUrl: inspirations[0]?.screenshot_uri,
          }
        }
        setInspirationByProject(next)
      } catch (err) {
        setError(getErrorMessage(err))
      }
    }
    loadInspirations()
  }, [projects])

  const handleCreateProject = async () => {
    setError(null)
    try {
      const newProject = await createProject({
        name: 'New Project',
        description: 'A new project description',
      })
      setProjects([...projects, newProject])
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) {
    return <div>Loading Projects...</div>
  }

  return (
    <div>
      <ErrorMessage
        message={error}
        onRetry={error ? fetchProjects : undefined}
        onDismiss={error ? () => setError(null) : undefined}
      />
      <Button onClick={handleCreateProject}>Create New Project</Button>
      <div style={{display: 'flex', flexDirection: 'column', gap:'2rem'}}>
      {/* {projects.map((project) => (       
        <ProjectCard
          key={project.id}
          project={project}
          inspirationCount={inspirationByProject[project.id]?.count ?? 0}
          thumbnailUrl={inspirationByProject[project.id]?.thumbnailUrl}
        />       
      ))} */}
      {projects.map((project) => (
        <div key={project.id} className="p-4 border-b border-gray-200">
          <Link to={`/projects/${project.id}`} className="block">
            <h2 className="text-lg font-semibold">{project.name}</h2>
            <small>{project.id}</small>
            <p className="text-sm text-gray-600">{project.description}</p>
          </Link>
        </div>
      ))}
       </div>
    </div>
  )
}

export default Projects
