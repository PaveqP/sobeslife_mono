import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { useAppSelector } from '@/app/store'
import { NotFoundPage } from '@/pages/not-found-page'
import { RootLayout } from '@/pages/root-layout'
import { SignInPage } from '@/pages/sign-in-page'
import { SignUpPage } from '@/pages/sign-up-page'
import { TestRunPage } from '@/pages/test-run-page'
import { TestsPage } from '@/pages/tests-page'

const RequireAuth = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken)

  if (!accessToken) {
    return <Navigate to="/sign-in" replace />
  }

  return <Outlet />
}

const router = createBrowserRouter([
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          {
            index: true,
            element: <TestsPage />,
          },
          {
            path: 'tests/:testId',
            element: <TestRunPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export const AppRouter = () => <RouterProvider router={router} />
