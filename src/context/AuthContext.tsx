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
import * as authApi from '@/lib/api/auth'
import * as companyApi from '@/lib/api/company'
import { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/api/client'

const CACHE_KEY = 'Giftseon_business:auth:v2'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

type AuthCache = { version: 2; user: authApi.AuthUser; company: CompanyProfile | null }

type AuthContextValue = {
  status: AuthStatus
  user: authApi.AuthUser | null
  company: CompanyProfile | null
  registerAccount: (payload: authApi.RegisterPayload) => Promise<void>
  loginWithPassword: (email: string, password: string) => Promise<void>
  verifyOtp: (email: string, otp: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  logout: () => Promise<void>
  refreshCompany: () => Promise<CompanyProfile | null>
  setCompany: (company: CompanyProfile) => void
  updateCompany: (updates: Partial<CompanyProfile>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const readCache = (): { user: authApi.AuthUser; company: CompanyProfile | null } | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthCache
    if (parsed.version !== 2 || !parsed.user) return null
    return { user: parsed.user, company: parsed.company }
  } catch {
    return null
  }
}

const writeCache = (user: authApi.AuthUser, company: CompanyProfile | null) => {
  if (typeof window === 'undefined') return
  const payload: AuthCache = { version: 2, user, company }
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload))
}

const clearCache = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(CACHE_KEY)
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [user, setUser] = useState<authApi.AuthUser | null>(null)
  const [company, setCompanyState] = useState<CompanyProfile | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    const cached = readCache()
    if (!token || !cached) {
      clearCache()
      setStatus('unauthenticated')
      return
    }
    setUser(cached.user)
    setCompanyState(cached.company)
    setStatus('authenticated')

    // Revalidate in the background — clears the session if the token expired server-side.
    companyApi
      .getCompanyProfile()
      .then((backendCompany) => {
        const profile = companyApi.toCompanyProfile(backendCompany, cached.user)
        setCompanyState(profile)
        writeCache(cached.user, profile)
      })
      .catch((err: { statusCode?: number }) => {
        if (err.statusCode === 401) {
          clearAuthToken()
          clearCache()
          setUser(null)
          setCompanyState(null)
          setStatus('unauthenticated')
        }
        // 404 (no company profile created yet) or a network error: stay
        // authenticated, company stays whatever was cached (possibly null).
      })
  }, [])

  const establishSession = useCallback(
    (authUser: authApi.AuthUser, token: string, companyProfile: CompanyProfile | null) => {
      setAuthToken(token)
      setUser(authUser)
      setCompanyState(companyProfile)
      writeCache(authUser, companyProfile)
      setStatus('authenticated')
    },
    []
  )

  const fetchCompanyProfile = useCallback(async (authUser: authApi.AuthUser) => {
    try {
      const backendCompany = await companyApi.getCompanyProfile()
      return companyApi.toCompanyProfile(backendCompany, authUser)
    } catch {
      return null
    }
  }, [])

  const registerAccount = useCallback(async (payload: authApi.RegisterPayload) => {
    await authApi.register(payload)
  }, [])

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login({ email, password })
      if (result.type === 'jwt' && result.token && result.user) {
        const profile = await fetchCompanyProfile(result.user)
        establishSession(result.user, result.token, profile)
        return
      }
      throw { message: 'Please verify the OTP sent to your email to continue.', statusCode: 401 }
    },
    [establishSession, fetchCompanyProfile]
  )

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      const result = await authApi.verifyOtp({ email, otp })
      const profile = await fetchCompanyProfile(result.user)
      establishSession(result.user, result.token, profile)
    },
    [establishSession, fetchCompanyProfile]
  )

  const resendVerification = useCallback((email: string) => authApi.resendVerification(email), [])
  const forgotPassword = useCallback((email: string) => authApi.forgotPassword(email), [])
  const resetPassword = useCallback(
    (token: string, newPassword: string) => authApi.resetPassword(token, newPassword),
    []
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // best-effort — clear local session regardless
    }
    clearAuthToken()
    clearCache()
    setUser(null)
    setCompanyState(null)
    setStatus('unauthenticated')
  }, [])

  const refreshCompany = useCallback(async () => {
    if (!user) return null
    const profile = await fetchCompanyProfile(user)
    setCompanyState(profile)
    if (profile) writeCache(user, profile)
    return profile
  }, [user, fetchCompanyProfile])

  const setCompany = useCallback(
    (profile: CompanyProfile) => {
      setCompanyState(profile)
      if (user) writeCache(user, profile)
    },
    [user]
  )

  const updateCompany = useCallback(
    (updates: Partial<CompanyProfile>) => {
      setCompanyState((prev) => {
        if (!prev) return prev
        const next = { ...prev, ...updates, updatedAt: new Date().toISOString() }
        if (user) writeCache(user, next)
        return next
      })

      const backendPayload: Partial<companyApi.CreateCompanyPayload> = {}
      if (updates.companyName !== undefined) backendPayload.businessName = updates.companyName
      if (updates.businessType !== undefined) backendPayload.businessType = updates.businessType
      if (updates.industry !== undefined) backendPayload.industry = updates.industry
      if (updates.logo !== undefined) backendPayload.logoUrl = updates.logo

      if (Object.keys(backendPayload).length > 0) {
        companyApi.updateCompanyProfile(backendPayload).catch(() => {
          // optimistic local update stands; will reconcile on next profile fetch
        })
      }
    },
    [user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      company,
      registerAccount,
      loginWithPassword,
      verifyOtp,
      resendVerification,
      forgotPassword,
      resetPassword,
      logout,
      refreshCompany,
      setCompany,
      updateCompany,
    }),
    [
      status,
      user,
      company,
      registerAccount,
      loginWithPassword,
      verifyOtp,
      resendVerification,
      forgotPassword,
      resetPassword,
      logout,
      refreshCompany,
      setCompany,
      updateCompany,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
