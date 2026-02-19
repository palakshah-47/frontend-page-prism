import { useEffect, useState } from 'react'
import Button from './Button'
import { useApp } from '../context/AppContext'
import styles from './UpdateProject.module.css'
import { useNavigate } from 'react-router-dom'

const buildWebsiteMetadata = (url) => ({
  url,
  title: null,
  description: null,
  favicon: null,
  author: null,
  date: null,
  image: null,
  logo: null,
  publisher: null,
  ogTitle: null,
  ogDescription: null,
  ogImage: [],
  ogLocale: null,
  ogUrl: null,
  charset: null,
  urlRequested: url,
  urlResolved: url,
})

const UpdateProject = ({ project, onSaved }) => {
  const { actions } = useApp()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inspirations, setInspirations] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!project) {
      return
    }
    setName(project.name)
    setDescription(project.description)
    setInspirations(
      project.inspirations.length > 0
        ? project.inspirations.map((inspiration) => ({
            id: inspiration.id,
            url:
              inspiration.websiteMetadata.url ||
              inspiration.websiteMetadata.urlResolved ||
              inspiration.websiteMetadata.urlRequested ||
              '',
            notes: inspiration.notes || '',
          }))
        : []
    )
  }, [project])

  const handleAddInspiration = () => {
    setInspirations((prev) => [...prev, { id: null, url: '', notes: '' }])
  }

  const handleRemoveInspiration = (index) => {
    setInspirations((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!project) {
      return
    }

    const normalized = inspirations.map((item) => ({
      ...item,
      url: item.url.trim(),
      notes: item.notes.trim(),
    }))

    const editedIds = new Set(
      normalized
        .filter((item) => item.id && item.url !== '')
        .map((item) => item.id)
    )

    for (const existing of project.inspirations || []) {
      if (!editedIds.has(existing.id)) {
        await actions.deleteInspiration(existing.id)
      }
    }

    for (const item of normalized) {
      if (!item.url) {
        continue
      }
      if (item.id) {
        const existing = project.inspirations?.find((i) => i.id === item.id)
        if (!existing) {
          continue
        }
        await actions.updateInspiration({
          ...existing,
          notes: item.notes,
          websiteMetadata: {
            ...existing.websiteMetadata,
            url: item.url,
            urlRequested: item.url,
            urlResolved: item.url,
          },
        })
      } else {
        await actions.createInspiration({
          projectId: project.id,
          websiteMetadata: buildWebsiteMetadata(item.url),
          screenshot_uri: '',
          notes: item.notes,
        })
      }
    }

    await actions.updateProject({
      id: project.id,
      name,
      description,
      inspirations: project.inspirations ?? [],
    })
    await actions.loadProjects()
    onSaved?.()
    
  }

  if (!project) {
    return null
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Edit Project</h2>
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
      <div className={styles.inspirationsHeader}>
        <h3 className={styles.subtitle}>Inspirations</h3>
        <Button
          className={styles.secondaryButton}
          onClick={handleAddInspiration}
        >
          Add Inspiration
        </Button>
      </div>
      {inspirations.length === 0 ? (
        <p className={styles.emptyState}>No inspirations yet.</p>
      ) : (
        <div className={styles.inspirationsList}>
          {inspirations.map((item, index) => (
            <div key={`${item.id || 'new'}-${index}`} className={styles.row}>
              <div className={styles.field}>
                <label
                  className={styles.fieldLabel}
                  htmlFor={`inspiration-url-${index}`}
                >
                  URL
                </label>
                <input
                  id={`inspiration-url-${index}`}
                  className={styles.input}
                  placeholder="https://example.com"
                  value={item.url}
                  onChange={(event) => {
                    const value = event.target.value
                    setInspirations((prev) =>
                      prev.map((entry, i) =>
                        i === index ? { ...entry, url: value } : entry
                      )
                    )
                  }}
                />
              </div>
              <div className={styles.field}>
                <label
                  className={styles.fieldLabel}
                  htmlFor={`inspiration-notes-${index}`}
                >
                  Notes
                </label>
                <input
                  id={`inspiration-notes-${index}`}
                  className={styles.input}
                  placeholder="Notes"
                  value={item.notes}
                  onChange={(event) => {
                    const value = event.target.value
                    setInspirations((prev) =>
                      prev.map((entry, i) =>
                        i === index ? { ...entry, notes: value } : entry
                      )
                    )
                  }}
                />
              </div>
              <Button
                className={styles.removeButton}
                onClick={() => handleRemoveInspiration(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.footer}>
        <Button
          className={styles.secondaryButton}
          onClick={() => navigate('/projects')}
        >
          Cancel
        </Button>
        <Button className={styles.primaryButton} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default UpdateProject
