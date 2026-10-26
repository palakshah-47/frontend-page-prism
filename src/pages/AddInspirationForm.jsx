import { useState } from 'react'
import Button from '../components/Button'
import { normalizeUrl } from '../utils/stringUtils'

const AddInspirationForm = ({ onAdd }) => {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = normalizeUrl(value)
    if (!url) {
      setError('Enter a valid URL, e.g. stripe.com')
      return
    }
    setError('')
    setIsSaving(true)
    try {
      await onAdd(url)
      setValue('')
    } catch {
      setError('Could not add this inspiration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex gap-2">
      <label htmlFor="inspiration-url" className="p-2">
        Website URL
      </label>
      <input
        id="inspiration-url"
        type="url"
        value={value}
        placeholder="Paste a URL for inspiration"
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'inspiration-error' : undefined}
        className="rounded border border-gray-300 bg-white p-2 text-gray-900"
      ></input>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Adding' : 'Add'}
      </Button>
      {error && (
        <p id="inspiration-error" role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}

export default AddInspirationForm
