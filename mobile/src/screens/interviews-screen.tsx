import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AppScreenProps } from '../app/navigation-types'
import { useGetInterviewHistoryQuery, useStartInterviewMutation } from '../shared/api/interviews-api'
import { useGetProfessionsQuery } from '../shared/api/tests-api'
import type { ExpertiseLevel, InterviewHistoryItem } from '../shared/api/types'
import { AppButton } from '../shared/ui/button'
import { AppSelect } from '../shared/ui/form-controls'
import { Badge, Card, EmptyState, Skeleton } from '../shared/ui/surfaces'
import { Screen } from '../shared/ui/screen'
import { useTheme } from '../shared/theme/theme-provider'

const levelOptions: Array<{ label: string; value: ExpertiseLevel }> = [
  { label: 'Trainee', value: 'trainee' },
  { label: 'Junior', value: 'junior' },
  { label: 'Middle', value: 'middle' },
  { label: 'Senior', value: 'senior' },
]

const durationOptions = [
  { label: '15 минут', value: '15' },
  { label: '30 минут', value: '30' },
  { label: '45 минут', value: '45' },
  { label: '60 минут', value: '60' },
]

export const InterviewsScreen = ({ navigation }: AppScreenProps<'Interviews'>) => {
  const { theme } = useTheme()
  const { data: history = [], isLoading } = useGetInterviewHistoryQuery()
  const { data: professions = [] } = useGetProfessionsQuery()
  const [startInterview, { isLoading: isStarting }] = useStartInterviewMutation()

  const [form, setForm] = useState({
    profession: '',
    interview_level: 'junior' as ExpertiseLevel,
    duration_minutes: 30,
    candidate_specialization: '',
  })

  const handleStart = async () => {
    if (!form.profession) {
      Alert.alert('Выберите профессию', 'Укажите профессию для начала собеседования.')
      return
    }
    try {
      const result = await startInterview(form).unwrap()
      navigation.navigate('InterviewRun', {
        interviewId: result.id,
        firstQuestion: result.first_question,
      })
    } catch {
      Alert.alert('Ошибка', 'Не удалось начать собеседование. Попробуйте ещё раз.')
    }
  }

  const getStatusTone = (item: InterviewHistoryItem): 'accent' | 'success' | 'danger' | 'neutral' => {
    if (item.status === 'in_progress') return 'accent'
    if (item.status === 'completed') return item.verdict_passed ? 'success' : 'danger'
    return 'neutral'
  }

  const getStatusLabel = (item: InterviewHistoryItem): string => {
    if (item.status === 'in_progress') return 'В процессе'
    if (item.status === 'completed') return item.verdict_passed ? 'Прошёл' : 'Не прошёл'
    return 'Завершено'
  }

  return (
    <Screen>
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <View style={styles.hero}>
          <View style={[styles.chip, { backgroundColor: theme.colors.accentSoft }]}>
            <Text style={[styles.chipText, { color: theme.colors.accent }]}>AI-собеседования</Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
            Пройди собеседование с AI-интервьюером
          </Text>
          <Text style={[styles.heroDescription, { color: theme.colors.textSecondary }]}>
            Выбери профессию, уровень и продолжительность. AI задаёт вопросы, в конце — детальный анализ.
          </Text>
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Новое собеседование</Text>

        <AppSelect
          label="Профессия"
          value={form.profession}
          onValueChange={(profession) => setForm((s) => ({ ...s, profession }))}
          options={[
            { label: 'Выберите профессию', value: '' },
            ...professions.map((p) => ({ label: p.name, value: p.name })),
          ]}
        />
        <AppSelect
          label="Уровень"
          value={form.interview_level}
          onValueChange={(v) => setForm((s) => ({ ...s, interview_level: v as ExpertiseLevel }))}
          options={levelOptions}
        />
        <AppSelect
          label="Продолжительность"
          value={String(form.duration_minutes)}
          onValueChange={(v) => setForm((s) => ({ ...s, duration_minutes: Number(v) }))}
          options={durationOptions}
        />

        <AppButton
          title="Начать собеседование"
          variant="primary"
          loading={isStarting}
          onPress={() => void handleStart()}
        />
      </Card>

      <Text style={[styles.historyTitle, { color: theme.colors.textPrimary }]}>
        История собеседований
      </Text>

      {isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <View style={styles.skeletonBlock}>
                <Skeleton height={20} />
                <Skeleton height={16} />
              </View>
            </Card>
          ))}
        </View>
      ) : history.length === 0 ? (
        <EmptyState title="Нет собеседований" description="Начните первое AI-собеседование выше." />
      ) : (
        <View style={styles.list}>
          {history.map((item) => (
            <InterviewCard
              key={item.id}
              item={item}
              statusLabel={getStatusLabel(item)}
              statusTone={getStatusTone(item)}
              onContinue={() => navigation.navigate('InterviewRun', { interviewId: item.id, firstQuestion: '' })}
            />
          ))}
        </View>
      )}
    </Screen>
  )
}

const InterviewCard = ({
  item,
  statusLabel,
  statusTone,
  onContinue,
}: {
  item: InterviewHistoryItem
  statusLabel: string
  statusTone: 'accent' | 'success' | 'danger' | 'neutral'
  onContinue: () => void
}) => {
  const { theme } = useTheme()
  return (
    <Card>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>{item.profession}</Text>
          <Text style={[styles.cardMeta, { color: theme.colors.textSecondary }]}>
            {item.interview_level} · {item.duration_minutes} мин ·{' '}
            {new Date(item.started_at).toLocaleDateString('ru-RU')}
          </Text>
          {item.summary ? (
            <Text style={[styles.cardSummary, { color: theme.colors.textSecondary }]} numberOfLines={2}>
              {item.summary}
            </Text>
          ) : null}
        </View>
        <Badge label={statusLabel} tone={statusTone} />
      </View>
      {item.status === 'in_progress' ? (
        <Pressable
          onPress={onContinue}
          style={[styles.continueRow, { borderTopColor: theme.colors.borderSubtle }]}
        >
          <AppButton title="Продолжить" variant="primary" onPress={onContinue} />
          <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.textSecondary} />
        </Pressable>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  hero: { gap: 12 },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  heroDescription: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  historyTitle: { fontSize: 20, fontWeight: '700' },
  list: { gap: 12 },
  skeletonBlock: { gap: 10 },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardMeta: { fontSize: 13, lineHeight: 18 },
  cardSummary: { fontSize: 13, lineHeight: 18 },
  continueRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
