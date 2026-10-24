import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllProjects, createProject } from '../services/project'
import Button from '../components/Button'
import UpdateProject from './UpdateProject'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('search') ?? ''
  const [status, setStatus] = useState('loading')
  const searchRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const fetchProjects = async () => {
      try {
        const allProjects = await getAllProjects()
        if (cancelled) return
        setProjects(allProjects)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    fetchProjects()
    return () =>{
      cancelled = true;
    }
  }, [])

  const trimmedQuery = query.trim();

  const updateSearchQuery = (value) => {
    setSearchParams((currentSearchParams) => {
      const nextSearchParams = new URLSearchParams(currentSearchParams)
      if (value) {
        nextSearchParams.set('search', value)
      } else {
        nextSearchParams.delete('search')
      }
      return nextSearchParams
    }, { replace: true })
  }

  const handleClearSearch = () => {
    updateSearchQuery('')
    searchRef.current?.focus();
  }

  const visibleProjects = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects
      .filter((p) => p.name.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [projects, query])

  return (
    <div>
      <UpdateProject setProjects={setProjects} />
      <label htmlFor="search">Search Projects:</label>
      <input
        id="search"
        value={query}
        placeholder="Search Projects..."
        type="search"
        onChange={(e) => updateSearchQuery(e.target.value)}
        ref={searchRef}
        className="p-2 rounded border border-separate bg-transparent ml-2"
      ></input>
      {status === 'loading' && <p role="status">Loading Projects...</p>}
      {status === "error" && <p role="alert">Could not load projects. Please refresh the page.</p>}
      {status === 'ready' && projects.length === 0 && (<p className="p-4 text-gray-600">No projects yet. Create one above.</p>)}
      {status === 'ready' && projects.length > 0 && visibleProjects.length === 0 && (
        <div>
          <p className="text-gray-600">No projects match &quot;{trimmedQuery}&quot;</p>
          <Button type="button" onClick={handleClearSearch}>Clear Search</Button>
        </div>
      )}
      
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
