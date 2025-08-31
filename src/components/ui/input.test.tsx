import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Input } from './input'

describe('Input', () => {
  it('renders correctly with default props', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass(
      'flex',
      'h-9',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-transparent',
      'px-3',
      'py-1',
      'text-sm'
    )
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test input' } })
    
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({
        value: 'test input'
      })
    }))
  })

  it('applies different input types correctly', () => {
    const { rerender } = render(<Input type="email" />)
    let input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" />)
    input = screen.getByLabelText('', { selector: 'input[type="password"]' })
    expect(input).toHaveAttribute('type', 'password')
    
    rerender(<Input type="number" />)
    input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('handles placeholder correctly', () => {
    render(<Input placeholder="Enter your name" />)
    
    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('handles required state', () => {
    render(<Input required />)
    
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)
    
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('handles focus and blur events', () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })

  it('handles keyboard events', () => {
    const handleKeyDown = vi.fn()
    const handleKeyUp = vi.fn()
    render(<Input onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({
      key: 'Enter'
    }))
    
    fireEvent.keyUp(input, { key: 'Enter' })
    expect(handleKeyUp).toHaveBeenCalledWith(expect.objectContaining({
      key: 'Enter'
    }))
  })

  it('supports controlled input', () => {
    const { rerender } = render(<Input value="initial" readOnly />)
    
    let input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('initial')
    
    rerender(<Input value="updated" readOnly />)
    input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('updated')
  })

  it('has proper accessibility attributes', () => {
    render(
      <Input
        aria-label="Test input"
        aria-describedby="helper-text"
        aria-invalid="true"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-label', 'Test input')
    expect(input).toHaveAttribute('aria-describedby', 'helper-text')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('handles input validation states', () => {
    render(<Input className="border-red-500" aria-invalid="true" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})