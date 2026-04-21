import type { PropsWithChildren, ThHTMLAttributes, TdHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export const Table = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('w-full overflow-x-auto rounded-xl border border-border-subtle', className)}>
    <table className="w-full border-collapse text-sm">{children}</table>
  </div>
)

export const TableHead = ({ children }: PropsWithChildren) => (
  <thead className="border-b border-border-subtle bg-surface-subtle">{children}</thead>
)

export const TableBody = ({ children }: PropsWithChildren) => (
  <tbody className="divide-y divide-border-subtle">{children}</tbody>
)

export const TableRow = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <tr className={cn('transition hover:bg-surface-subtle/60', className)}>{children}</tr>
)

export const TableHeader = ({
  children,
  className,
  ...props
}: PropsWithChildren<{ className?: string } & ThHTMLAttributes<HTMLTableCellElement>>) => (
  <th
    className={cn(
      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary',
      className,
    )}
    {...props}
  >
    {children}
  </th>
)

export const TableCell = ({
  children,
  className,
  ...props
}: PropsWithChildren<{ className?: string } & TdHTMLAttributes<HTMLTableCellElement>>) => (
  <td className={cn('px-4 py-3 text-text-primary', className)} {...props}>
    {children}
  </td>
)
