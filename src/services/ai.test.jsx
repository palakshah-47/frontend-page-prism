import { TextDecoder, TextEncoder } from 'util'
import { suggestDescription } from './ai'

describe('suggestDescription', () => {
  const originalFetch = global.fetch
  const originalTextDecoder = global.TextDecoder
  const originalTextEncoder = global.TextEncoder

  beforeAll(() => {
    global.TextDecoder = TextDecoder
    global.TextEncoder = TextEncoder
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  afterAll(() => {
    global.TextDecoder = originalTextDecoder
    global.TextEncoder = originalTextEncoder
  })

  it('combines streamed Ollama chunks and reports partial descriptions', async () => {
    const read = jest
      .fn()
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode(
          '{"response":"A thoughtful ","done":false}\n{"response":"portfolio","done":true}\n'
        ),
      })
      .mockResolvedValueOnce({ done: true, value: undefined })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => ({ read }) },
    })
    const onPartial = jest.fn()

    const result = await suggestDescription(
      'Portfolio',
      new AbortController().signal,
      onPartial
    )

    expect(result).toBe('A thoughtful portfolio')
    expect(onPartial).toHaveBeenNthCalledWith(1, 'A thoughtful ')
    expect(onPartial).toHaveBeenNthCalledWith(2, 'A thoughtful portfolio')
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).stream).toBe(true)
  })

  it('returns the generated partial description when the request is aborted', async () => {
    const controller = new AbortController()
    const read = jest
      .fn()
      .mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode(
          '{"response":"A partial description","done":false}\n'
        ),
      })
      .mockImplementationOnce(() => {
        controller.abort()
        return Promise.reject(new DOMException('Aborted', 'AbortError'))
      })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => ({ read }) },
    })

    const result = await suggestDescription(
      'Portfolio',
      controller.signal,
      jest.fn()
    )

    expect(result).toBe('A partial description')
  })
})
