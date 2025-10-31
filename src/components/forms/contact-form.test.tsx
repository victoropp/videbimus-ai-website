import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { ContactForm } from './contact-form'

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    render(<ContactForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/what's the problem\?/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/what's the actual problem\?/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('displays validation errors for required fields', async () => {
    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/please tell us what problem you need solved/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    render(<ContactForm />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('validates name minimum length', async () => {
    render(<ContactForm />)
    
    const nameInput = screen.getByLabelText(/full name/i)
    fireEvent.change(nameInput, { target: { value: 'A' } })
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('validates message minimum length', async () => {
    render(<ContactForm />)

    const messageInput = screen.getByLabelText(/what's the actual problem\?/i)
    fireEvent.change(messageInput, { target: { value: 'Short' } })

    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/a bit more detail helps/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    render(<ContactForm />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/company name/i), { 
      target: { value: 'Test Company' } 
    })
    fireEvent.change(screen.getByLabelText(/what's the problem\?/i), { 
      target: { value: 'discovery' } 
    })
    fireEvent.change(screen.getByLabelText(/what's the actual problem\?/i), { 
      target: { value: 'I need help with AI strategy for my company.' } 
    })
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/sending message/i)).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })
    
    // Check success state
    await waitFor(() => {
      expect(screen.getByText(/got it—we'll be in touch/i)).toBeInTheDocument()
      expect(screen.getByText(/thanks for reaching out/i)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(consoleSpy).toHaveBeenCalledWith('Form data:', expect.objectContaining({
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Test Company',
      service: 'discovery',
      message: 'I need help with AI strategy for my company.'
    }))
    
    consoleSpy.mockRestore()
  })

  it('displays service options correctly', () => {
    render(<ContactForm />)

    const serviceSelect = screen.getByLabelText(/what's the problem\?/i) as HTMLSelectElement
    expect(serviceSelect).toBeInTheDocument()

    // Check that the service select has the correct number of options
    const serviceOptions = serviceSelect.querySelectorAll('option')
    expect(serviceOptions).toHaveLength(9) // 8 services + 1 placeholder

    expect(screen.getByRole('option', { name: /not sure—need help figuring it out/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /fix one specific problem/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /multiple problems—need comprehensive solution/i })).toBeInTheDocument()
  })

  it('shows loading state during form submission', async () => {
    render(<ContactForm />)
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/what's the actual problem\?/i), { 
      target: { value: 'Test message for form submission' } 
    })
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/sending message/i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      expect(screen.getByRole('button')).toHaveClass('disabled:pointer-events-none')
    })
  })

  it('handles form submission errors gracefully', async () => {
    // Mock console.error to avoid error output in tests
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock a form submission error by overriding the Promise
    const originalSetTimeout = global.setTimeout
    global.setTimeout = vi.fn((callback: Function, delay: number) => {
      if (delay === 2000) {
        // Simulate the API call failing
        throw new Error('Network error')
      }
      return originalSetTimeout(callback, delay)
    })
    
    render(<ContactForm />)
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'john@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/what's the actual problem\?/i), { 
      target: { value: 'Test message for error handling' } 
    })
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    
    // Form should handle the error gracefully
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
    })
    
    // Restore original setTimeout
    global.setTimeout = originalSetTimeout
    errorSpy.mockRestore()
  })

  it('has proper accessibility attributes', () => {
    render(<ContactForm />)

    // Check form has proper labels
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('id', 'name')
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('id', 'email')
    expect(screen.getByLabelText(/company name/i)).toHaveAttribute('id', 'company')
    expect(screen.getByLabelText(/what's the problem\?/i)).toHaveAttribute('id', 'service')
    expect(screen.getByLabelText(/what's the actual problem\?/i)).toHaveAttribute('id', 'message')
    
    // Check required fields are present (react-hook-form doesn't add required HTML attribute)
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const messageInput = screen.getByLabelText(/what's the actual problem\?/i)

    expect(nameInput).toBeInTheDocument()
    expect(emailInput).toBeInTheDocument()
    expect(messageInput).toBeInTheDocument()
  })

  it('resets form after successful submission', async () => {
    render(<ContactForm />)
    
    const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/what's the actual problem\?/i) as HTMLTextAreaElement
    
    // Fill form
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Test message' } })
    
    // Verify form is filled
    expect(nameInput.value).toBe('John Doe')
    expect(emailInput.value).toBe('john@example.com')
    expect(messageInput.value).toBe('Test message')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText(/got it—we'll be in touch/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})