import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Mock session for tests
const mockSession = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    image: null,
  },
  expires: '9999-12-31T23:59:59.999Z',
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any
  queryClient?: QueryClient
}

function customRender(
  ui: ReactElement,
  {
    session = mockSession,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </QueryClientProvider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions })
}

// Override the default render with our custom one
export { customRender as render }

// Mock implementations for common services
export const mockServices = {
  email: {
    sendContactNotification: vi.fn().mockResolvedValue(true),
    sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  },
  ai: {
    chatCompletion: vi.fn().mockResolvedValue({
      content: 'Mock AI response',
      tokens: 100,
    }),
    generateEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  },
  storage: {
    uploadFile: vi.fn().mockResolvedValue({ key: 'test-file.jpg', url: 'https://example.com/test-file.jpg' }),
    deleteFile: vi.fn().mockResolvedValue(true),
  },
}

// Common test utilities
export const waitForLoadingToFinish = () => 
  waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument()
  expect(element).toHaveTextContent(text)
}

// Mock Next.js router
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  isFallback: false,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
}

// Mock fetch
export const mockFetch = (responseData: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(responseData),
    text: () => Promise.resolve(JSON.stringify(responseData)),
    headers: new Headers(),
  })
}

// Mock localStorage
export const mockLocalStorage = () => {
  const storage: Record<string, string> = {}
  
  global.localStorage = {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key]
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    }),
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
    length: Object.keys(storage).length,
  }
}

// Re-export vitest functions for convenience
import { vi } from 'vitest'
export { vi }