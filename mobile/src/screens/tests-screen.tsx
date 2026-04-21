import { useMemo, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { signOut } from '../features/auth/auth-slice'
import { useAppDispatch } from '../app/store'
import type { AppScreenProps } from '../app/navigation-types'
import { useGetModulesQuery, useGetProfessionsQuery, useGetTechnologiesQuery, useGetTestsQuery, useStartTestMutation } from '../shared/api/tests-api'
import type { ExpertiseLevel, TestListItem } from '../shared/api/types'
import { AppButton } from '../shared/ui/button'
import { AppSelect, AppTextInput } from '../shared/ui/form-controls'
import { Badge, Card, EmptyState, Skeleton } from '../shared/ui/surfaces'
import { Screen } from '../shared/ui/screen'
import { ThemeToggle } from '../shared/ui/theme-toggle'
import { useTheme } from '../shared/theme/theme-provider'

const expertiseOptions: Array<{ label: string; value: ExpertiseLevel | '' }> = [
  { label: 'Все уровни', value: '' },
  { label: 'Trainee', value: 'trainee' },
  { label: 'Junior', value: 'junior' },
  { label: 'Middle', value: 'middle' },
  { label: 'Senior', value: 'senior' },
]

export const TestsScreen = ({ navigation }: AppScreenProps<'Tests'>) => {
  const { theme } = useTheme()
  const dispatch = useAppDispatch()
  const [filters, setFilters] = useState({
    title: '',
    profession: '',
    chapter: '',
    technology: '',
    expertise_level: '' as ExpertiseLevel | '',
  })

  const params = useMemo(
    () => ({
      title: filters.title || undefined,
      profession: filters.profession || undefined,
      chapter: filters.chapter || undefined,
      technology: filters.technology || undefined,
      expertise_level: filters.expertise_level || undefined,
    }),
    [filters],
  )

  const { data: professions = [] } = useGetProfessionsQuery()
  const { data: modules = [] } = useGetModulesQuery(filters.profession || undefined)
  const { data: technologies = [] } = useGetTechnologiesQuery(filters.chapter || undefined)
  const { data: tests = [], isLoading, isFetching } = useGetTestsQuery(params)
  const [startTest, { isLoading: isStarting }] = useStartTestMutation()

  const stats = useMemo(
    () => ({
      total: tests.length,
      active: tests.filter((test) => test.status === 'in_progress').length,
      completed: tests.filter((test) => test.status === 'completed').length,
    }),
    [tests],
  )

  const handleOpenTest = async (test: TestListItem) => {
    try {
      if (test.status !== 'in_progress' && test.status !== 'completed') {
        await startTest(test.id).unwrap()
      }
      navigation.navigate('TestRun', { testId: test.id })
    } catch {
      Alert.alert('Не удалось открыть тест', 'Попробуйте еще раз.')
    }
  }

  const handleLogout = () => {
    void dispatch(signOut())
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <ThemeToggle />
        <AppButton title="Собеседования" variant="ghost" onPress={() => navigation.navigate('Interviews')} />
        <AppButton title="Выйти" variant="ghost" onPress={handleLogout} />
      </View>

      <Card style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.hero}>
          <View style={[styles.inlineChip, { backgroundColor: theme.colors.accentSoft }]}>
            <Text style={[styles.inlineChipText, { color: theme.colors.accent }]}>Главная страница тестов</Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
            Каталог тестов для подготовки к собеседованиям
          </Text>
          <Text style={[styles.heroDescription, { color: theme.colors.textSecondary }]}>
            Поиск, фильтры и продолжение прохождения прямо с мобильного устройства.
          </Text>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <StatCard label="Всего" value={stats.total} />
        <StatCard label="В процессе" value={stats.active} />
        <StatCard label="Завершено" value={stats.completed} />
      </View>

      <Card>
        <View style={styles.filtersHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Поиск и фильтры</Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Данные для фильтров загружаются с сервера.
          </Text>
        </View>
        <AppTextInput
          label="Поиск по названию"
          placeholder="Например, React"
          value={filters.title}
          onChangeText={(title) => setFilters((state) => ({ ...state, title }))}
        />
        <AppSelect
          label="Профессия"
          value={filters.profession}
          onValueChange={(profession) => setFilters({ title: filters.title, profession, chapter: '', technology: '', expertise_level: filters.expertise_level })}
          options={[{ label: 'Все профессии', value: '' }, ...professions.map((item) => ({ label: item.name, value: item.name }))]}
        />
        <AppSelect
          label="Модуль"
          value={filters.chapter}
          onValueChange={(chapter) => setFilters((state) => ({ ...state, chapter, technology: '' }))}
          options={[{ label: 'Все модули', value: '' }, ...modules.map((item) => ({ label: item.name, value: item.name }))]}
          enabled={Boolean(filters.profession)}
        />
        <AppSelect
          label="Технология"
          value={filters.technology}
          onValueChange={(technology) => setFilters((state) => ({ ...state, technology }))}
          options={[{ label: 'Все технологии', value: '' }, ...technologies.map((item) => ({ label: item.name, value: item.name }))]}
          enabled={Boolean(filters.chapter)}
        />
        <AppSelect
          label="Уровень"
          value={filters.expertise_level}
          onValueChange={(expertise_level) =>
            setFilters((state) => ({ ...state, expertise_level: expertise_level as ExpertiseLevel | '' }))
          }
          options={expertiseOptions}
        />
        <AppButton
          title="Сбросить фильтры"
          variant="ghost"
          onPress={() =>
            setFilters({
              title: '',
              profession: '',
              chapter: '',
              technology: '',
              expertise_level: '',
            })
          }
        />
      </Card>

      <View style={styles.listHeader}>
        <View style={styles.listHeaderText}>
          <Ionicons name="search-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.listLabel, { color: theme.colors.textSecondary }]}>
            {isFetching ? 'Обновляем список...' : `Найдено тестов: ${tests.length}`}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <View style={styles.skeletonBlock}>
                <Skeleton height={22} />
                <Skeleton height={16} />
                <Skeleton height={48} />
              </View>
            </Card>
          ))}
        </View>
      ) : tests.length === 0 ? (
        <EmptyState title="Тесты не найдены" description="Попробуйте ослабить фильтры или изменить поисковый запрос." />
      ) : (
        <View style={styles.list}>
          {tests.map((test) => (
            <TestCard key={test.id} test={test} loading={isStarting} onPress={() => void handleOpenTest(test)} />
          ))}
        </View>
      )}
    </Screen>
  )
}

const StatCard = ({ label, value }: { label: string; value: number }) => {
  const { theme } = useTheme()

  return (
    <Card style={styles.statCard}>
      <Text style={[styles.statLabel, { color: theme.colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>{value}</Text>
    </Card>
  )
}

const TestCard = ({
  test,
  loading,
  onPress,
}: {
  test: TestListItem
  loading: boolean
  onPress: () => void
}) => {
  const { theme } = useTheme()
  const statusTone =
    test.status === 'completed'
      ? 'success'
      : test.status === 'in_progress'
        ? 'accent'
        : 'neutral'

  const ctaLabel =
    test.status === 'completed' ? 'Открыть' : test.status === 'in_progress' ? 'Продолжить' : 'Начать'

  return (
    <Card>
      <View style={styles.testCardHeader}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[styles.testTitle, { color: theme.colors.textPrimary }]}>{test.title}</Text>
          <Text style={[styles.testMeta, { color: theme.colors.textSecondary }]}>
            {test.profession}
            {test.chapter ? ` / ${test.chapter}` : ''}
            {test.technology ? ` / ${test.technology}` : ''}
          </Text>
        </View>
        <Badge
          label={
            test.status === 'completed'
              ? 'Завершен'
              : test.status === 'in_progress'
                ? 'В процессе'
                : 'Готов к старту'
          }
          tone={statusTone}
        />
      </View>
      <View style={styles.badgeRow}>
        <Badge label={test.expertise_level} tone="accent" />
        <Badge label={`${test.question_count} вопросов`} />
        {typeof test.score === 'number' ? <Badge label={`${test.score} баллов`} tone="success" /> : null}
      </View>
      <Pressable
        onPress={onPress}
        style={[
          styles.cardFooter,
          {
            borderTopColor: theme.colors.borderSubtle,
          },
        ]}
      >
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          {test.status === 'completed'
            ? 'Откройте тест, чтобы посмотреть прогресс и результат.'
            : 'Начните или продолжите прохождение теста.'}
        </Text>
        <AppButton title={ctaLabel} variant="primary" loading={loading} onPress={onPress} />
      </Pressable>
    </Card>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hero: {
    gap: 12,
  },
  inlineChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inlineChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  filtersHeader: {
    marginBottom: 8,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  listHeader: {
    marginTop: 4,
  },
  listHeaderText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  skeletonBlock: {
    gap: 12,
  },
  testCardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  testTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  testMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
  },
})
