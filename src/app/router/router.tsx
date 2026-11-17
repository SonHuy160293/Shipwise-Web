import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router'
import { AppLayout } from '@/app/layouts/app-layout'
import { PublicLayout } from '@/app/layouts/public-layout'
import { LoadingIndicator } from '@/components/shared/loading-indicator'
const Placeholder = lazy(() => import('./placeholder-page'))
const NotFound = lazy(() => import('./not-found'))
const RegisterPage = lazy(() =>
  import('@/features/auth').then((feature) => ({
    default: feature.RegisterPage,
  })),
)
const FormExample = import.meta.env.DEV
  ? lazy(() => import('@/app/dev/form-example'))
  : null
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: 'register',
        element: (
          <Suspense fallback={<LoadingIndicator />}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        element: (
          <Suspense fallback={<LoadingIndicator />}>
            <Outlet />
          </Suspense>
        ),
        children: [
          { index: true, element: <Navigate to="/organizations" replace /> },
          ...[
            'organizations',
            'projects',
            'sprint-planning',
            'settings',
            'profile',
          ].map((path) => ({ path, element: <Placeholder /> })),
          ...(FormExample
            ? [{ path: 'dev/form-example', element: <FormExample /> }]
            : []),
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])
