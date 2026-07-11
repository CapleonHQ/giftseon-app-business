'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid,
  Users,
  Gift,
  Wallet,
  Palette,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  LifeBuoy,
} from 'lucide-react'
import GiftseonLogo from '@/components/Auth/GiftseonLogo'
import LogoutModal from './LogoutModal'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Gifting Configuration', href: '/gifting', icon: Gift },
  { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { label: 'Budget & Wallet', href: '/budget', icon: Wallet },
  { label: 'Branded Gifting', href: '/branding', icon: Palette },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Support', href: '/support', icon: LifeBuoy },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = useCallback(() => {
    logout()
    router.replace('/login')
  }, [logout, router])

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const navContent = (
    <>
      <div className='px-5 pt-6 pb-4'>
        <GiftseonLogo className='h-7 w-auto' />
      </div>

      <nav className='flex-1 space-y-1 px-3'>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-500'
                  : 'text-grey-600 hover:bg-grey-50 hover:text-blackish'
              }`}
            >
              <Icon className='h-4 w-4 shrink-0' />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className='mt-auto space-y-4 px-3 pb-4'>
        <button
          onClick={() => setLogoutOpen(true)}
          className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 hover:text-blackish transition-colors'
        >
          <LogOut className='h-4 w-4 shrink-0' />
          Log Out
        </button>

        <div className='rounded-xl border border-grey-100 bg-white p-4 text-center'>
          <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-50'>
            <Sparkles className='h-5 w-5 text-primary-500' />
          </div>
          <p className='mt-2 text-sm font-semibold text-blackish'>Set up gifting</p>
          <p className='mt-1 text-xs text-grey-400'>
            Configure a gifting rule so celebrations trigger automatically.
          </p>
          <Link
            href='/gifting/new'
            onClick={() => setMobileOpen(false)}
            className='mt-3 block rounded-lg bg-primary-50 py-2 text-sm font-medium text-primary-500 hover:bg-primary-100 transition-colors'
          >
            Configure
          </Link>
        </div>
      </div>

      <LogoutModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className='fixed top-4 left-4 z-50 rounded-lg border border-grey-200 bg-white p-2 shadow-sm lg:hidden'
        aria-label='Open menu'
      >
        <Menu className='h-5 w-5 text-blackish' />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/30 lg:hidden'
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-grey-100 bg-white transition-transform duration-200 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className='absolute top-4 right-4 rounded-md p-1 text-grey-400 hover:text-blackish'
          aria-label='Close menu'
        >
          <X className='h-4 w-4' />
        </button>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className='hidden w-60 shrink-0 flex-col border-r border-grey-100 bg-white lg:flex'>
        {navContent}
      </aside>
    </>
  )
}
