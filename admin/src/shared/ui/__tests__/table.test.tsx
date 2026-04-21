import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../table'

describe('Table', () => {
  it('renders a table with headers and cells', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Email</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>john@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders table element', () => {
    const { container } = render(<Table><TableBody /></Table>)
    expect(container.querySelector('table')).toBeInTheDocument()
  })
})
