import { BarChart3, TrendingUp, Users, MessageSquare, BookOpen, Target, Award } from 'lucide-react'
import { useGetAnalyticsQuery } from '@/shared/api/admin-api'
import type { DailyCount, LevelCount, ProfessionCount, ProfessionPassRate } from '@/shared/api/types'
import { Card, Skeleton } from '@/shared/ui/surfaces'

// ── Mini bar chart (CSS only) ─────────────────────────────────────────────────

const BarChart = ({
  data,
  color = 'bg-accent',
  height = 64,
}: {
  data: DailyCount[]
  color?: string
  height?: number
}) => {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((d) => {
        const pct = (d.count / max) * 100
        return (
          <div key={d.date} className="group relative flex-1" style={{ height: '100%' }}>
            <div
              className={`absolute bottom-0 w-full rounded-t-sm ${color} opacity-80 transition-all group-hover:opacity-100`}
              style={{ height: `${Math.max(pct, d.count > 0 ? 4 : 1)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded bg-surface-subtle px-1.5 py-0.5 text-xs text-text-primary shadow group-hover:block whitespace-nowrap z-10">
              {d.date}: {d.count}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const HBar = ({
  label,
  value,
  max,
  color = 'bg-accent',
  suffix = '',
}: {
  label: string
  value: number
  max: number
  color?: string
  suffix?: string
}) => {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="truncate text-text-secondary max-w-[60%]" title={label}>{label}</span>
        <span className="font-semibold text-text-primary shrink-0">{value}{suffix}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-subtle">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${Math.max(pct, value > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  )
}

const StatBox = ({
  label,
  value,
  icon: Icon,
  tone = 'accent',
  loading,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  tone?: 'accent' | 'success' | 'danger' | 'neutral'
  loading: boolean
}) => {
  const cls = {
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    neutral: 'bg-surface-subtle text-text-secondary',
  }[tone]
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${cls}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        {loading ? <Skeleton className="mt-1 h-6 w-14" /> : (
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        )}
      </div>
    </Card>
  )
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-base font-semibold text-text-primary">{children}</h2>
)

const levelOrder = ['trainee', 'junior', 'middle', 'senior']
const sortedLevels = (data: LevelCount[]) =>
  [...data].sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level))

export const AnalyticsPage = () => {
  const { data: a, isLoading } = useGetAnalyticsQuery()

  const maxProfCount = Math.max(...(a?.interviews_by_profession ?? []).map((p) => p.count), 1)
  const maxLevelCount = Math.max(...(a?.interviews_by_level ?? []).map((l) => l.count), 1)
  const maxTestLevel = Math.max(...(a?.tests_by_level ?? []).map((l) => l.count), 1)
  const maxPassRate = 100

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Аналитика</h1>
          <p className="text-sm text-text-secondary">Загрузка данных...</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-soft">
          <BarChart3 className="size-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Аналитика</h1>
          <p className="text-sm text-text-secondary">Полная статистика платформы</p>
        </div>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <SectionTitle>Общие показатели</SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatBox label="Пользователей" value={a?.total_users ?? 0} icon={Users} loading={false} />
          <StatBox label="Всего тестов" value={a?.total_tests ?? 0} icon={BookOpen} tone="neutral" loading={false} />
          <StatBox label="Всего собеседований" value={a?.total_interviews ?? 0} icon={MessageSquare} tone="neutral" loading={false} />
          <StatBox label="Процент успеха" value={`${(a?.overall_pass_rate ?? 0).toFixed(1)}%`} icon={Award} tone="success" loading={false} />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatBox label="Прошли собеседование" value={a?.passed_interviews ?? 0} icon={Target} tone="success" loading={false} />
          <StatBox label="Не прошли" value={a?.failed_interviews ?? 0} icon={Target} tone="danger" loading={false} />
          <StatBox label="Тестов завершено" value={a?.completed_tests ?? 0} icon={BookOpen} tone="accent" loading={false} />
          <StatBox label="Новых сегодня" value={a?.new_users_today ?? 0} icon={Users} tone="accent" loading={false} />
        </div>
      </section>

      {/* Daily charts */}
      <section className="space-y-4">
        <SectionTitle>Активность за 14 дней</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-accent" />
              <p className="text-sm font-medium text-text-primary">Собеседования</p>
            </div>
            {(a?.daily_interviews?.length ?? 0) > 0 ? (
              <>
                <BarChart data={a!.daily_interviews} color="bg-accent" height={72} />
                <div className="flex justify-between text-xs text-text-tertiary">
                  <span>{a!.daily_interviews[0]?.date}</span>
                  <span>{a!.daily_interviews[a!.daily_interviews.length - 1]?.date}</span>
                </div>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-text-tertiary">Нет данных</p>
            )}
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-success" />
              <p className="text-sm font-medium text-text-primary">Пройдено тестов</p>
            </div>
            {(a?.daily_test_completes?.length ?? 0) > 0 ? (
              <>
                <BarChart data={a!.daily_test_completes} color="bg-success" height={72} />
                <div className="flex justify-between text-xs text-text-tertiary">
                  <span>{a!.daily_test_completes[0]?.date}</span>
                  <span>{a!.daily_test_completes[a!.daily_test_completes.length - 1]?.date}</span>
                </div>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-text-tertiary">Нет данных</p>
            )}
          </Card>

          <Card className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-[color:var(--color-warning,#f59e0b)]" />
              <p className="text-sm font-medium text-text-primary">Новые пользователи</p>
            </div>
            {(a?.daily_new_users?.length ?? 0) > 0 ? (
              <>
                <BarChart data={a!.daily_new_users} color="bg-amber-400" height={72} />
                <div className="flex justify-between text-xs text-text-tertiary">
                  <span>{a!.daily_new_users[0]?.date}</span>
                  <span>{a!.daily_new_users[a!.daily_new_users.length - 1]?.date}</span>
                </div>
              </>
            ) : (
              <p className="py-6 text-center text-sm text-text-tertiary">Нет данных</p>
            )}
          </Card>
        </div>
      </section>

      {/* Distributions */}
      <section className="space-y-4">
        <SectionTitle>Распределения</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Interviews by profession */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-accent" />
              <p className="text-sm font-medium text-text-primary">Собеседования по профессиям</p>
            </div>
            {(a?.interviews_by_profession?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-sm text-text-tertiary">Нет данных</p>
            ) : (
              <div className="space-y-3">
                {(a?.interviews_by_profession ?? []).map((p: ProfessionCount) => (
                  <HBar key={p.profession} label={p.profession} value={p.count} max={maxProfCount} />
                ))}
              </div>
            )}
          </Card>

          {/* Interviews by level */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-accent" />
              <p className="text-sm font-medium text-text-primary">Собеседования по уровням</p>
            </div>
            {(a?.interviews_by_level?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-sm text-text-tertiary">Нет данных</p>
            ) : (
              <div className="space-y-3">
                {sortedLevels(a?.interviews_by_level ?? []).map((l: LevelCount) => (
                  <HBar key={l.level} label={l.level} value={l.count} max={maxLevelCount} color="bg-accent" />
                ))}
              </div>
            )}
          </Card>

          {/* Tests by level */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-success" />
              <p className="text-sm font-medium text-text-primary">Завершённые тесты по уровням</p>
            </div>
            {(a?.tests_by_level?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-sm text-text-tertiary">Нет данных</p>
            ) : (
              <div className="space-y-3">
                {sortedLevels(a?.tests_by_level ?? []).map((l: LevelCount) => (
                  <HBar key={l.level} label={l.level} value={l.count} max={maxTestLevel} color="bg-success" />
                ))}
              </div>
            )}
          </Card>

          {/* Pass rate by profession */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="size-4 text-success" />
              <p className="text-sm font-medium text-text-primary">Процент успеха по профессиям</p>
            </div>
            {(a?.pass_rate_by_profession?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-sm text-text-tertiary">Нет данных</p>
            ) : (
              <div className="space-y-3">
                {(a?.pass_rate_by_profession ?? []).map((p: ProfessionPassRate) => (
                  <HBar
                    key={p.profession}
                    label={`${p.profession} (${p.passed}/${p.total})`}
                    value={Math.round(p.pass_rate)}
                    max={maxPassRate}
                    color={p.pass_rate >= 70 ? 'bg-success' : p.pass_rate >= 40 ? 'bg-accent' : 'bg-danger'}
                    suffix="%"
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Today summary */}
      <section className="space-y-4">
        <SectionTitle>Сегодня</SectionTitle>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatBox label="Новых пользователей" value={a?.new_users_today ?? 0} icon={Users} tone="accent" loading={false} />
          <StatBox label="Тестов пройдено" value={a?.tests_completed_today ?? 0} icon={BookOpen} tone="success" loading={false} />
          <StatBox label="Собеседований начато" value={a?.interviews_started_today ?? 0} icon={MessageSquare} tone="neutral" loading={false} />
          <StatBox label="Собеседований завершено" value={a?.interviews_completed_today ?? 0} icon={MessageSquare} tone="success" loading={false} />
        </div>
      </section>
    </div>
  )
}
