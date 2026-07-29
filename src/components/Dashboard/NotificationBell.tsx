'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, ShoppingBag, Wallet, Gift, ShieldCheck, Megaphone, Clock, Users } from 'lucide-react'
import {
  useNotifications,
  type NotificationCategory,
  type AppNotification,
} from '@/context/NotificationsContext'
import { timeAgo } from '@/lib/utils/dateTime'

const CATEGORY_ICON: Record<NotificationCategory, { icon: React.ReactNode; bg: string }> = {
  order: { icon: <ShoppingBag className='h-4 w-4 text-primary-500' />, bg: 'bg-primary-50' },
  payment: { icon: <Wallet className='h-4 w-4 text-success-500' />, bg: 'bg-success-50' },
  gift: { icon: <Gift className='h-4 w-4 text-information-500' />, bg: 'bg-information-50' },
  wallet: { icon: <Wallet className='h-4 w-4 text-warning-500' />, bg: 'bg-warning-50' },
  system: { icon: <ShieldCheck className='h-4 w-4 text-success-500' />, bg: 'bg-success-50' },
  promo: { icon: <Megaphone className='h-4 w-4 text-primary-500' />, bg: 'bg-primary-50' },
  reminder: { icon: <Clock className='h-4 w-4 text-warning-500' />, bg: 'bg-warning-50' },
  social: { icon: <Users className='h-4 w-4 text-information-500' />, bg: 'bg-information-50' },
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleItemClick = (notification: AppNotification) => {
    markRead(notification.id)
    setOpen(false)
  }

  return (
    <div ref={ref} className='relative'>
      <button
        onClick={() => setOpen(!open)}
        className='relative rounded-lg p-2 text-grey-500 hover:bg-grey-50 transition-colors'
        aria-label='Notifications'
      >
        <Bell className='h-5 w-5' />
        {unreadCount > 0 && (
          <span className='absolute right-1 top-1 flex h-2 w-2 rounded-full bg-error-500' />
        )}
      </button>

      {open && (
        <div className='absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-grey-100 bg-white shadow-lg sm:w-96'>
          <div className='flex items-center justify-between border-b border-grey-100 px-4 py-3'>
            <p className='text-sm font-semibold text-blackish'>Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className='text-xs font-medium text-primary-500 hover:text-primary-600'>
                Mark all as read
              </button>
            )}
          </div>
          <div className='max-h-96 overflow-y-auto'>
            {notifications.length === 0 ? (
              <p className='px-4 py-8 text-center text-sm text-grey-400'>You&apos;re all caught up.</p>
            ) : (
              notifications.map((n) => {
                const { icon, bg } = CATEGORY_ICON[n.category]
                const content = (
                  <div className={`flex gap-3 px-4 py-3 transition-colors hover:bg-grey-50/60 ${!n.read ? 'bg-primary-50/30' : ''}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>{icon}</div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center justify-between gap-2'>
                        <p className='text-sm font-medium text-blackish'>{n.title}</p>
                        {!n.read && <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500' />}
                      </div>
                      <p className='mt-0.5 line-clamp-2 text-xs text-grey-500'>{n.message}</p>
                      <p className='mt-1 text-[11px] text-grey-400'>{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                )
                return n.href ? (
                  <Link key={n.id} href={n.href} onClick={() => handleItemClick(n)} className='block border-b border-grey-50 last:border-b-0'>
                    {content}
                  </Link>
                ) : (
                  <button key={n.id} onClick={() => handleItemClick(n)} className='block w-full text-left border-b border-grey-50 last:border-b-0'>
                    {content}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
