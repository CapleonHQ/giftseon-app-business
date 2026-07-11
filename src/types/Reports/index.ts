export interface CampaignRedemption {
  id: string
  campaign: string
  occasion: string
  sent: number
  redeemed: number
}

export interface SpendByMonth {
  month: string
  amount: number
}
