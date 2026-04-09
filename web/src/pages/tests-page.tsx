import { useMemo, useState } from 'react'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useGetModulesQuery,
  useGetProfessionsQuery,
  useGetTechnologiesQuery,
  useGetTestsQuery,
  useStartTestMutation,
} from '@/shared/api/tests-api'
import type { ExpertiseLevel, TestListItem } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { Input, Select } from '@/shared/ui/form-controls'
import { Badge, Card, EmptyState, Skeleton } from '@/shared/ui/surfaces'

const expertiseOptions: Array<{ value: ExpertiseLevel; label: string }> = [
  { value: 'trainee', label: 'Trainee' },
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' },
]

const statusToneMap = {
  assigned: 'neutral',
  in_progress: 'accent',
  completed: 'success',
  cancelled: 'danger',
  expired: 'danger',
} as const

export const TestsPage = () => {
  const navigate = useNavigate()
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
  const [startTest, { isLoading: isStartingTest }] = useStartTestMutation()

  const stats = useMemo(
    () => ({
      total: tests.length,
      active: tests.filter((test) => test.status === 'in_progress').length,
      completed: tests.filter((test) => test.status === 'completed').length,
    }),
    [tests],
  )

  const handleStart = async (test: TestListItem) => {
    if (test.status !== 'in_progress' && test.status !== 'completed') {
      await startTest(test.id).unwrap()
    }
    navigate(`/tests/${test.id}`)
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card className="space-y-5 bg-gradient-to-br from-accent-soft via-surface to-surface">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">
            <Sparkles className="size-3.5" />
            Главная страница тестов(тест деплоя)
          </div>
          <div className="space-y-3">
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Подбирай тесты под нужный стек и проходи их в реальном потоке собеседования.
            </h1>
            <p className="max-w-2xl text-base text-text-secondary">
              Каталог собирается из данных сервера, а фильтры подтягиваются из профессий, модулей и технологий.
            </p>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="space-y-1">
            <p className="text-sm text-text-tertiary">Всего тестов</p>
            <p className="text-3xl font-semibold text-text-primary">{stats.total}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-sm text-text-tertiary">В процессе</p>
            <p className="text-3xl font-semibold text-text-primary">{stats.active}</p>
          </Card>
          <Card className="space-y-1">
            <p className="text-sm text-text-tertiary">Завершено</p>
            <p className="text-3xl font-semibold text-text-primary">{stats.completed}</p>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-text-primary">Поиск и фильтры</h2>
            <p className="text-sm text-text-secondary">Состав набора зависит от связей в БД и параметров запроса.</p>
          </div>

          <Input
            label="Поиск по названию"
            placeholder="Например, React"
            value={filters.title}
            onChange={(event) =>
              setFilters((currentState) => ({ ...currentState, title: event.target.value }))
            }
          />

          <Select
            label="Профессия"
            value={filters.profession}
            onChange={(event) =>
              setFilters((currentState) => ({
                ...currentState,
                profession: event.target.value,
                chapter: '',
                technology: '',
              }))
            }
          >
            <option value="">Все профессии</option>
            {professions.map((profession) => (
              <option key={profession.id} value={profession.name}>
                {profession.name}
              </option>
            ))}
          </Select>

          <Select
            label="Модуль"
            value={filters.chapter}
            onChange={(event) =>
              setFilters((currentState) => ({
                ...currentState,
                chapter: event.target.value,
                technology: '',
              }))
            }
            disabled={!filters.profession}
          >
            <option value="">Все модули</option>
            {modules.map((module) => (
              <option key={module.id} value={module.name}>
                {module.name}
              </option>
            ))}
          </Select>

          <Select
            label="Технология"
            value={filters.technology}
            onChange={(event) =>
              setFilters((currentState) => ({ ...currentState, technology: event.target.value }))
            }
            disabled={!filters.chapter}
          >
            <option value="">Все технологии</option>
            {technologies.map((technology) => (
              <option key={technology.id} value={technology.name}>
                {technology.name}
              </option>
            ))}
          </Select>

          <Select
            label="Уровень"
            value={filters.expertise_level}
            onChange={(event) =>
              setFilters((currentState) => ({
                ...currentState,
                expertise_level: event.target.value as ExpertiseLevel | '',
              }))
            }
          >
            <option value="">Все уровни</option>
            {expertiseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Button
            variant="ghost"
            onClick={() =>
              setFilters({
                title: '',
                profession: '',
                chapter: '',
                technology: '',
                expertise_level: '',
              })
            }
          >
            Сбросить фильтры
          </Button>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Search className="size-4" />
              {isFetching ? 'Обновляем список...' : `Найдено тестов: ${tests.length}`}
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="space-y-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : tests.length === 0 ? (
            <EmptyState
              title="Тесты не найдены"
              description="Попробуйте ослабить фильтры или изменить поисковый запрос."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tests.map((test) => (
                <Card key={test.id} className="flex h-full flex-col gap-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-text-primary">{test.title}</h3>
                        <p className="text-sm text-text-secondary">
                          {test.profession}
                          {test.chapter ? ` / ${test.chapter}` : ''}
                          {test.technology ? ` / ${test.technology}` : ''}
                        </p>
                      </div>
                      <Badge tone={test.status ? statusToneMap[test.status] : 'neutral'}>
                        {test.status === 'completed'
                          ? 'Завершен'
                          : test.status === 'in_progress'
                            ? 'В процессе'
                            : 'Готов к старту'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="accent">{test.expertise_level}</Badge>
                      <Badge>{test.question_count} вопросов</Badge>
                      {typeof test.score === 'number' ? <Badge tone="success">{test.score} баллов</Badge> : null}
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <p className="text-sm text-text-tertiary">
                      {test.status === 'completed'
                        ? 'Можно открыть тест и посмотреть свой прогресс.'
                        : 'Начни тест и отвечай на вопросы по одному.'}
                    </p>
                    <Button
                      variant="primary"
                      loading={isStartingTest && test.status !== 'completed'}
                      onClick={() => void handleStart(test)}
                    >
                      {test.status === 'completed'
                        ? 'Открыть'
                        : test.status === 'in_progress'
                          ? 'Продолжить'
                          : 'Начать'}
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
