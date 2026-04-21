import { useEffect, useRef, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { AppScreenProps } from '../app/navigation-types'
import { useSendInterviewAnswerMutation, useCompleteInterviewMutation } from '../shared/api/interviews-api'
import type { InterviewTurnResponse } from '../shared/api/types'
import { AppButton } from '../shared/ui/button'
import { Badge, Card } from '../shared/ui/surfaces'
import { useTheme } from '../shared/theme/theme-provider'

type Message = { role: 'assistant' | 'user'; content: string }

export const InterviewRunScreen = ({ route, navigation }: AppScreenProps<'InterviewRun'>) => {
  const { interviewId, firstQuestion } = route.params
  const { theme } = useTheme()

  const [messages, setMessages] = useState<Message[]>([])
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<InterviewTurnResponse | null>(null)
  const scrollRef = useRef<ScrollView>(null)

  const [sendAnswer, { isLoading: isSending }] = useSendInterviewAnswerMutation()
  const [completeInterview, { isLoading: isCompleting }] = useCompleteInterviewMutation()

  useEffect(() => {
    if (firstQuestion) {
      setMessages([{ role: 'assistant', content: firstQuestion }])
    }
  }, [firstQuestion])

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }, [messages])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        !isFinished ? (
          <TouchableOpacity
            onPress={() => void handleComplete()}
            style={[styles.headerBtn, { backgroundColor: theme.colors.surfaceSubtle }]}
          >
            <Ionicons name="stop-circle-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.headerBtnText, { color: theme.colors.textSecondary }]}>Завершить</Text>
          </TouchableOpacity>
        ) : null,
    })
  })

  const isFinished = result?.status === 'completed'

  const handleSend = async () => {
    const trimmed = answer.trim()
    if (!trimmed || isFinished) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setAnswer('')

    try {
      const response = await sendAnswer({ id: interviewId, answer: trimmed }).unwrap()
      if (response.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.message!.content }])
      }
      if (response.status === 'completed') {
        setResult(response)
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось отправить ответ. Попробуйте ещё раз.')
    }
  }

  const handleComplete = async () => {
    try {
      const response = await completeInterview(interviewId).unwrap()
      setResult(response)
    } catch {
      Alert.alert('Ошибка', 'Не удалось завершить собеседование.')
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.page }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <Text style={[styles.placeholder, { color: theme.colors.textTertiary }]}>
            Загружаем собеседование...
          </Text>
        )}

        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageRow,
              msg.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant,
            ]}
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: msg.role === 'assistant' ? theme.colors.accentSoft : theme.colors.surfaceSubtle },
              ]}
            >
              <Ionicons
                name={msg.role === 'assistant' ? 'chatbox-outline' : 'person-outline'}
                size={16}
                color={msg.role === 'assistant' ? theme.colors.accent : theme.colors.textSecondary}
              />
            </View>
            <View
              style={[
                styles.bubble,
                msg.role === 'assistant'
                  ? [styles.bubbleAssistant, { backgroundColor: theme.colors.surfaceSubtle }]
                  : [styles.bubbleUser, { backgroundColor: theme.colors.accent }],
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  { color: msg.role === 'assistant' ? theme.colors.textPrimary : '#ffffff' },
                ]}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {isFinished && result ? (
          <Card style={{ marginTop: 16 }}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultTitle, { color: theme.colors.textPrimary }]}>
                Результат собеседования
              </Text>
              {result.verdict_passed != null && (
                <Badge
                  label={result.verdict_passed ? '✓ Прошёл' : '✗ Не прошёл'}
                  tone={result.verdict_passed ? 'success' : 'danger'}
                />
              )}
            </View>

            {result.summary ? (
              <View style={styles.resultSection}>
                <Text style={[styles.resultSectionTitle, { color: theme.colors.textPrimary }]}>
                  Общая оценка
                </Text>
                <Text style={[styles.resultText, { color: theme.colors.textSecondary }]}>
                  {result.summary}
                </Text>
              </View>
            ) : null}

            {result.strengths && result.strengths.length > 0 ? (
              <View style={styles.resultSection}>
                <Text style={[styles.resultSectionTitle, { color: theme.colors.success }]}>
                  Сильные стороны
                </Text>
                {result.strengths.map((s, i) => (
                  <Text key={i} style={[styles.resultBullet, { color: theme.colors.textSecondary }]}>
                    • {s}
                  </Text>
                ))}
              </View>
            ) : null}

            {result.weaknesses && result.weaknesses.length > 0 ? (
              <View style={styles.resultSection}>
                <Text style={[styles.resultSectionTitle, { color: theme.colors.danger }]}>
                  Слабые стороны
                </Text>
                {result.weaknesses.map((s, i) => (
                  <Text key={i} style={[styles.resultBullet, { color: theme.colors.textSecondary }]}>
                    • {s}
                  </Text>
                ))}
              </View>
            ) : null}

            {result.recommendations && result.recommendations.length > 0 ? (
              <View style={styles.resultSection}>
                <Text style={[styles.resultSectionTitle, { color: theme.colors.accent }]}>
                  Рекомендации
                </Text>
                {result.recommendations.map((s, i) => (
                  <Text key={i} style={[styles.resultBullet, { color: theme.colors.textSecondary }]}>
                    • {s}
                  </Text>
                ))}
              </View>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>

      {!isFinished && (
        <View
          style={[
            styles.inputRow,
            { borderTopColor: theme.colors.borderSubtle, backgroundColor: theme.colors.surface },
          ]}
        >
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: theme.colors.borderSubtle,
                backgroundColor: theme.colors.surfaceSubtle,
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder="Напишите ответ..."
            placeholderTextColor={theme.colors.textTertiary}
            value={answer}
            onChangeText={setAnswer}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            onPress={() => void handleSend()}
            disabled={isSending || !answer.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: theme.colors.accent, opacity: isSending || !answer.trim() ? 0.5 : 1 },
            ]}
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {isFinished && (
        <View style={[styles.doneBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.borderSubtle }]}>
          <AppButton title="← К собеседованиям" variant="secondary" onPress={() => navigation.goBack()} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chat: { flex: 1 },
  chatContent: { padding: 16, gap: 12 },
  placeholder: { textAlign: 'center', paddingVertical: 32, fontSize: 14 },
  messageRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  messageRowAssistant: { flexDirection: 'row' },
  messageRowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleAssistant: { borderBottomLeftRadius: 4 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  resultSection: { marginTop: 12, gap: 6 },
  resultSectionTitle: { fontSize: 14, fontWeight: '700' },
  resultText: { fontSize: 14, lineHeight: 20 },
  resultBullet: { fontSize: 14, lineHeight: 20, paddingLeft: 8 },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 120,
    minHeight: 44,
  },
  sendBtn: { width: 44, height: 44, paddingHorizontal: 0 },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 4,
  },
  headerBtnText: { fontSize: 13, fontWeight: '600' },
  doneBar: {
    padding: 12,
    borderTopWidth: 1,
  },
})
