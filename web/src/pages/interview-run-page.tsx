import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, SendHorizonal, StopCircle, Bot, User } from 'lucide-react'
import {
  useSendInterviewAnswerMutation,
  useCompleteInterviewMutation,
} from '@/shared/api/interviews-api'
import type { InterviewTurnResponse } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/form-controls'
import { Badge, Card } from '@/shared/ui/surfaces'

type Message = {
  role: 'assistant' | 'user'
  content: string
}

export const InterviewRunPage = () => {
  const params = useParams()
  const interviewId = Number(params.interviewId)

  if (Number.isNaN(interviewId)) return <Navigate to="/interviews" replace />

  return <InterviewRunContent interviewId={interviewId} />
}

const InterviewRunContent = ({ interviewId }: { interviewId: number }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<InterviewTurnResponse | null>(null)
  const [firstQuestion, setFirstQuestion] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const [sendAnswer, { isLoading: isSending }] = useSendInterviewAnswerMutation()
  const [completeInterview, { isLoading: isCompleting }] = useCompleteInterviewMutation()

  // Load first question from session storage (set by InterviewsPage on start)
  useEffect(() => {
    const stored = sessionStorage.getItem(`interview_first_q_${interviewId}`)
    if (stored) {
      setFirstQuestion(stored)
      setMessages([{ role: 'assistant', content: stored }])
      sessionStorage.removeItem(`interview_first_q_${interviewId}`)
    }
  }, [interviewId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isFinished = result?.status === 'completed'

  const handleSend = async () => {
    const trimmed = answer.trim()
    if (!trimmed || isFinished) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setAnswer('')

    const response = await sendAnswer({ id: interviewId, answer: trimmed }).unwrap()
    if (response.message) {
      setMessages((prev) => [...prev, { role: 'assistant', content: response.message!.content }])
    }
    if (response.status === 'completed') {
      setResult(response)
    }
  }

  const handleComplete = async () => {
    const response = await completeInterview(interviewId).unwrap()
    setResult(response)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          to="/interviews"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          К собеседованиям
        </Link>
        <div className="flex-1" />
        {!isFinished && (
          <Button
            variant="ghost"
            size="sm"
            loading={isCompleting}
            onClick={() => void handleComplete()}
          >
            <StopCircle className="size-4" />
            Завершить
          </Button>
        )}
      </div>

      {/* Chat */}
      <Card className="flex flex-col gap-0 p-0 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-full bg-accent-soft">
            <Bot className="size-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">AI-интервьюер</p>
            <p className="text-xs text-text-tertiary">
              {isFinished ? 'Собеседование завершено' : 'Ожидает вашего ответа'}
            </p>
          </div>
          <div className="ml-auto">
            {isFinished
              ? <Badge tone="success">Завершено</Badge>
              : <Badge tone="accent">В процессе</Badge>}
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5 min-h-80 max-h-[50vh]">
          {messages.length === 0 && !firstQuestion && (
            <p className="text-sm text-text-tertiary text-center py-8">
              Загружаем собеседование...
            </p>
          )}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                msg.role === 'assistant' ? 'bg-accent-soft' : 'bg-surface-subtle'
              }`}>
                {msg.role === 'assistant'
                  ? <Bot className="size-4 text-accent" />
                  : <User className="size-4 text-text-secondary" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'assistant'
                  ? 'bg-surface-subtle text-text-primary'
                  : 'bg-accent text-white'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {!isFinished && (
          <div className="border-t border-border-subtle p-4 flex gap-3">
            <Textarea
              label=""
              placeholder="Напишите ответ..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void handleSend()
              }}
            />
            <Button
              variant="primary"
              loading={isSending}
              onClick={() => void handleSend()}
              disabled={!answer.trim()}
              className="self-end"
            >
              <SendHorizonal className="size-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Result panel */}
      {isFinished && result && (
        <Card className="space-y-5 border-success/20 bg-success-soft/30">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-text-primary">Результат собеседования</h2>
            {result.verdict_passed != null && (
              <Badge tone={result.verdict_passed ? 'success' : 'danger'}>
                {result.verdict_passed ? '✓ Прошёл' : '✗ Не прошёл'}
              </Badge>
            )}
          </div>

          {result.summary && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text-primary">Общая оценка</p>
              <p className="text-sm text-text-secondary">{result.summary}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {result.strengths && result.strengths.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-success">Сильные стороны</p>
                <ul className="space-y-1">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-success">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.weaknesses && result.weaknesses.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-danger">Слабые стороны</p>
                <ul className="space-y-1">
                  {result.weaknesses.map((s, i) => (
                    <li key={i} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-danger">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-accent">Рекомендации</p>
                <ul className="space-y-1">
                  {result.recommendations.map((s, i) => (
                    <li key={i} className="text-sm text-text-secondary flex gap-2">
                      <span className="text-accent">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
