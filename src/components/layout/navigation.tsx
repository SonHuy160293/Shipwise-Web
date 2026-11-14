import { navigation } from '@/components/layout/navigation-items'
import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'
export function Navigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Main navigation" className="space-y-1 p-3">
      {navigation.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          title={collapsed ? label : undefined}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium hover:bg-muted',
              isActive && 'bg-accent hover:bg-accent',
              collapsed && 'justify-center px-0',
            )
          }
        >
          <Icon size={19} aria-hidden="true" />
          <span className={collapsed ? 'sr-only' : ''}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
