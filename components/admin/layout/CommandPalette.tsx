'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ImageIcon,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  Shield,
  Server,
} from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/catalog'))}>
            <Package className="mr-2 h-4 w-4" />
            <span>Products</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/orders'))}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Orders</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>General Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/rbac'))}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Access Control</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/system'))}>
            <Server className="mr-2 h-4 w-4" />
            <span>System Status</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
