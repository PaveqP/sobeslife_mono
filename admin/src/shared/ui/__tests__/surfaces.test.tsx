import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge, Card, EmptyState, Skeleton } from '../surfaces'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Junior</Badge>)
    expect(screen.getByText('Junior')).toBeInTheDocument()
  })

  it('applies accent tone class', () => {
    render(<Badge tone="accent">Accent</Badge>)
    expect(screen.getByText('Accent').className).toContain('text-accent')
  })

  it('applies success tone class', () => {
    render(<Badge tone="success">OK</Badge>)
    expect(screen.getByText('OK').className).toContain('text-success')
  })

  it('applies danger tone class', () => {
    render(<Badge tone="danger">Error</Badge>)
    expect(screen.getByText('Error').className).toContain('text-danger')
  })
})

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No data" description="Nothing here yet." />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()
  })
})

describe('Skeleton', () => {
  it('renders with animate-pulse class', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })
})
