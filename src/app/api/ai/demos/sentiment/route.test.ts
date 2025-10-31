import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'

// Use vi.hoisted to ensure the mock function is created before it's used in vi.mock
const { mockFn } = vi.hoisted(() => {
  return {
    mockFn: vi.fn()
  }
})

// Mock the AI providers to prevent OpenAI client instantiation
vi.mock('@/lib/ai/providers', () => ({
  openai: {},
  anthropic: {},
  google: {},
  mistral: {},
  aiConfig: {},
}))

// Mock the sentiment analysis module
vi.mock('@/lib/ai/demos', () => ({
  analyzeSentiment: mockFn,
}))

// Helper function to create a mock NextRequest
const createMockRequest = (body: any): NextRequest => {
  const url = 'http://localhost:3000/api/ai/demos/sentiment'
  const request = new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  })
  return request
}

describe('/api/ai/demos/sentiment', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST', () => {
    it('analyzes sentiment successfully with valid input', async () => {
      const mockResult = {
        sentiment: 'positive',
        confidence: 0.95,
        scores: {
          positive: 0.95,
          negative: 0.03,
          neutral: 0.02,
        },
      }

      mockFn.mockResolvedValue(mockResult)

      const request = createMockRequest({
        text: 'I love this product! It works amazingly well.',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
      expect(mockFn).toHaveBeenCalledWith(
        'I love this product! It works amazingly well.'
      )
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('analyzes negative sentiment correctly', async () => {
      const mockResult = {
        sentiment: 'negative',
        confidence: 0.87,
        scores: {
          positive: 0.05,
          negative: 0.87,
          neutral: 0.08,
        },
      }

      mockFn.mockResolvedValue(mockResult)

      const request = createMockRequest({
        text: 'This is terrible and I hate it completely.',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
      expect(mockFn).toHaveBeenCalledWith(
        'This is terrible and I hate it completely.'
      )
    })

    it('analyzes neutral sentiment correctly', async () => {
      const mockResult = {
        sentiment: 'neutral',
        confidence: 0.72,
        scores: {
          positive: 0.14,
          negative: 0.14,
          neutral: 0.72,
        },
      }

      mockFn.mockResolvedValue(mockResult)

      const request = createMockRequest({
        text: 'The weather is cloudy today.',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
      expect(mockFn).toHaveBeenCalledWith(
        'The weather is cloudy today.'
      )
    })

    it('rejects empty text input', async () => {
      const request = createMockRequest({
        text: '',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
      expect(data.details).toBeDefined()
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('rejects missing text field', async () => {
      const request = createMockRequest({
        // Missing text field
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
      expect(data.details).toBeDefined()
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('rejects text that is too long', async () => {
      const longText = 'a'.repeat(5001) // Exceeds 5000 character limit

      const request = createMockRequest({
        text: longText,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
      expect(data.details).toBeDefined()
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('accepts text at maximum length', async () => {
      const maxText = 'a'.repeat(5000) // Exactly 5000 characters

      const mockResult = {
        sentiment: 'neutral',
        confidence: 0.6,
        scores: { positive: 0.2, negative: 0.2, neutral: 0.6 },
      }

      mockFn.mockResolvedValue(mockResult)

      const request = createMockRequest({
        text: maxText,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
      expect(mockFn).toHaveBeenCalledWith(maxText)
    })

    it('rejects non-string text input', async () => {
      const request = createMockRequest({
        text: 123, // Number instead of string
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid request data')
      expect(data.details).toBeDefined()
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('handles sentiment analysis service errors', async () => {
      mockFn.mockRejectedValue(new Error('AI service unavailable'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest({
        text: 'This should cause an error.',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Sentiment analysis failed')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Sentiment analysis error:',
        expect.any(Error)
      )
      expect(mockFn).toHaveBeenCalledWith('This should cause an error.')

      consoleSpy.mockRestore()
    })

    it('handles malformed JSON requests', async () => {
      const url = 'http://localhost:3000/api/ai/demos/sentiment'
      const request = new NextRequest(url, {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Sentiment analysis failed')
      expect(mockFn).not.toHaveBeenCalled()
    })

    it('handles special characters and emojis in text', async () => {
      const textWithEmojis = '😊 I love this! 🎉 Amazing work! 💯'
      
      const mockResult = {
        sentiment: 'positive',
        confidence: 0.98,
        scores: {
          positive: 0.98,
          negative: 0.01,
          neutral: 0.01,
        },
      }

      mockFn.mockResolvedValue(mockResult)

      const request = createMockRequest({
        text: textWithEmojis,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
      expect(mockFn).toHaveBeenCalledWith(textWithEmojis)
    })

    it('handles multi-language text', async () => {
      const multiLanguageText = 'Bonjour! Hello! Hola! こんにちは!'
      
      const mockResult = {
        sentiment: 'positive',
        confidence: 0.75,
        scores: {
          positive: 0.75,
          negative: 0.10,
          neutral: 0.15,
        },
      }

      mockFn.mockResolvedValue(mockResult)

      const request = createMockRequest({
        text: multiLanguageText,
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockResult)
      expect(mockFn).toHaveBeenCalledWith(multiLanguageText)
    })

    it('handles whitespace-only text', async () => {
      const request = createMockRequest({
        text: '   \n\t   ',
      })

      const response = await POST(request)
      const data = await response.json()

      // Depending on implementation, this might be handled as empty text
      // or processed as neutral sentiment
      if (response.status === 400) {
        expect(data.error).toBe('Invalid request data')
        expect(mockFn).not.toHaveBeenCalled()
      } else {
        expect(response.status).toBe(200)
        expect(mockFn).toHaveBeenCalled()
      }
    })
  })

  describe('Error logging', () => {
    it('logs validation errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest({
        text: '', // Invalid empty text
      })

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sentiment analysis error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('logs service errors', async () => {
      mockFn.mockRejectedValue(new Error('Service error'))
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const request = createMockRequest({
        text: 'Valid text',
      })

      await POST(request)

      expect(consoleSpy).toHaveBeenCalledWith(
        'Sentiment analysis error:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })
})