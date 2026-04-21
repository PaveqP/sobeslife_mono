import type { PropsWithChildren } from 'react'
import { cn } from '@/shared/lib/cn'

export const Card = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <div
    className={cn(
      'rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]',
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
  const toneClass = {
    neutral: 'bg-surface-subtle text-text-secondary',
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
  }[tone]

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', toneClass, className)}>
      {children}
    </span>
  )
}

export const EmptyState = ({ title, description, className }: { title: string; description: string; className?: string }) => (
  <Card className={cn('flex min-h-48 flex-col items-center justify-center gap-3 text-center', className)}>
    <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
    <p className="max-w-md text-sm text-text-secondary">{description}</p>
  </Card>
)

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-surface-subtle', className)} />
)
