import React, { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Button from '../components/Button'
import UpdateProject from '../components/UpdateProject'
import styles from './ProjectDetail.module.css'

const ProjectDetail = () => {
  const { state, actions } = useApp()
  const navigate = useNavigate()
  const { projects, loading } = state
  const { id } = useParams()

  const project = projects.find((item) => item.id === id)

  if (loading && !project) {
    return <div>Loading...</div>
  }

  if (!project) {
    return <div>Project not found.</div>
  }

  const onSaved = useCallback(() => {
    navigate('/projects');
  }, [])

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{project.name}</h1>
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
      <UpdateProject project={project} onSaved={onSaved}/>
      <div className={styles.buttonContainer}>
        <Button
          className={styles.deleteButton}
          onClick={async () => {
            await actions.deleteProject(project.id)
            navigate('/projects')
          }}
        >
          Delete Project
        </Button>
      </div>
    </div>
  )
}

export default ProjectDetail
