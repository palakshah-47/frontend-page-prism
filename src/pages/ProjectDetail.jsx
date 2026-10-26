import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getProject, deleteProject } from '../services/project'
import {
  getInspirationsByProject,
  fallbackMetadata,
  createInspiration,
} from '../services/inspiration'
import Button from '../components/Button'
import styles from './ProjectDetail.module.css'
import UpdateProject from './UpdateProject'
import { getMetadata } from '../utils/api'
import AddInspirationForm from './AddInspirationForm'

const ProjectDetail = () => {
  const [project, setProject] = useState(null)
  const [inspirations, setInspirations] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const [isUpdate, setIsUpdate] = useState(false)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setStatus('loading')
      try {
        const [projectData, items] = await Promise.all([
          getProject(id),
          getInspirationsByProject(id),
        ])
        if (cancelled) return
        if (!projectData) {
          setStatus('notfound')
          return
        }
        setProject(projectData)
        setInspirations(
          [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        )
        setStatus('ready')
      } catch (err) {
        !cancelled && setStatus('error')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const handleAddInspiration = async (url) => {
    let websiteMetadata
    try {
      const { host, pathname } = new URL(url)
      websiteMetadata = await getMetadata(
        `${host}${pathname === '/' ? '' : pathname}`
      )
    } catch {
      websiteMetadata = fallbackMetadata(url)
    }

    const created = await createInspiration({
      projectId: id,
      websiteMetadata,
      screenshot_uri: '',
      notes: '',
    })

    setInspirations((prev) => [created, ...prev])
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Deleting this project will also delete all its inspirations. Are you sure?'
    )
    if (!confirmed) return

    try {
      await deleteProject(project.id)
      navigate('/projects')
    } catch {
      window.alert('Could not delete the project. Please try again.')
    }
  }

  if (status === 'loading') return <div role="status">Loading...</div>
  if (status === 'notfound')
    return (
      <div>
        <p>We coundn't find that project.</p>
        <Link to="/projects">Back to Projects</Link>
      </div>
    )
  if (status === 'error')
    return <div role="alert">Something went wrong loading this project</div>

  return (
    <div className={styles.container}>
      <p className={styles.description}>{project.description}</p>
      <div className={styles.section}>
        <h2 className={styles.subheading}>Project Details</h2>
        <p>
          <strong>Created:</strong>{' '}
          {new Date(project.createdAt).toLocaleDateString()}
        </p>
        <p>
          <strong>Last Updated:</strong>{' '}
          {new Date(project.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <div className={styles.section}>
        <h2 className={styles.subheading}>Inspirations</h2>
        <AddInspirationForm onAdd={handleAddInspiration} />
        {inspirations?.length > 0 ? (
          <ul className={styles.inspirationList} aria-label="Inspirations">
            {inspirations.map((inspiration) => {
              const { url, title } = inspiration.websiteMetadata
              return (
                <li key={inspiration.id}>
                  <a href={url} target="_blank" rel="noopenar noreferrer">
                    {title || url}
                  </a>
                </li>
              )
            })}
          </ul>
        ) : (
          <p>No inspirations added yet.</p>
        )}
      </div>
      <div className={styles.buttonContainer}>
        <Button className={styles.editButton} onClick={() => setIsUpdate(true)}>
          Edit Project
        </Button>
        <Button className={styles.deleteButton} onClick={handleDelete}>
          Delete Project
        </Button>
      </div>
      {isUpdate && <UpdateProject project={project} />}
    </div>
  )
}

export default ProjectDetail
