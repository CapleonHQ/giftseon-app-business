'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { BrandingConfig } from '@/types/Branding'

const DEFAULT_BRANDING: BrandingConfig = {
  logo: undefined,
  brandColor: '#1A1ABC',
  messageTemplate: 'Happy Birthday, {{employeeName}}! From all of us at Acme. 🎉',
  wrapperStyle: 'classic',
}

type BrandingContextValue = {
  branding: BrandingConfig
  updateBranding: (updates: Partial<BrandingConfig>) => void
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined)

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING)

  const updateBranding = useCallback((updates: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...updates }))
  }, [])

  const value = useMemo(() => ({ branding, updateBranding }), [branding, updateBranding])

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
}

export const useBranding = () => {
  const ctx = useContext(BrandingContext)
  if (!ctx) throw new Error('useBranding must be used within BrandingProvider')
  return ctx
}
