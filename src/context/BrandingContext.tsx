'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { BrandingConfig } from '@/types/Branding'
import * as brandingApi from '@/lib/api/branding'
import type { ApiError } from '@/lib/api/client'

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
  isSaving: boolean
  saveError: string | null
  updateBranding: (updates: Partial<BrandingConfig>) => void
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined)

const BRANDING_QUERY_KEY = ['branding'] as const

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const [saveError, setSaveError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: brandingApi.getBranding,
  })
  const branding = data ?? DEFAULT_BRANDING

  const updateMutation = useMutation({
    mutationFn: brandingApi.updateBranding,
    onSuccess: (updated) => {
      setSaveError(null)
      queryClient.setQueryData(BRANDING_QUERY_KEY, updated)
    },
    onError: (err) => setSaveError((err as unknown as ApiError).message || 'Could not save this change. Please try again.'),
  })

  const updateBranding = (updates: Partial<BrandingConfig>) => {
    updateMutation.mutate(updates)
  }

  const value = useMemo<BrandingContextValue>(
    () => ({ branding, isLoading, isSaving: updateMutation.isPending, saveError, updateBranding }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branding, isLoading, updateMutation.isPending, saveError]
  )

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export const useBranding = () => {
  const ctx = useContext(BrandingContext)
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider')
  return ctx
}
