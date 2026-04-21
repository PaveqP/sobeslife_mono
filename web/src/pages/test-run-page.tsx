import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, SendHorizonal } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  useCheckAnswerMutation,
  useCompleteTestMutation,
  useGetTestByIdQuery,
  useStartTestMutation,
} from '@/shared/api/tests-api'
import type { CompleteTestResponse, TestDetails, TestQuestionDetails } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/form-controls'
import { Badge, Card, EmptyState, Skeleton } from '@/shared/ui/surfaces'

export const TestRunPage = () => {
  const testId = Number(useParams().testId)
  const { data, isLoading, isFetching } = useGetTestByIdQuery(testId, {
    skip: Number.isNaN(testId),
  })

  if (Number.isNaN(testId)) {
    return <Navigate to="/" replace />
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        title="Не удалось загрузить тест"
        description="Проверьте, существует ли тест, и повторите попытку."
      />
    )
  }

  return <TestRunContent key={data.id} data={data} isFetching={isFetching} testId={testId} />
}

const QuestionAnswerInput = ({
  question,
  answer,
  onAnswerChange,
  onToggleOption,
}: {
  question: TestQuestionDetails
  answer: string
  onAnswerChange: (value: string) => void
  onToggleOption: (option: string) => void
}) => {
  if (question.question_type === 'single_choice' && question.options) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">Выберите один ответ</p>
        {question.options.map((option, i) => (
          <label
            key={i}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
              answer === option
                ? 'border-accent bg-accent-soft'
                : 'border-border-subtle bg-surface hover:border-border-strong'
            }`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option}
              checked={answer === option}
              onChange={() => onAnswerChange(option)}
              onClick={(e) => e.stopPropagation()}
              className="accent-accent"
            />
            <span className="text-sm text-text-primary">{option}</span>
          </label>
        ))}
      </div>
    )
  }

  if (question.question_type === 'multiple_choice' && question.options) {
    const selected = answer.split(',').filter(Boolean)
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">Выберите все подходящие варианты</p>
        {question.options.map((option, i) => (
          <label
            key={i}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
              selected.includes(option)
                ? 'border-accent bg-accent-soft'
                : 'border-border-subtle bg-surface hover:border-border-strong'
            }`}
          >
            <input
              type="checkbox"
              value={option}
              checked={selected.includes(option)}
              onChange={() => onToggleOption(option)}
              onClick={(e) => e.stopPropagation()}
              className="accent-accent"
            />
            <span className="text-sm text-text-primary">{option}</span>
          </label>
        ))}
      </div>
    )
  }

  return (
    <Textarea
      label="Ваш ответ"
      placeholder="Напишите развернутый ответ"
      value={answer}
      onChange={(event) => onAnswerChange(event.target.value)}
      hint="Ответ можно редактировать и отправлять повторно."
    />
  )
}

const TestRunContent = ({
  data,
  isFetching,
  testId,
}: {
  data: TestDetails
  isFetching: boolean
  testId: number
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>(() =>
    Object.fromEntries(data.questions.map((question) => [question.id, question.user_answer ?? ''])),
  )
  const [answerStatus, setAnswerStatus] = useState<Record<number, boolean | null>>(() =>
    Object.fromEntries(data.questions.map((question) => [question.id, question.is_correct ?? null])),
  )
  // Freeze options on mount — prevent refetch from reshuffling them
  const [stableOptions] = useState<Record<number, string[]>>(() =>
    Object.fromEntries(
      data.questions
        .filter((q) => q.options && q.options.length > 0)
        .map((q) => [q.id, q.options!]),
    ),
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

  const currentQuestion = data.questions[currentQuestionIndex]

  if (!currentQuestion) {
    return (
      <EmptyState
        title="В тесте пока нет вопросов"
        description="Похоже, тест создан без связанного набора вопросов."
      />
    )
  }

  const handleAnswerSubmit = async () => {
    const answer = (answers[currentQuestion.id] ?? '').trim()
    if (!answer) return

    const response = await checkAnswer({
      id: testId,
      question_id: currentQuestion.id,
      answer,
    }).unwrap()

    setAnswerStatus((currentState) => ({
      ...currentState,
      [currentQuestion.id]: response.is_correct,
    }))
  }

  const handleComplete = async () => {
    const result = await completeTest(testId).unwrap()
    setCompletedResult(result)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary">
            <ArrowLeft className="size-4" />
            К каталогу тестов
          </Link>
          <h1 className="text-3xl font-semibold text-text-primary">{data.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{data.expertise_level}</Badge>
            <Badge>{data.profession}</Badge>
            {data.chapter ? <Badge>{data.chapter}</Badge> : null}
            {data.technology ? <Badge>{data.technology}</Badge> : null}
          </div>
        </div>
        <Card className="min-w-64 space-y-2">
          <p className="text-sm text-text-tertiary">Прогресс</p>
          <p className="text-2xl font-semibold text-text-primary">
            {completionSummary.answered}/{completionSummary.total}
          </p>
          <div className="h-2 rounded-full bg-surface-subtle">
            <div
              className="h-2 rounded-full bg-accent transition-all"
              style={{
                width:
                  completionSummary.total === 0
                    ? '0%'
                    : `${(completionSummary.answered / completionSummary.total) * 100}%`,
              }}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-text-primary">Вопросы</h2>
            <p className="text-sm text-text-secondary">
              Выбирайте вопрос слева и отправляйте ответ отдельно.
            </p>
          </div>
          <div className="space-y-2">
            {data.questions.map((question, index) => {
              const isCurrent = index === currentQuestionIndex
              const isAnswered = (answers[question.id] ?? '').trim().length > 0
              const isCorrect = answerStatus[question.id]

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                    isCurrent
                      ? 'border-accent bg-accent-soft'
                      : 'border-border-subtle bg-surface hover:border-border-strong hover:bg-surface-hover'
                  }`}
                >
                  <span className="text-sm font-medium text-text-primary">Вопрос {index + 1}</span>
                  {isCorrect === true ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : isCorrect === false ? (
                    <CheckCircle2 className="size-4 text-danger" />
                  ) : isAnswered ? (
                    <CircleDashed className="size-4 text-accent" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-text-tertiary">
                  Вопрос {currentQuestionIndex + 1} из {data.questions.length}
                </p>
                <h2 className="text-2xl font-semibold text-text-primary">{currentQuestion.text}</h2>
              </div>
              <Badge tone={answerStatus[currentQuestion.id] === true ? 'success' : answerStatus[currentQuestion.id] === false ? 'danger' : 'neutral'}>
                {answerStatus[currentQuestion.id] === true
                  ? 'Ответ верный'
                  : answerStatus[currentQuestion.id] === false
                    ? 'Ответ неверный'
                    : 'Еще не проверен'}
              </Badge>
            </div>

            <QuestionAnswerInput
              question={{ ...currentQuestion, options: stableOptions[currentQuestion.id] ?? currentQuestion.options }}
              answer={answers[currentQuestion.id] ?? ''}
              onAnswerChange={(value) =>
                setAnswers((currentState) => ({ ...currentState, [currentQuestion.id]: value }))
              }
              onToggleOption={(option) => toggleMultipleChoice(currentQuestion.id, option)}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentQuestionIndex((currentIndex) => Math.max(currentIndex - 1, 0))}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="size-4" />
                  Назад
                </Button>
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex((currentIndex) =>
                      Math.min(currentIndex + 1, data.questions.length - 1),
                    )
                  }
                  disabled={currentQuestionIndex === data.questions.length - 1}
                >
                  Далее
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <Button variant="primary" onClick={() => void handleAnswerSubmit()} loading={isChecking}>
                <SendHorizonal className="size-4" />
                Проверить ответ
              </Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Завершение теста</h2>
                <p className="text-sm text-text-secondary">
                  После завершения сервер подсчитает баллы и вернет статистику по каждому вопросу.
                </p>
              </div>
              <Button variant="primary" onClick={() => void handleComplete()} loading={isCompleting || isStarting || isFetching}>
                Завершить тест
              </Button>
            </div>

            {completedResult ? (
              <div className="space-y-4 rounded-3xl border border-success/20 bg-success-soft p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="success">Тест завершен</Badge>
                  <span className="text-sm text-success">
                    Итоговый балл: {completedResult.score ?? 0}
                  </span>
                </div>
                <div className="grid gap-3">
                  {completedResult.questions.map((question) => (
                    <div
                      key={question.question_id}
                      className="rounded-2xl border border-border-subtle bg-surface p-4 text-sm"
                    >
                      <p className="font-semibold text-text-primary">{question.text}</p>
                      <p className="mt-2 text-text-secondary">Ваш ответ: {question.user_answer ?? 'Нет ответа'}</p>
                      <p className="text-text-secondary">Правильный ответ: {question.correct_answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  )
}
