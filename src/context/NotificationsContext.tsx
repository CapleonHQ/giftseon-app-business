'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { getAuthToken } from '@/lib/api/client'
import * as notificationsApi from '@/lib/api/notifications'
import type { BackendNotification } from '@/lib/api/notifications'
import { useAuth } from '@/context/AuthContext'

export type NotificationCategory =
  | 'order'
  | 'payment'
  | 'gift'
  | 'wallet'
  | 'system'
  | 'promo'
  | 'reminder'
  | 'social'

export interface AppNotification {
  id: string
  category: NotificationCategory
  title: string
  message: string
  createdAt: string
  read: boolean
  href?: string
}

const toAppNotification = (n: BackendNotification): AppNotification => ({
  id: n.id,
  category: n.type,
  title: n.title,
  message: n.message,
  createdAt: n.createdAt,
  read: n.read,
  href: n.actionUrl ?? undefined,
})

type NotificationsContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined)

/** Derives the socket.io origin from the REST API base URL — same host,
 * just without the /api/business/v1 path (the gateway's namespace is
 * '/notifications', a socket.io concept, not a REST path). */
const getSocketOrigin = (): string => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_BUSINESS_API_URL ?? ''
  try {
    return new URL(apiBaseUrl).origin
  } catch {
    return ''
  }
}

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') {
      socketRef.current?.disconnect()
      socketRef.current = null
      setNotifications([])
      return
    }

    let cancelled = false

    notificationsApi
      .getNotifications()
      .then((result) => {
        if (!cancelled) setNotifications(result.notifications.map(toAppNotification))
      })
      .catch(() => {
        // Best-effort — the socket connection below still gets new notifications live.
      })

    const token = getAuthToken()
    const origin = getSocketOrigin()
    if (!token || !origin) return

    const socket = io(`${origin}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('notification', (payload: BackendNotification) => {
      setNotifications((prev) => [toAppNotification(payload), ...prev])
    })

    socket.on('notification_read', (payload: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === payload.notificationId ? { ...n, read: true } : n))
      )
    })

    socket.on('all_notifications_read', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    })

    return () => {
      cancelled = true
      socket.disconnect()
      socketRef.current = null
    }
  }, [status])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    notificationsApi.markAllNotificationsRead().catch(() => {
      // optimistic update stands; will reconcile on next fetch
    })
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    notificationsApi.markNotificationRead(id).catch(() => {
      // optimistic update stands; will reconcile on next fetch
    })
  }, [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  const value = useMemo(
    () => ({ notifications, unreadCount, markAllRead, markRead }),
    [notifications, unreadCount, markAllRead, markRead]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
