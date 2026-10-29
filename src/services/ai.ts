const MAX_DESCRIPTION_LENGTH = 300

export async function suggestDescription(name: string): Promise<string> {
  const projectName = name.trim()
  if (!projectName) {
    throw new Error('Project name is required')
  }

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'tinyllama',
      prompt: `Write one concise description for a design project named "${projectName}". Return only the description as plain text.`,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama request failed (${response.status})`)
  }

  const payload: unknown = await response.json()
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('response' in payload) ||
    typeof payload.response !== 'string'
  ) {
    throw new Error('Ollama returned an invalid response')
  }

  const description = payload.response.trim().slice(0, MAX_DESCRIPTION_LENGTH)
  if (!description) {
    throw new Error('Ollama returned an empty description')
  }

  return description
}
