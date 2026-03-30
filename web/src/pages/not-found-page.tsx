import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/surfaces'

export const NotFoundPage = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Card className="flex w-full max-w-2xl flex-col items-center gap-4 text-center">
      <div className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">404</div>
      <h1 className="text-3xl font-semibold text-text-primary">Страница не найдена</h1>
      <p className="text-sm text-text-secondary">
        Похоже, ссылка устарела или маршрут еще не реализован.
      </p>
      <Link to="/">
        <Button variant="primary">Вернуться на главную</Button>
      </Link>
    </Card>
  </div>
)
