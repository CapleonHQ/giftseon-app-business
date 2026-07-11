'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { BrandingConfig } from '@/types/Branding'
import * as brandingApi from '@/lib/api/branding'

const DEFAULT_BRANDING: BrandingConfig = {
  logo: undefined,
  brandColor: '#1A1ABC',
  messageTemplate: 'Happy Birthday, {{employeeName}}! From all of us at the company. 🎉',
  wrapperStyle: 'classic',
  brandAllItems: true,
}

type BrandingContextValue = {
  branding: BrandingConfig
  isLoading: boolean
  updateBranding: (updates: Partial<BrandingConfig>) => void
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined)

const BRANDING_QUERY_KEY = ['branding'] as const

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: brandingApi.getBranding,
  })
  const branding = data ?? DEFAULT_BRANDING

  const updateMutation = useMutation({
    mutationFn: brandingApi.updateBranding,
    onSuccess: (updated) => queryClient.setQueryData(BRANDING_QUERY_KEY, updated),
  })

  const updateBranding = (updates: Partial<BrandingConfig>) => {
    updateMutation.mutate(updates)
  }

  const value = useMemo<BrandingContextValue>(
    () => ({ branding, isLoading, updateBranding }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branding, isLoading]
  )

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export const useBranding = () => {
  const ctx = useContext(BrandingContext)
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider')
  return ctx
}
