import React from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Button from '../components/Button'

const Projects = () => {
  const { state, actions } = useApp()
  const { projects, loading, error } = state

  const handleCreateProject = async () => {
    await actions.createProject({
      name: 'New Project',
      description: 'A new project description',
      inspirations: [],
    })
  }

  return (
    <div>
      <Button onClick={handleCreateProject}>Create New Project</Button>
      {loading && projects.length === 0 ? <p>Loading projects...</p> : null}
      {error ? <p>{error}</p> : null}
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
  )
}

export default Projects
