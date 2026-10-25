import React, { useState, useEffect, useMemo, useRef } from 'react'
import { getAllProjects } from '../services/project'
import { Link } from 'react-router-dom'

const RECENT_LIMIT = 3

const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    const fetchProducts = async () => {
      try {
        const allProjects = await getAllProjects()
        if (cancelled) return
        setProjects(allProjects)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    fetchProducts()
    return () => {
      cancelled = true
    }
  }, [])

  const recent = useMemo(() => {
    return [...projects]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, RECENT_LIMIT)
  }, [projects])

  if (status === 'loading')
    return <p role="status">Loading your dashboard...</p>
  if (status === 'error')
    return <p role="alert">Could not load the projects. Please refresh.</p>

  const count = projects.length
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Welcome to the Dashboard.</h2>
      <p>
        You have {count} {count === 1 ? 'project' : 'projects'}
      </p>
      {count === 0 ? (
        <p>
          <Link to="/projects" className="underline">
            Create your first project
          </Link>
        </p>
      ) : (
        <>
          <h3 clasName="font-medium">Recently Updated</h3>
          <ul aria-label="Recently updated Projects" className="space-y-1">
            {recent.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/projects/${p.id}/${encodeURIComponent(p?.name || 'project')}`}
                  className="underline"
                >
                  {p.name}
                </Link>{' '}
                <small className="text-gray-500">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export default Dashboard
