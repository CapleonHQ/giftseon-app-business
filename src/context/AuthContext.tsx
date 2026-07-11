'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CompanyProfile } from '@/types/Company'

const STORAGE_KEY = 'Giftseon_business:auth:v1'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

type AuthCache = {
  version: 1
  company: CompanyProfile
}

type AuthContextValue = {
  status: AuthStatus
  company: CompanyProfile | null
  login: (profile: CompanyProfile) => void
  logout: () => void
  updateCompany: (updates: Partial<CompanyProfile>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const readCache = (): CompanyProfile | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthCache
    if (parsed.version !== 1 || !parsed.company) return null
    return parsed.company
  } catch {
    return null
  }
}

const writeCache = (company: CompanyProfile) => {
  if (typeof window === 'undefined') return
  const payload: AuthCache = { version: 1, company }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

const clearCache = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [company, setCompany] = useState<CompanyProfile | null>(null)

  useEffect(() => {
    const cached = readCache()
    if (cached) {
      setCompany(cached)
      setStatus('authenticated')
    } else {
      setStatus('unauthenticated')
    }
  }, [])

  const login = useCallback((profile: CompanyProfile) => {
    setCompany(profile)
    writeCache(profile)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    setCompany(null)
    clearCache()
    setStatus('unauthenticated')
  }, [])

  const updateCompany = useCallback((updates: Partial<CompanyProfile>) => {
    setCompany((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...updates, updatedAt: new Date().toISOString() }
      writeCache(next)
      return next
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, company, login, logout, updateCompany }),
    [status, company, login, logout, updateCompany]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
