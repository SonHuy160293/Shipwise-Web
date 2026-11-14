import { Building2, FolderKanban, ListTodo, Settings } from 'lucide-react'
export const navigation = [
  { to: '/organizations', label: 'Organizations', icon: Building2 },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/sprint-planning', label: 'Sprint Planning', icon: ListTodo },
  { to: '/settings', label: 'Settings', icon: Settings },
]
