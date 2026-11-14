import { Component, type ReactNode } from 'react'
import { ErrorState } from '@/components/shared/error-state'
export class RenderBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? (
      <main className="mx-auto max-w-2xl p-6">
        <ErrorState onRetry={() => window.location.reload()} />
      </main>
    ) : (
      this.props.children
    )
  }
}
