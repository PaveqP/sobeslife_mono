import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen, MessageSquare, LogOut, Shield, BarChart3, ShieldCheck, HelpCircle } from 'lucide-react'
import { useAppDispatch } from '@/app/store'
import { clearCredentials } from '@/features/auth/auth-slice'
import { ThemeToggle } from '@/shared/theme/theme-provider'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'

const navItems = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Пользователи', icon: Users, end: false },
  { to: '/tests', label: 'Тесты', icon: BookOpen, end: false },
  { to: '/interviews', label: 'Собеседования', icon: MessageSquare, end: false },
  { to: '/analytics', label: 'Аналитика', icon: BarChart3, end: false },
  { to: '/admins', label: 'Администраторы', icon: ShieldCheck, end: false },
  { to: '/questions', label: 'Вопросы', icon: HelpCircle, end: false },
]

export const AdminLayout = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(clearCredentials())
    navigate('/sign-in')
  }

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border-subtle bg-surface">
        <div className="flex h-14 items-center gap-2.5 border-b border-border-subtle px-5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-accent-soft">
            <Shield className="size-4 text-accent" />
          </div>
          <Link to="/" className="text-base font-bold text-text-primary">
            Admin Panel
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Управление
          </p>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1.5 border-t border-border-subtle p-2">
          <ThemeToggle className="w-full text-xs" />
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="size-4" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex flex-1 flex-col overflow-auto">
        <div className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
