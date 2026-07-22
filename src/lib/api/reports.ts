import { request } from './client'
import type { CampaignRedemption, SpendByMonth } from '@/types/Reports'

export interface ReportsOverview {
  giftsSent: number
  giftsClaimed: number
  giftsPending: number
  employeesOnboarded: number
  totalSpend: number
}

export interface OccasionBreakdownRow {
  occasion: string
  count: number
  spend: number
}

export const getReportsOverview = () =>
  request<ReportsOverview>({ method: 'GET', url: '/reports/overview' })

export const getSpendByMonth = () =>
  request<SpendByMonth[]>({ method: 'GET', url: '/reports/spend-by-month' })

export const getOccasionBreakdown = () =>
  request<OccasionBreakdownRow[]>({ method: 'GET', url: '/reports/occasion-breakdown' })

export const getCampaignRedemptions = () =>
  request<CampaignRedemption[]>({ method: 'GET', url: '/reports/campaign-redemptions' })
