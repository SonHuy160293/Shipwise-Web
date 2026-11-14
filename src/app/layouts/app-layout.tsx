import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router'
import {
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import { Navigation } from '@/components/layout/navigation'
import { navigation } from '@/components/layout/navigation-items'
import { cn } from '@/lib/utils'
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  const location = useLocation()
  const section =
    navigation.find((n) => location.pathname.startsWith(n.to))?.label ??
    'Account'
  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4"
      >
        Skip to content
      </a>
      <header className="flex h-18 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Sheet open={mobile} onOpenChange={setMobile}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="px-6 pt-8">
                <SheetTitle>Shipwise</SheetTitle>
                <SheetDescription>Application navigation</SheetDescription>
              </div>
              <Navigation onNavigate={() => setMobile(false)} />
            </SheetContent>
          </Sheet>
          <Link
            to="/organizations"
            aria-label="Shipwise home"
            className="flex items-center gap-2.5"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ArrowUpRight size={22} aria-hidden="true" />
            </span>
            <span className="text-xl font-semibold tracking-tight">
              Shipwise<span className="text-muted-foreground">.</span>
            </span>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2"
              aria-label="Open user menu"
            >
              <span className="flex size-8 items-center justify-center rounded-full border text-xs">
                SW
              </span>
              <span className="hidden text-sm sm:inline">My account</span>
              <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/profile">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Logout (not connected)</DropdownMenuItem>
            <p className="px-2 py-2 text-xs text-muted-foreground">
              Authentication is not configured.
            </p>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex min-h-[calc(100dvh-4.5rem)]">
        <aside
          aria-label="Sidebar"
          className={cn(
            'hidden shrink-0 flex-col border-r bg-background md:flex',
            collapsed ? 'w-20' : 'w-60',
          )}
        >
          <div
            className={cn(
              'flex h-16 items-center justify-between px-5',
              collapsed && 'justify-center px-0',
            )}
          >
            {!collapsed && (
              <span className="text-xs font-medium text-muted-foreground">
                Workspace
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </Button>
          </div>
          <Navigation collapsed={collapsed} />
          <div className="mt-auto border-t p-5 text-xs text-muted-foreground">
            {collapsed ? 'SW' : 'Shipwise'}
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex h-14 items-center border-b px-5 text-xs text-muted-foreground md:px-10">
            Workspace{' '}
            <span className="px-3" aria-hidden="true">
              /
            </span>
            <span className="text-foreground">{section}</span>
          </div>
          <main id="main-content" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
