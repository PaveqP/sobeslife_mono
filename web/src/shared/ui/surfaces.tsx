import type { PropsWithChildren } from 'react'
import { cn } from '@/shared/lib/cn'

export const Card = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      'rounded-3xl border border-border-subtle bg-surface p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]',
      className,
    )}
  >
    {children}
  </div>
)

export const Badge = ({
  className,
  tone = 'neutral',
  children,
}: PropsWithChildren<{ className?: string; tone?: 'neutral' | 'accent' | 'success' | 'danger' }>) => {
  const toneClassName = {
    neutral: 'bg-surface-subtle text-text-secondary',
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
  }[tone]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        toneClassName,
        className,
      )}
    >
      {children}
    </span>
  )
}

export const EmptyState = ({
  title,
  description,
  className,
}: {
  title: string
  description: string
  className?: string
}) => (
  <Card className={cn('flex min-h-64 flex-col items-center justify-center gap-3 text-center', className)}>
    <div className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
      Sobeslife
    </div>
    <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
    <p className="max-w-md text-sm text-text-secondary">{description}</p>
  </Card>
)

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-2xl bg-surface-subtle', className)} />
)
