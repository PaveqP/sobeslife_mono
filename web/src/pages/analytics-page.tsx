import { BarChart3, CheckCircle2, Target, TrendingUp, Clock, Award } from 'lucide-react'
import { useGetInterviewHistoryQuery } from '@/shared/api/interviews-api'
import { useGetTestsStatisticsQuery } from '@/shared/api/users-api'
import { useGetTestsQuery } from '@/shared/api/tests-api'
import type { InterviewHistoryItem } from '@/shared/api/types'
import { Badge, Card, Skeleton } from '@/shared/ui/surfaces'

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  icon: React.ElementType
  tone?: 'neutral' | 'accent' | 'success' | 'danger'
}) => {
  const toneClass = {
    neutral: 'bg-surface-subtle text-text-secondary',
    accent: 'bg-accent-soft text-accent',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
  }[tone]

  return (
    <Card className="flex items-center gap-4">
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-text-tertiary">{label}</p>
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
      </div>
    </Card>
  )
}

const computeInterviewStats = (history: InterviewHistoryItem[]) => {
  const completed = history.filter((i) => i.status === 'completed')
  const passed = completed.filter((i) => i.verdict_passed === true).length
  const failed = completed.filter((i) => i.verdict_passed === false).length
  const passRate = completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0

  const allStrengths: string[] = []
  const allWeaknesses: string[] = []
  completed.forEach((i) => {
    if (i.strengths) allStrengths.push(...i.strengths)
    if (i.weaknesses) allWeaknesses.push(...i.weaknesses)
  })

  const freq = (arr: string[]) => {
    const map = new Map<string, number>()
    arr.forEach((s) => map.set(s, (map.get(s) ?? 0) + 1))
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text]) => text)
  }

  return {
    total: history.length,
    completed: completed.length,
    inProgress: history.filter((i) => i.status === 'in_progress').length,
    passed,
    failed,
    passRate,
    topStrengths: freq(allStrengths),
    topWeaknesses: freq(allWeaknesses),
  }
}

export const AnalyticsPage = () => {
  const { data: interviewsData, isLoading: interviewsLoading } = useGetInterviewHistoryQuery()
  const interviews = interviewsData ?? []
  const { data: testsStats, isLoading: testsLoading } = useGetTestsStatisticsQuery()
  const { data: testsData } = useGetTestsQuery({})
  const tests = testsData ?? []

  const interviewStats = computeInterviewStats(interviews)

  const completedTests = tests.filter((t) => t.status === 'completed')
  const avgScore =
    completedTests.length > 0
      ? Math.round(completedTests.reduce((sum, t) => sum + (t.score ?? 0), 0) / completedTests.length)
      : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-accent-soft">
          <BarChart3 className="size-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Аналитика</h1>
          <p className="text-sm text-text-secondary">Твой прогресс по тестам и собеседованиям</p>
        </div>
      </div>

      {/* Tests stats */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Тесты</h2>
        {testsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><Skeleton className="h-16" /></Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Всего тестов" value={testsStats?.total ?? tests.length} icon={Target} />
            <StatCard
              label="Завершено"
              value={testsStats?.completed ?? completedTests.length}
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              label="В процессе"
              value={testsStats?.in_progress ?? tests.filter((t) => t.status === 'in_progress').length}
              icon={Clock}
              tone="accent"
            />
            <StatCard
              label="Средний балл"
              value={testsStats?.average_score != null ? Math.round(testsStats.average_score) : avgScore}
              icon={Award}
              tone="accent"
            />
          </div>
        )}

        {/* Test results breakdown */}
        {completedTests.length > 0 && (
          <Card className="space-y-4">
            <h3 className="font-semibold text-text-primary">Результаты завершённых тестов</h3>
            <div className="space-y-2">
              {completedTests.slice(0, 10).map((test) => (
                <div key={test.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{test.title}</p>
                    <p className="text-xs text-text-tertiary">{test.expertise_level} · {test.profession}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {typeof test.score === 'number' && (
                      <Badge tone={test.score >= 70 ? 'success' : test.score >= 40 ? 'accent' : 'danger'}>
                        {test.score} баллов
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      {/* Interview stats */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Собеседования</h2>
        {interviewsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><Skeleton className="h-16" /></Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Всего" value={interviewStats.total} icon={Target} />
              <StatCard label="Прошёл" value={interviewStats.passed} icon={CheckCircle2} tone="success" />
              <StatCard label="Не прошёл" value={interviewStats.failed} icon={TrendingUp} tone="danger" />
              <StatCard label="Процент успеха" value={`${interviewStats.passRate}%`} icon={Award} tone="accent" />
            </div>

            {interviewStats.completed > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {interviewStats.topStrengths.length > 0 && (
                  <Card className="space-y-3">
                    <h3 className="font-semibold text-success">Топ сильных сторон</h3>
                    <ul className="space-y-1.5">
                      {interviewStats.topStrengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="text-success mt-0.5">✓</span> {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {interviewStats.topWeaknesses.length > 0 && (
                  <Card className="space-y-3">
                    <h3 className="font-semibold text-danger">Топ слабых сторон</h3>
                    <ul className="space-y-1.5">
                      {interviewStats.topWeaknesses.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="text-danger mt-0.5">✗</span> {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}

            {interviewStats.total === 0 && (
              <Card className="flex min-h-40 items-center justify-center">
                <p className="text-sm text-text-tertiary">Нет данных о собеседованиях. Пройдите первое!</p>
              </Card>
            )}
          </>
        )}
      </section>
    </div>
  )
}
