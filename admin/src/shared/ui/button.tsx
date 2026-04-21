import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const buttonVariants = cva(
  'btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'border-accent bg-accent text-white hover:bg-accent-strong',
        secondary:
          'border-border-subtle bg-surface text-text-primary shadow-sm hover:border-border-strong hover:bg-surface-hover',
        ghost: 'border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        danger: 'border-danger bg-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-5',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

export const Button = ({ className, variant, size, loading = false, children, disabled, ...props }: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size }), className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
    {children}
  </button>
)
