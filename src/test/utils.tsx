/**
 * Test Utilities
 *
 * Provides custom render functions and utilities for testing React components
 * with all necessary providers and context.
 */

import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import RootProviders from '@/components/providers/root-providers'

/**
 * Custom render function that wraps components with all providers
 *
 * @example
 * ```tsx
 * import { render, screen } from '@/test/utils'
 *
 * render(<MyComponent />)
 * expect(screen.getByText('Hello')).toBeInTheDocument()
 * ```
 */
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <RootProviders>
        {children}
      </RootProviders>
    ),
    ...options,
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'

// Re-export render as the default export
export { render as default }
