import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type FieldProps = {
  label: string
  hint?: string
  error?: string
  className?: string
}

export const Input = ({
  label,
  hint,
  error,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) => (
  <label className={cn('flex flex-col gap-1.5', className)}>
    <span className="text-sm font-medium text-text-primary">{label}</span>
    <input
      className="h-9 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20"
      {...props}
    />
    {error ? (
      <span className="text-xs text-danger">{error}</span>
    ) : hint ? (
      <span className="text-xs text-text-tertiary">{hint}</span>
    ) : null}
  </label>
)

export const Select = ({
  label,
  hint,
  error,
  className,
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) => (
  <label className={cn('flex flex-col gap-1.5', className)}>
    <span className="text-sm font-medium text-text-primary">{label}</span>
    <select
      className="h-9 rounded-lg border border-border-subtle bg-surface px-3 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      {...props}
    >
      {children}
    </select>
    {error ? (
      <span className="text-xs text-danger">{error}</span>
    ) : hint ? (
      <span className="text-xs text-text-tertiary">{hint}</span>
    ) : null}
  </label>
)

export const Textarea = ({
  label,
  hint,
  error,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <label className={cn('flex flex-col gap-1.5', className)}>
    <span className="text-sm font-medium text-text-primary">{label}</span>
    <textarea
      className="min-h-24 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/20"
      {...props}
    />
    {error ? (
      <span className="text-xs text-danger">{error}</span>
    ) : hint ? (
      <span className="text-xs text-text-tertiary">{hint}</span>
    ) : null}
  </label>
)
