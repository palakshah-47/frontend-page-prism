const MAX_DESCRIPTION_LENGTH = 300

export async function suggestDescription(
  name: string,
  signal: AbortSignal,
  onPartial: (description: string) => void
): Promise<string> {
  const projectName = name.trim()
  if (!projectName) {
    throw new Error('Project name is required')
  }

  let description = ''

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: 'tinyllama',
        prompt: `Write one concise description for a design project named "${projectName}". Return only the description as plain text.`,
        stream: true,
      }),
    })
    if (!response.ok) {
      throw new Error(`Ollama request failed (${response.status})`)
    }
    if (!response.body) {
      throw new Error('Ollama response did not include a readable stream')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let isComplete = false

    const readLine = (line: string) => {
      if (!line.trim()) return

      const payload: unknown = JSON.parse(line)
      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('response' in payload) ||
        typeof payload.response !== 'string'
      ) {
        throw new Error('Ollama returned an invalid response')
      }

      if (payload.response) {
        description = (description + payload.response).slice(
          0,
          MAX_DESCRIPTION_LENGTH
        )
        onPartial(description)
      }
      isComplete =
        'done' in payload && typeof payload.done === 'boolean' && payload.done
    }

    while (!isComplete) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      lines.forEach(readLine)
      if (done) break
    }
    if (buffer.trim()) readLine(buffer)

    if (signal.aborted) return description.trim()
    if (!description.trim()) {
      throw new Error('Ollama returned an empty description')
    }
    return description.trim()
  } catch (error) {
    if (signal.aborted) return description.trim()
    throw error
  }
}
