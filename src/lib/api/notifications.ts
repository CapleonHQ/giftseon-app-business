import { request } from './client'

export type BackendNotificationType =
  | 'order'
  | 'payment'
  | 'gift'
  | 'wallet'
  | 'system'
  | 'promo'
  | 'reminder'
  | 'social'

export interface BackendNotification {
  id: string
  userId: string
  type: BackendNotificationType
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  data?: Record<string, unknown> | null
  actionUrl?: string | null
  imageUrl?: string | null
  read: boolean
  readAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface GetNotificationsResult {
  notifications: BackendNotification[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  unreadCount: number
}

export const getNotifications = () =>
  request<GetNotificationsResult>({ method: 'GET', url: '/notifications' })

export const getUnreadCount = () =>
  request<{ unreadCount: number }>({ method: 'GET', url: '/notifications/unread-count' })

export const markNotificationRead = (id: string) =>
  request<BackendNotification>({ method: 'POST', url: `/notifications/${id}/read` })

export const markAllNotificationsRead = () =>
  request<{ markedCount: number }>({ method: 'POST', url: '/notifications/read-all' })
