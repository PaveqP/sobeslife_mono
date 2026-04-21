import { Users, BookOpen, MessageSquare, Activity, TrendingUp, UserCheck, CheckCircle } from 'lucide-react'
import { useGetStatsQuery } from '@/shared/api/admin-api'
import { Card, Skeleton } from '@/shared/ui/surfaces'

const StatCard = ({
  label,
  value,
  icon: Icon,
  loading,
  tone = 'accent',
}: {
  label: string
  value: number | undefined
  icon: React.ElementType
  loading: boolean
  tone?: 'accent' | 'success' | 'danger' | 'neutral'
}) => {
  const toneClass = {
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    neutral: 'bg-surface-subtle text-text-secondary',
  }[tone]

  return (
    <Card className="flex items-center gap-4">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-text-secondary">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-16" />
        ) : (
          <p className="text-2xl font-bold text-text-primary">{value ?? 0}</p>
        )}
      </div>
    </Card>
  )
}

const TodayRow = ({
  label,
  value,
  loading,
  max,
}: {
  label: string
  value: number
  loading: boolean
  max: number
}) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        {loading ? (
          <Skeleton className="h-4 w-8" />
        ) : (
          <span className="font-semibold text-text-primary">{value}</span>
        )}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: loading ? '0%' : `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  )
}

export const DashboardPage = () => {
  const { data: stats, isLoading } = useGetStatsQuery()

  const todayMax = Math.max(
    stats?.new_users_today ?? 0,
    stats?.interviews_started_today ?? 0,
    stats?.interviews_completed_today ?? 0,
    stats?.completed_tests_today ?? 0,
    1,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Дашборд</h1>
        <p className="text-sm text-text-secondary">Обзор платформы Sobeslife</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Пользователей" value={stats?.total_users} icon={Users} loading={isLoading} />
        <StatCard label="Тестов" value={stats?.total_tests} icon={BookOpen} loading={isLoading} tone="neutral" />
        <StatCard label="Собеседований" value={stats?.total_interviews} icon={MessageSquare} loading={isLoading} tone="neutral" />
        <StatCard label="Активных сейчас" value={stats?.active_interviews} icon={Activity} loading={isLoading} tone="success" />
      </div>

      {/* Today's activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">Активность сегодня</h2>
          </div>
          <div className="space-y-4">
            <TodayRow
              label="Новых пользователей"
              value={stats?.new_users_today ?? 0}
              loading={isLoading}
              max={todayMax}
            />
            <TodayRow
              label="Собеседований начато"
              value={stats?.interviews_started_today ?? 0}
              loading={isLoading}
              max={todayMax}
            />
            <TodayRow
              label="Собеседований завершено"
              value={stats?.interviews_completed_today ?? 0}
              loading={isLoading}
              max={todayMax}
            />
            <TodayRow
              label="Тестов пройдено"
              value={stats?.completed_tests_today ?? 0}
              loading={isLoading}
              max={todayMax}
            />
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-success" />
            <h2 className="text-base font-semibold text-text-primary">Сводка за сегодня</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Новых пользователей', value: stats?.new_users_today ?? 0, icon: UserCheck, tone: 'accent' },
              { label: 'Тестов пройдено', value: stats?.completed_tests_today ?? 0, icon: BookOpen, tone: 'success' },
              { label: 'Собеседований начато', value: stats?.interviews_started_today ?? 0, icon: MessageSquare, tone: 'neutral' },
              { label: 'Собеседований завершено', value: stats?.interviews_completed_today ?? 0, icon: CheckCircle, tone: 'success' },
            ].map(({ label, value, icon: Icon, tone }) => {
              const cls = { accent: 'bg-accent-soft text-accent', success: 'bg-success-soft text-success', neutral: 'bg-surface-subtle text-text-secondary' }[tone]!
              return (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-border-subtle p-3">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${cls}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs text-text-secondary">{label}</p>
                    {isLoading ? (
                      <Skeleton className="mt-0.5 h-5 w-8" />
                    ) : (
                      <p className="text-lg font-bold text-text-primary">{value}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
