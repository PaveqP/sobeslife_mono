import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import { signOut } from '../features/auth/auth-slice'
import { useAppDispatch } from '../app/store'
import { useGetProfileQuery, useUpdateProfileMutation } from '../shared/api/users-api'
import { useGetProfessionsQuery } from '../shared/api/tests-api'
import type { ExpertiseLevel, UpdateUserProfileRequest } from '../shared/api/types'
import { getApiErrorMessage } from '../shared/lib/api-error'
import { AppButton } from '../shared/ui/button'
import { AppSelect, AppTextInput } from '../shared/ui/form-controls'
import { Badge, Card, FullScreenLoader } from '../shared/ui/surfaces'
import { Screen } from '../shared/ui/screen'
import { ThemeToggle } from '../shared/ui/theme-toggle'
import { useTheme } from '../shared/theme/theme-provider'

const gradeOptions: Array<{ label: string; value: ExpertiseLevel }> = [
  { label: 'Trainee', value: 'trainee' },
  { label: 'Junior', value: 'junior' },
  { label: 'Middle', value: 'middle' },
  { label: 'Senior', value: 'senior' },
]

type FormState = {
  nickname: string
  first_name: string
  last_name: string
  profession: string
  grade: ExpertiseLevel | ''
  years_experience: string
  github_url: string
  linkedin_url: string
  about: string
}

export const ProfileScreen = () => {
  const { theme } = useTheme()
  const dispatch = useAppDispatch()
  const { data: profile, isLoading } = useGetProfileQuery()
  const { data: professions = [] } = useGetProfessionsQuery()
  const [updateProfile, { isLoading: isSaving, isSuccess }] = useUpdateProfileMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<FormState>({
    nickname: '',
    first_name: '',
    last_name: '',
    profession: '',
    grade: '',
    years_experience: '',
    github_url: '',
    linkedin_url: '',
    about: '',
  })

  useEffect(() => {
    if (profile && !profile.profile_completed) {
      setIsEditing(true)
    }
  }, [profile])

  useEffect(() => {
    if (profile) {
      setForm({
        nickname: profile.nickname ?? '',
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
        profession: profile.profession ?? '',
        grade: profile.grade ?? '',
        years_experience: profile.years_experience != null ? String(profile.years_experience) : '',
        github_url: profile.github_url ?? '',
        linkedin_url: profile.linkedin_url ?? '',
        about: profile.about ?? '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    const payload: UpdateUserProfileRequest = {}
    if (form.nickname) payload.nickname = form.nickname
    if (form.first_name) payload.first_name = form.first_name
    if (form.last_name) payload.last_name = form.last_name
    if (form.profession) payload.profession = form.profession
    if (form.grade) payload.grade = form.grade
    if (form.years_experience) payload.years_experience = parseInt(form.years_experience, 10)
    if (form.github_url) payload.github_url = form.github_url
    if (form.linkedin_url) payload.linkedin_url = form.linkedin_url
    if (form.about) payload.about = form.about

    try {
      await updateProfile(payload).unwrap()
      setIsEditing(false)
    } catch (err) {
      Alert.alert('Ошибка', getApiErrorMessage(err, 'Не удалось обновить профиль.'))
    }
  }

  if (isLoading) {
    return <FullScreenLoader />
  }

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.nickname

  return (
    <Screen>
      <View style={styles.topRow}>
        <ThemeToggle />
        <AppButton title="Выйти" variant="ghost" onPress={() => void dispatch(signOut())} />
      </View>

      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Личный кабинет</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Настройки профиля и информация об аккаунте
      </Text>

      {profile && !profile.profile_completed && !isEditing ? (
        <Card>
          <Text style={[styles.bannerTitle, { color: theme.colors.accent }]}>Добро пожаловать! Заполните профиль</Text>
          <Text style={[styles.bannerText, { color: theme.colors.textSecondary }]}>
            Укажите свои данные — это поможет подобрать подходящие тесты и собеседования.
          </Text>
          <AppButton title="Заполнить" variant="primary" onPress={() => setIsEditing(true)} />
        </Card>
      ) : null}

      <Card>
        {!isEditing ? (
          <View style={styles.section}>
            <Text style={[styles.name, { color: theme.colors.textPrimary }]}>{displayName ?? 'Не указано'}</Text>
            <View style={styles.badges}>
              {profile?.profession ? <Badge label={profile.profession} /> : null}
              {profile?.grade ? <Badge label={profile.grade} tone="accent" /> : null}
            </View>
            {isSuccess ? (
              <Text style={[styles.successText, { color: theme.colors.success }]}>Профиль успешно обновлён</Text>
            ) : null}
            <AppButton title="Редактировать" variant="secondary" onPress={() => setIsEditing(true)} />
          </View>
        ) : (
          <View style={styles.section}>
            <AppTextInput label="Имя" value={form.first_name} onChangeText={(v) => setForm((s) => ({ ...s, first_name: v }))} />
            <AppTextInput label="Фамилия" value={form.last_name} onChangeText={(v) => setForm((s) => ({ ...s, last_name: v }))} />
            <AppTextInput label="Никнейм" value={form.nickname} onChangeText={(v) => setForm((s) => ({ ...s, nickname: v }))} />
            <AppSelect
              label="Профессия"
              value={form.profession}
              onValueChange={(profession) => setForm((s) => ({ ...s, profession }))}
              options={[{ label: 'Не выбрана', value: '' }, ...professions.map((p) => ({ label: p.name, value: p.name }))]}
            />
            <AppSelect
              label="Грейд"
              value={form.grade}
              onValueChange={(grade) => setForm((s) => ({ ...s, grade: grade as ExpertiseLevel | '' }))}
              options={[{ label: 'Не указан', value: '' }, ...gradeOptions.map((o) => ({ label: o.label, value: o.value }))]}
            />
            <AppTextInput
              label="Лет опыта"
              keyboardType="number-pad"
              value={form.years_experience}
              onChangeText={(years_experience) => setForm((s) => ({ ...s, years_experience }))}
            />
            <AppTextInput
              label="GitHub"
              autoCapitalize="none"
              value={form.github_url}
              onChangeText={(github_url) => setForm((s) => ({ ...s, github_url }))}
            />
            <AppTextInput
              label="LinkedIn"
              autoCapitalize="none"
              value={form.linkedin_url}
              onChangeText={(linkedin_url) => setForm((s) => ({ ...s, linkedin_url }))}
            />
            <View>
              <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>О себе</Text>
              <TextInput
                multiline
                numberOfLines={3}
                value={form.about}
                onChangeText={(about) => setForm((s) => ({ ...s, about }))}
                placeholderTextColor={theme.colors.textTertiary}
                style={[
                  styles.aboutInput,
                  {
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.borderSubtle,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              />
            </View>
            <View style={styles.row}>
              <AppButton title="Отмена" variant="ghost" onPress={() => setIsEditing(false)} style={styles.half} />
              <AppButton title="Сохранить" variant="primary" loading={isSaving} onPress={() => void handleSave()} style={styles.half} />
            </View>
          </View>
        )}
      </Card>

      {!isEditing && profile ? (
        <Card>
          <InfoRow label="Профессия" value={profile.profession ?? '—'} theme={theme} />
          <InfoRow label="Грейд" value={profile.grade ?? '—'} theme={theme} />
          <InfoRow
            label="Опыт"
            value={profile.years_experience != null ? `${profile.years_experience} лет` : '—'}
            theme={theme}
          />
        </Card>
      ) : null}
    </Screen>
  )
}

const InfoRow = ({
  label,
  value,
  theme,
}: {
  label: string
  value: string
  theme: ReturnType<typeof useTheme>['theme']
}) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: theme.colors.textTertiary }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: theme.colors.textPrimary }]}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  bannerText: {
    fontSize: 14,
    marginBottom: 12,
  },
  section: {
    gap: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  successText: {
    fontSize: 14,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutInput: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
})
