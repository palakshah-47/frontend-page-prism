import { suggestDescription } from './ai'

describe('suggestDescription', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('returns a description from a non-streaming Ollama response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        response: 'A thoughtful portfolio project.',
      }),
    })

    await expect(suggestDescription(' Portfolio ')).resolves.toBe(
      'A thoughtful portfolio project.'
    )
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"stream":false'),
      })
    )
  })
})
