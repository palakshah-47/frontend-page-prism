import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject } from '../services/project'
import Button from '../components/Button'
import styles from './ProjectDetail.module.css'
import { UpdateProject } from '../components/UpdateProject'
import { deleteProject } from '../services/project'

const ProjectDetail = () => {
  const [project, setProject] = useState(null)
  const { id } = useParams()
  const [isUpdate, setIsUpdate] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProject = async () => {
      const projectData = await getProject(id)
      setProject(projectData)
    }
    fetchProject()
  }, [id])

  const handleDelete = async () => {
    await deleteProject(project.id)
    navigate('/projects')
  }

  if (!project) {
    return <div>Loading...</div>
  }

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
