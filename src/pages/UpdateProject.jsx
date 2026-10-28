import { useEffect, useRef, useState } from 'react'
import { createProject, updateProject } from '../services/project'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { suggestDescription } from '../services/ai'

const UpdateProject = ({ project, setProjects }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState('')
  const suggestionControllerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!project) return
    setName(project.name)
    setDescription(project.description)
  }, [project])

  useEffect(() => {
    return () => suggestionControllerRef.current?.abort()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Project name is required.')
      return
    }
    setError('')
    setIsSaving(true)
    if (!project) {
      try {
        const createdProj = await createProject({
          name: name.trim(),
          description: description.trim(),
          inspirations: [],
        })
        setProjects((prev) => [...prev, createdProj])
      } catch (err) {
        setError('Could not create Project. Please try again')
      } finally {
        setIsSaving(false)
        setName('')
        setDescription('')
      }
    } else {
      if (!project?.id) {
        setError('Project is missing an id')
        return
      }
      try {
        await updateProject(project.id, { name, description })
        navigate('/projects')
      } catch (err) {
        setError('Could not update Project. Please try again')
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleSuggest = async () => {
    if (suggestionControllerRef.current) {
      suggestionControllerRef.current.abort()
      return
    }

    const controller = new AbortController()
    const previousDescription = description
    suggestionControllerRef.current = controller
    setSuggestError('')
    setIsSuggesting(true)

    try {
      const suggestion = await suggestDescription(
        name,
        controller.signal,
        setDescription
      )
      if (suggestion) setDescription(suggestion)
    } catch {
      setDescription(previousDescription)
      setSuggestError('Could not suggest a description. Please try again.')
    } finally {
      if (suggestionControllerRef.current === controller) {
        suggestionControllerRef.current = null
      }
      setIsSuggesting(false)
    }
  }

  const buttonText = project ? 'Update Project' : 'Create Project'
  const savingButtonText = project ? 'Saving...' : 'Creating...'

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="project-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'project-error' : undefined}
            className="mt-1 w-[50%] rounded border border-gray-300 bg-white p-2 text-gray-900 caret-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          ></input>
        </div>
        <div>
          <label htmlFor="project-desc" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="project-desc"
            value={description}
            className="mt-1 w-[50%] rounded border border-gray-300 bg-white p-2 text-gray-900 caret-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <Button type="button" onClick={handleSuggest}>
            {isSuggesting ? 'Stop' : '✨ Suggest'}
          </Button>
          {suggestError && <p role="alert">{suggestError}</p>}
        </div>
        {error && (
          <p id="project-error" role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSaving} className="">
          {isSaving ? savingButtonText : buttonText}
        </Button>
      </form>
    </div>
  )
}
export default UpdateProject
