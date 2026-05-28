import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useCheckAnswerMutation, useCompleteTestMutation, useGetTestByIdQuery, useStartTestMutation } from '../shared/api/tests-api'
import type { CompleteTestResponse, TestDetails, TestQuestion } from '../shared/api/types'
import type { TestRunScreenProps } from '../app/navigation-types'
import { AppButton } from '../shared/ui/button'
import { AppTextInput } from '../shared/ui/form-controls'
import { Badge, Card, EmptyState, FullScreenLoader } from '../shared/ui/surfaces'
import { Screen } from '../shared/ui/screen'
import { useTheme } from '../shared/theme/theme-provider'

export const TestRunScreen = ({ route }: TestRunScreenProps) => {
  const { testId } = route.params
  const { data, isLoading, isFetching } = useGetTestByIdQuery(testId)

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!data) {
    return (
      <Screen>
        <EmptyState title="Тест не найден" description="Проверьте выбранный тест и попробуйте снова." />
      </Screen>
    )
  }

  return <TestRunContent data={data} isFetching={isFetching} testId={testId} />
}

const QuestionAnswerInput = ({
  question,
  answer,
  onAnswerChange,
  onToggleOption,
  theme,
}: {
  question: TestQuestion
  answer: string
  onAnswerChange: (value: string) => void
  onToggleOption: (option: string) => void
  theme: ReturnType<typeof useTheme>['theme']
}) => {
  if ((question.question_type === 'single_choice' || question.question_type === 'multiple_choice') && question.options) {
    const isMultiple = question.question_type === 'multiple_choice'
    const selected = isMultiple ? answer.split(',').filter(Boolean) : [answer]
    const label = isMultiple ? 'Выберите все подходящие варианты' : 'Выберите один ответ'

    return (
      <View style={{ gap: 8, marginTop: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary }}>{label}</Text>
        {question.options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <Pressable
              key={option}
              onPress={() => isMultiple ? onToggleOption(option) : onAnswerChange(option)}
              style={[
                choiceStyles.option,
                {
                  borderColor: isSelected ? theme.colors.accent : theme.colors.borderSubtle,
                  backgroundColor: isSelected ? theme.colors.accentSoft : theme.colors.surface,
                },
              ]}
            >
              <View style={[
                choiceStyles.indicator,
                isMultiple ? choiceStyles.checkbox : choiceStyles.radio,
                {
                  borderColor: isSelected ? theme.colors.accent : theme.colors.borderSubtle,
                  backgroundColor: isSelected ? theme.colors.accent : 'transparent',
                },
              ]} />
              <Text style={{ fontSize: 14, color: theme.colors.textPrimary, flex: 1 }}>{option}</Text>
            </Pressable>
          )
        })}
      </View>
    )
  }

  return (
    <AppTextInput
      label="Ваш ответ"
      placeholder="Напишите развернутый ответ"
      multiline
      numberOfLines={6}
      value={answer}
      onChangeText={onAnswerChange}
      hint="Ответ можно править и отправлять повторно."
      containerStyle={{ marginTop: 8 }}
    />
  )
}

const choiceStyles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  indicator: {
    width: 18,
    height: 18,
    borderWidth: 2,
  },
  radio: {
    borderRadius: 9,
  },
  checkbox: {
    borderRadius: 4,
  },
})

const TestRunContent = ({
  data,
  isFetching,
  testId,
}: {
  data: TestDetails
  isFetching: boolean
  testId: number
}) => {
  const { theme } = useTheme()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>(() =>
    Object.fromEntries(data.questions.map((question) => [question.id, question.user_answer ?? ''])),
  )
  const [answerStatus, setAnswerStatus] = useState<Record<number, boolean | null>>(() =>
    Object.fromEntries(data.questions.map((question) => [question.id, question.is_correct ?? null])),
  )
  const [completedResult, setCompletedResult] = useState<CompleteTestResponse | null>(null)
  const startRequestedRef = useRef(false)

  const [startTest, { isLoading: isStarting }] = useStartTestMutation()
  const [checkAnswer, { isLoading: isChecking }] = useCheckAnswerMutation()
  const [completeTest, { isLoading: isCompleting }] = useCompleteTestMutation()

  useEffect(() => {
    if (startRequestedRef.current || data.status === 'in_progress' || data.status === 'completed') return

    startRequestedRef.current = true
    void startTest(testId)
  }, [data.status, startTest, testId])

  const currentQuestion = data.questions[currentQuestionIndex]

  const completionSummary = useMemo(() => {
    const answered = data.questions.filter((question) => (answers[question.id] ?? '').trim()).length
    return { answered, total: data.questions.length }
  }, [answers, data.questions])

  const toggleMultipleChoice = (questionId: number, option: string) => {
    setAnswers((current) => {
      const existing = (current[questionId] ?? '').split(',').filter(Boolean)
      const idx = existing.indexOf(option)
      const next = idx >= 0 ? existing.filter((o) => o !== option) : [...existing, option]
      return { ...current, [questionId]: next.sort().join(',') }
    })
  }

  if (!currentQuestion) {
    return (
      <Screen>
        <EmptyState title="В тесте пока нет вопросов" description="Похоже, тест создан без привязанного набора вопросов." />
      </Screen>
    )
  }

  const handleAnswerSubmit = async () => {
    const answer = (answers[currentQuestion.id] ?? '').trim()
    if (!answer) {
      Alert.alert('Пустой ответ', 'Введите ответ перед отправкой.')
      return
    }

    try {
      const response = await checkAnswer({
        id: testId,
        question_id: currentQuestion.id,
        answer,
      }).unwrap()

      setAnswerStatus((state) => ({
        ...state,
        [currentQuestion.id]: response.is_correct,
      }))
    } catch {
      Alert.alert('Ошибка', 'Не удалось проверить ответ.')
    }
  }

  const handleComplete = async () => {
    try {
      const result = await completeTest(testId).unwrap()
      setCompletedResult(result)
    } catch {
      Alert.alert('Ошибка', 'Не удалось завершить тест.')
    }
  }

  return (
    <Screen>
      <Card>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{data.title}</Text>
          <View style={styles.badges}>
            <Badge label={data.expertise_level} tone="accent" />
            <Badge label={data.profession} />
            {data.chapter ? <Badge label={data.chapter} /> : null}
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Прогресс: {completionSummary.answered}/{completionSummary.total}
            {isFetching ? ' · обновляем...' : ''}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceSubtle }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.accent,
                  width: completionSummary.total === 0 ? '0%' : `${(completionSummary.answered / completionSummary.total) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Вопрос {currentQuestionIndex + 1} из {data.questions.length}
        </Text>
        <Text style={[styles.questionText, { color: theme.colors.textPrimary }]}>{currentQuestion.text}</Text>
        <Badge
          label={
            answerStatus[currentQuestion.id] === true
              ? 'Ответ верный'
              : answerStatus[currentQuestion.id] === false
                ? 'Ответ неверный'
                : 'Еще не проверен'
          }
          tone={
            answerStatus[currentQuestion.id] === true
              ? 'success'
              : answerStatus[currentQuestion.id] === false
                ? 'danger'
                : 'neutral'
          }
        />
        <QuestionAnswerInput
          question={currentQuestion}
          answer={answers[currentQuestion.id] ?? ''}
          onAnswerChange={(value) =>
            setAnswers((state) => ({ ...state, [currentQuestion.id]: value }))
          }
          onToggleOption={(option) => toggleMultipleChoice(currentQuestion.id, option)}
          theme={theme}
        />
        <View style={styles.actionsRow}>
          <AppButton
            title="Назад"
            disabled={currentQuestionIndex === 0}
            onPress={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))}
          />
          <AppButton
            title="Далее"
            disabled={currentQuestionIndex === data.questions.length - 1}
            onPress={() => setCurrentQuestionIndex((index) => Math.min(index + 1, data.questions.length - 1))}
          />
        </View>
        <AppButton title="Проверить ответ" variant="primary" loading={isChecking} onPress={() => void handleAnswerSubmit()} />
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Навигация по вопросам</Text>
        <View style={styles.questionList}>
          {data.questions.map((question, index) => {
            const isCurrent = index === currentQuestionIndex
            const status = answerStatus[question.id]
            return (
              <Pressable
                key={question.id}
                onPress={() => setCurrentQuestionIndex(index)}
                style={[
                  styles.questionChip,
                  {
                    backgroundColor: isCurrent ? theme.colors.accentSoft : theme.colors.surfaceSubtle,
                    borderColor: isCurrent ? theme.colors.accent : theme.colors.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.questionChipText, { color: theme.colors.textPrimary }]}>Вопрос {index + 1}</Text>
                <Text
                  style={[
                    styles.questionChipStatus,
                    {
                      color:
                        status === true
                          ? theme.colors.success
                          : status === false
                            ? theme.colors.danger
                            : theme.colors.textTertiary,
                    },
                  ]}
                >
                  {status === true ? 'Верно' : status === false ? 'Ошибка' : 'Черновик'}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </Card>

      <Card>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Завершение теста</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          После завершения сервер вернет баллы и правильные ответы.
        </Text>
        <AppButton
          title="Завершить тест"
          variant="primary"
          loading={isCompleting || isStarting}
          onPress={() => void handleComplete()}
        />

        {completedResult ? (
          <View style={[styles.resultPanel, { backgroundColor: theme.colors.successSoft }]}>
            <Badge label={`Итоговый балл: ${completedResult.score ?? 0}`} tone="success" />
            {completedResult.questions.map((question) => (
              <View key={question.question_id} style={[styles.resultItem, { borderTopColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.resultQuestion, { color: theme.colors.textPrimary }]}>{question.text}</Text>
                <Text style={[styles.resultText, { color: theme.colors.textSecondary }]}>
                  Ваш ответ: {question.user_answer ?? 'Нет ответа'}
                </Text>
                <Text style={[styles.resultText, { color: theme.colors.textSecondary }]}>
                  Правильный ответ: {question.correct_answer}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  questionList: {
    gap: 10,
  },
  questionChip: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  questionChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  questionChipStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultPanel: {
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  resultItem: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 4,
  },
  resultQuestion: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
})
