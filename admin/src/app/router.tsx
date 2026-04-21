import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { useAppSelector } from '@/app/store'
import { AdminLayout } from '@/pages/admin-layout'
import { DashboardPage } from '@/pages/dashboard-page'
import { UsersPage } from '@/pages/users-page'
import { TestsPage } from '@/pages/tests-page'
import { InterviewsPage } from '@/pages/interviews-page'
import { AdminsPage } from '@/pages/admins-page'
import { AnalyticsPage } from '@/pages/analytics-page'
import { QuestionsPage } from '@/pages/questions-page'
import { SignInPage } from '@/pages/sign-in-page'

const RequireAuth = () => {
  const accessToken = useAppSelector((state) => state.adminAuth.accessToken)
  if (!accessToken) return <Navigate to="/sign-in" replace />
  return <Outlet />
}

const router = createBrowserRouter(
  [
    { path: '/sign-in', element: <SignInPage /> },
    {
      element: <RequireAuth />,
      children: [
        {
          path: '/',
          element: <AdminLayout />,
          children: [
            { index: true, element: <DashboardPage /> },
            { path: 'users', element: <UsersPage /> },
            { path: 'tests', element: <TestsPage /> },
            { path: 'interviews', element: <InterviewsPage /> },
            { path: 'analytics', element: <AnalyticsPage /> },
            { path: 'admins', element: <AdminsPage /> },
            { path: 'questions', element: <QuestionsPage /> },
          ],
        },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename: '/admin' },
)

export const AppRouter = () => <RouterProvider router={router} />
