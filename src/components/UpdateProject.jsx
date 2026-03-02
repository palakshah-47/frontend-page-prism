import { Button } from '@headlessui/react'
import { updateProject } from '../services/project'
import { useState, useEffect } from 'react'
import styles from './UpdateProject.module.css'
import { useNavigate } from 'react-router-dom'

export const UpdateProject = ({ project }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!project) return
    setName(project.name)
    setDescription(project.description)
  }, [project])

  const handleSave = async () => {
    if (!name && !description) {
      setError('Enter Name and Title for project')
      return
    }
    if (!project?.id) {
      setError('Project is missing an id.')
      return
    }
    await updateProject(project.id, {
      name,
      description,
    })
    navigate('/projects')
  }

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
      }}
    >
      <label className={styles.label} htmlFor="project-name">
        Name
      </label>
      <input
        id="project-name"
        className={styles.input}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <label className={styles.label} htmlFor="project-description">
        Description
      </label>
      <textarea
        id="project-description"
        className={styles.textarea}
        rows={3}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <Button type="button" onClick={handleSave}>
        Save
      </Button>
    </div>
  )
}
