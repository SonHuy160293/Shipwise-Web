import type { ReactNode } from 'react'
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-10">
      {children}
    </div>
  )
}
export function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </header>
  )
}
