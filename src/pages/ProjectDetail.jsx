import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { getProject } from '../services/project'
import { createInspiration } from '../services/inspiration'
import { fetchUrlMetadata } from '../services/urlMetadata'
import Button from '../components/Button'
import styles from './ProjectDetail.module.css'

const ProjectDetail = () => {
  const [project, setProject] = useState(null)
  const [addUrl, setAddUrl] = useState('')
  const [metadata, setMetadata] = useState(null)
  const [notes, setNotes] = useState('')
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { id } = useParams()

  const loadProject = useCallback(async () => {
    const projectData = await getProject(id)
    setProject(projectData)
  }, [id])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const handleFetchMetadata = async () => {
    const url = addUrl.trim()
    if (!url) {
      setError('Please enter a URL.')
      return
    }
    setError(null)
    setFetching(true)
    try {
      const data = await fetchUrlMetadata(url)
      setMetadata(data)
    } catch (err) {
      setError(err.message || 'Could not fetch page info. Check the URL and try again.')
      setMetadata(null)
    } finally {
      setFetching(false)
    }
  }

  const handleAddInspiration = async (e) => {
    e.preventDefault()
    const url = addUrl.trim()
    if (!url) {
      setError('Please enter a URL.')
      return
    }
    if (!metadata) {
      setError('Please fetch metadata first (enter URL and click "Fetch title & description").')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await createInspiration({
        projectId: id,
        websiteMetadata: metadata,
        screenshot_uri: metadata.image || '',
        notes: notes.trim(),
      })
      setAddUrl('')
      setMetadata(null)
      setNotes('')
      await loadProject()
    } catch (err) {
      setError(err.message || 'Failed to add inspiration.')
    } finally {
      setSaving(false)
    }
  }

  const updateMetadata = (field, value) => {
    setMetadata((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  if (!project) {
    return <div>Loading...</div>
  }

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
                {inspiration.websiteMetadata.favicon && (
                  <img
                    src={inspiration.websiteMetadata.favicon}
                    alt=""
                    className={styles.inspirationFavicon}
                  />
                )}
                {inspiration.websiteMetadata.title ||
                  inspiration.websiteMetadata.url}
              </li>
            ))}
          </ul>
        ) : (
          <p>No inspirations added yet.</p>
        )}

        <div className={styles.addInspirationForm}>
          <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem' }}>
            Add inspiration
          </h3>
          <label htmlFor="inspiration-url">URL</label>
          <input
            id="inspiration-url"
            type="url"
            className={styles.input}
            placeholder="https://example.com"
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
          />
          <button
            type="button"
            className={styles.fetchButton}
            onClick={handleFetchMetadata}
            disabled={fetching || !addUrl.trim()}
          >
            {fetching ? 'Fetching…' : 'Fetch title & description'}
          </button>

          {metadata && (
            <>
              <div className={styles.metaPreview}>
                {metadata.favicon && (
                  <img src={metadata.favicon} alt="" aria-hidden />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label htmlFor="inspiration-title">Title</label>
                  <input
                    id="inspiration-title"
                    type="text"
                    className={styles.input}
                    value={metadata.title || ''}
                    onChange={(e) => updateMetadata('title', e.target.value)}
                  />
                  <label htmlFor="inspiration-desc">Description</label>
                  <input
                    id="inspiration-desc"
                    type="text"
                    className={styles.input}
                    value={metadata.description || ''}
                    onChange={(e) => updateMetadata('description', e.target.value)}
                  />
                </div>
              </div>
              <label htmlFor="inspiration-notes">Notes (optional)</label>
              <textarea
                id="inspiration-notes"
                className={styles.input}
                placeholder="Your notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button
                type="button"
                className={styles.addInspirationButton}
                onClick={handleAddInspiration}
                disabled={saving}
              >
                {saving ? 'Adding…' : 'Add inspiration'}
              </button>
            </>
          )}

          {error && <p className={styles.formError} role="alert">{error}</p>}
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <Button className={styles.editButton}>Edit Project</Button>
        <Button className={styles.deleteButton}>Delete Project</Button>
      </div>
    </div>
  )
}

export default ProjectDetail
