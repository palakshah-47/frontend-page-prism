import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { createProject, updateProject } from '../services/project'
import { useState, useRef, useEffect } from 'react'

const AddProject = ({ project, setProjects }) => {
  const nameRef = useRef(null)
  const descriptionRef = useRef(null)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!project) return
    nameRef.current.value = project.name
    descriptionRef.current.value = project.description
  }, [project])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nameRef.current.value.trim()) {
      setError('Project Name is required')
      nameRef.current.focus()
      return
    }
    setError('')
    setIsSaving(true)
    if (!project) {
      try {
        const createdProject = await createProject({
          name: nameRef.current.value.trim(),
          description: descriptionRef.current.value.trim(),
          inspirations: [],
        })
        setProjects((prev) => [...prev, createdProject])
        nameRef.current.value = ''
        descriptionRef.current.value = ''
      } catch (err) {
        setError('Could not create a Project. Please try again')
      } finally {
        setIsSaving(false)
      }
    } else {
      if (!project.id) {
        setError('Project id is not valid')
        return
      }
      try {
        await updateProject(project.id, {
          name: nameRef.current.value,
          description: descriptionRef.current.value,
        })
        navigate('/projects')
      } catch (err) {
        setError('Could not update the Project. Please try again.')
      } finally {
        setIsSaving(false)
      }
    }
  }

  const buttonTxt = project ? 'Update Project' : 'Create Project'
  const buttonLabel = project ? 'Saving...' : 'Creating...'

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
            ref={nameRef}
            // onChange={(e) => setName(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'project-error' : undefined}
            className="mt-1 w-[50%] border rounded bg-white border-gray-300 text-gray-900 p-2"
          ></input>
        </div>
        <div>
          <label htmlFor="project-desc" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="project-desc"
            ref={descriptionRef}
            // onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-[50%] border rounded bg-white"
          ></textarea>
        </div>
        {error && (
          <p id="project-error" role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isSaving} className="">
          {isSaving ? buttonLabel : buttonTxt}
        </Button>
      </form>
    </div>
  )
}

export default AddProject
