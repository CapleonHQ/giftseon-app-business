import { request } from './client'

type BackendGiftFormat = 'cash' | 'voucher' | 'marketplace_item' | 'custom_gift_pack'

export interface SendGiftPayload {
  contactId?: string
  recipientIdentifier?: string
  recipientIdentifierType?: 'tag' | 'email' | 'phone'
  amount: number
  currency?: string
  message?: string
  occasion?: string
  giftFormat?: BackendGiftFormat
  itemDescription?: string
  itemReferenceId?: string
}

export interface BackendGift {
  id: string
  type: 'send' | 'request'
  giftCategory: 'cash' | 'non_cash'
  amount?: number
  currency: string
  itemDescription?: string
  itemReferenceId?: string
  senderId?: string
  recipientId?: string
  recipientIdentifier?: string
  recipientIdentifierType?: 'tag' | 'email' | 'phone'
  claimToken?: string
  claimExpiresAt?: string
  status: 'pending' | 'claimed' | 'fulfilled' | 'expired' | 'cancelled'
  message?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export const sendGift = (payload: SendGiftPayload) =>
  request<BackendGift>({ method: 'POST', url: '/gifts/send', data: payload })

export interface SentGiftsResult {
  total: number
  page: number
  limit: number
  data: BackendGift[]
}

export const listSentGifts = (page?: number, limit?: number) =>
  request<SentGiftsResult>({ method: 'GET', url: '/gifts/sent', params: { page, limit } })
