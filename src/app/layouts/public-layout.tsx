import { ArrowUpRight } from 'lucide-react'
import { Link, Outlet } from 'react-router'

// Task 3 owns the finished public shell; this stub establishes its landmarks.
export function PublicLayout() {
  return (
    <div className="min-h-dvh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4"
      >
        Skip to content
      </a>
      <header className="flex h-18 items-center border-b px-5 md:px-10">
        <Link
          to="/register"
          aria-label="Shipwise home"
          className="flex min-h-11 items-center gap-2.5"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ArrowUpRight size={22} aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight">
            Shipwise<span className="text-muted-foreground">.</span>
          </span>
        </Link>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
