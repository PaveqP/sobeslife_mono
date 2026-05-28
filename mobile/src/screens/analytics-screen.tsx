import { StyleSheet, Text, View } from 'react-native'
import { useGetInterviewHistoryQuery } from '../shared/api/interviews-api'
import { useGetTestsStatisticsQuery } from '../shared/api/users-api'
import { useGetTestsQuery } from '../shared/api/tests-api'
import type { InterviewHistoryItem } from '../shared/api/types'
import { Badge, Card, FullScreenLoader, Skeleton } from '../shared/ui/surfaces'
import { Screen } from '../shared/ui/screen'
import { useTheme } from '../shared/theme/theme-provider'

const computeInterviewStats = (history: InterviewHistoryItem[]) => {
  const completed = history.filter((i) => i.status === 'completed')
  const passed = completed.filter((i) => i.verdict_passed === true).length
  const failed = completed.filter((i) => i.verdict_passed === false).length
  const passRate = completed.length > 0 ? Math.round((passed / completed.length) * 100) : 0
  return { total: history.length, passed, failed, passRate }
}

const StatCard = ({ label, value }: { label: string; value: string | number }) => {
  const { theme } = useTheme()
  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{value}</Text>
    </Card>
  )
}

export const AnalyticsScreen = () => {
  const { theme } = useTheme()
  const { data: interviews = [], isLoading: interviewsLoading } = useGetInterviewHistoryQuery()
  const { data: testsStats, isLoading: testsLoading } = useGetTestsStatisticsQuery()
  const { data: tests = [] } = useGetTestsQuery({})

  const interviewStats = computeInterviewStats(interviews)
  const completedTests = tests.filter((t) => t.status === 'completed')
  const avgScore =
    completedTests.length > 0
      ? Math.round(completedTests.reduce((sum, t) => sum + (t.score ?? 0), 0) / completedTests.length)
      : 0

  if (testsLoading && interviewsLoading) {
    return <FullScreenLoader />
  }

  return (
    <Screen>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Аналитика</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Прогресс по тестам и собеседованиям
      </Text>

      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Тесты</Text>
      {testsLoading ? (
        <Skeleton height={80} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard label="Всего" value={testsStats?.total ?? tests.length} />
          <StatCard label="Завершено" value={testsStats?.completed ?? completedTests.length} />
          <StatCard label="В процессе" value={testsStats?.in_progress ?? tests.filter((t) => t.status === 'in_progress').length} />
          <StatCard
            label="Средний балл"
            value={testsStats?.average_score != null ? Math.round(testsStats.average_score) : avgScore}
          />
        </View>
      )}

      {completedTests.length > 0 ? (
        <Card>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Завершённые тесты</Text>
          {completedTests.slice(0, 10).map((test) => (
            <View key={test.id} style={styles.testRow}>
              <View style={styles.testMeta}>
                <Text style={[styles.testTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {test.title}
                </Text>
                <Text style={[styles.testSub, { color: theme.colors.textTertiary }]}>
                  {test.expertise_level} · {test.profession}
                </Text>
              </View>
              {typeof test.score === 'number' ? (
                <Badge
                  label={`${test.score} б.`}
                  tone={test.score >= 70 ? 'success' : test.score >= 40 ? 'accent' : 'danger'}
                />
              ) : null}
            </View>
          ))}
        </Card>
      ) : null}

      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Собеседования</Text>
      {interviewsLoading ? (
        <Skeleton height={80} />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard label="Всего" value={interviewStats.total} />
            <StatCard label="Прошёл" value={interviewStats.passed} />
            <StatCard label="Не прошёл" value={interviewStats.failed} />
            <StatCard label="Успех" value={`${interviewStats.passRate}%`} />
          </View>
          {interviewStats.total === 0 ? (
            <Card>
              <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>
                Нет данных о собеседованиях. Пройдите первое!
              </Text>
            </Card>
          ) : null}
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    width: '47%',
    minWidth: 140,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  testMeta: {
    flex: 1,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  testSub: {
    fontSize: 12,
  },
  empty: {
    fontSize: 14,
    textAlign: 'center',
  },
})
