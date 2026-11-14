import {
  Building2,
  FolderKanban,
  ListTodo,
  Settings,
  UserRound,
} from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { PageContainer, PageHeader } from '@/components/layout/page'
const pages: Record<
  string,
  {
    title: string
    description: string
    icon: typeof Building2
    empty: string
    detail: string
  }
> = {
  '/organizations': {
    title: 'Organizations',
    description:
      'A home for your organizations and the teams delivering great software.',
    icon: Building2,
    empty: 'Your organization portfolio starts here',
    detail:
      'Organization management is planned for a future release. This space will bring your organizations and workspaces together.',
  },
  '/projects': {
    title: 'Projects',
    description: 'Bring project delivery into focus across your workspaces.',
    icon: FolderKanban,
    empty: 'A clearer view of delivery',
    detail:
      'Project management is planned for a future release. Your projects and delivery context will live here.',
  },
  '/sprint-planning': {
    title: 'Sprint Planning',
    description: 'Make room for focused planning and predictable delivery.',
    icon: ListTodo,
    empty: 'Plan the work ahead',
    detail:
      'Sprint planning is planned for a future release. This space will support your team’s delivery cadence.',
  },
  '/settings': {
    title: 'Settings',
    description: 'A dedicated place for your workspace preferences.',
    icon: Settings,
    empty: 'Your workspace, thoughtfully configured',
    detail:
      'Workspace settings are planned for a future release. No configuration is saved here yet.',
  },
  '/profile': {
    title: 'My Profile',
    description: 'Your personal space in Shipwise.',
    icon: UserRound,
    empty: 'Your profile will live here',
    detail:
      'Profile management will become available when authentication is integrated. No account information is connected.',
  },
}
export default function PlaceholderPage() {
  const { pathname } = useLocation()
  const page = pages[pathname] ?? pages['/organizations']!
  const Icon = page.icon
  return (
    <PageContainer>
      <PageHeader title={page.title} description={page.description} />
      <section
        aria-labelledby="empty-heading"
        className="flex min-h-80 flex-col items-center justify-center rounded-xl border bg-card px-6 py-12 text-center md:min-h-96"
      >
        <div className="mb-5 flex size-12 items-center justify-center rounded-lg border">
          <Icon size={23} aria-hidden="true" />
        </div>
        <h2 id="empty-heading" className="text-lg font-semibold">
          {page.empty}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {page.detail}
        </p>
        <span className="mt-6 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Planned capability
        </span>
      </section>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs leading-5 text-muted-foreground">
        <p>Built for thoughtful software delivery.</p>
        <Link
          to={pathname === '/projects' ? '/organizations' : '/projects'}
          className="inline-flex min-h-11 items-center underline underline-offset-4"
        >
          {pathname === '/projects' ? 'View organizations' : 'View projects'}
        </Link>
      </div>
    </PageContainer>
  )
}
