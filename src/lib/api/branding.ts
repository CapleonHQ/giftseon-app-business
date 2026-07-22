import { request } from './client'
import type { BrandingConfig } from '@/types/Branding'

interface BackendBranding {
  id: string
  companyId: string
  logoUrl?: string
  brandColor: string
  messageTemplate?: string
  wrapperStyle: string
  brandAllItems: boolean
  createdAt: string
  updatedAt: string
}

const toBrandingConfig = (branding: BackendBranding): BrandingConfig => ({
  logo: branding.logoUrl,
  brandColor: branding.brandColor,
  messageTemplate: branding.messageTemplate ?? '',
  wrapperStyle: branding.wrapperStyle,
  brandAllItems: branding.brandAllItems,
})

const toBackendPayload = (updates: Partial<BrandingConfig>) => ({
  ...(updates.logo !== undefined && { logoUrl: updates.logo }),
  ...(updates.brandColor !== undefined && { brandColor: updates.brandColor }),
  ...(updates.messageTemplate !== undefined && { messageTemplate: updates.messageTemplate }),
  ...(updates.wrapperStyle !== undefined && { wrapperStyle: updates.wrapperStyle }),
  ...(updates.brandAllItems !== undefined && { brandAllItems: updates.brandAllItems }),
})

export const getBranding = async () =>
  toBrandingConfig(await request<BackendBranding>({ method: 'GET', url: '/branding' }))

export const updateBranding = async (updates: Partial<BrandingConfig>) =>
  toBrandingConfig(
    await request<BackendBranding>({ method: 'PUT', url: '/branding', data: toBackendPayload(updates) })
  )
