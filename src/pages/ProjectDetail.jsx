import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { getProject, deleteProject } from '../services/project'
import Button from '../components/Button'
import styles from './ProjectDetail.module.css'
import UpdateProject from './UpdateProject'

const ProjectDetail = () => {
  const [project, setProject] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const [isUpdate, setIsUpdate] = useState(false)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const fetchProject = async () => {
      let cancelled = false
      try {
        if (cancelled) return
        const projectData = await getProject(id)
        if (!projectData) {
          setStatus('notfound')
          return
        }
        setProject(projectData)
        setStatus('ready')
      } catch (err) {
        !cancelled && setStatus('error')
      }
      return () => {
        cancelled = true
      }
    }
    fetchProject()
  }, [id])

  const handleDelete = async () => {
    try {
      await deleteProject(project.id)
      navigate('/projects')
    } catch {
      alert('Could not delete the project. Please try again.')
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
        {project.inspirations?.length > 0 ? (
          <ul className={styles.inspirationList}>
            {project.inspirations.map((inspiration) => (
              <li key={inspiration.id}>
                {inspiration.websiteMetadata.title ||
                  inspiration.websiteMetadata.url}
              </li>
            ))}
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
