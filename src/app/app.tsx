import { RouterProvider } from 'react-router'
import { router } from '@/app/router/router'
import { QueryProvider } from '@/app/providers/query-provider'
import { RenderBoundary } from '@/app/providers/render-boundary'
export function App() {
  return (
    <RenderBoundary>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </RenderBoundary>
  )
}
