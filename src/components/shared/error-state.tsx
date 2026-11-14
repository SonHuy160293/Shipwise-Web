import { Button } from '@/components/ui/button'
export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-lg border p-8">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="my-4 text-muted-foreground">
        Please try again. If the problem continues, contact your administrator.
      </p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  )
}
