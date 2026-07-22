'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { status, company } = useAuth()
  const router = useRouter()

  // A session can exist without a Company row if the registration wizard was
  // interrupted right after OTP verification (before the company-details /
  // verification steps ran) — send them back to finish it instead of
  // rendering a dashboard with nothing behind it.
  const needsCompanySetup = status === 'authenticated' && !company

  useEffect(() => {
    if (!DEV_BYPASS && status === 'unauthenticated') {
      const currentPath = `${window.location.pathname}${window.location.search}`
      router.replace(`/login?next=${encodeURIComponent(currentPath)}`)
    } else if (!DEV_BYPASS && needsCompanySetup) {
      router.replace('/register')
    }
  }, [status, needsCompanySetup, router])

  if (DEV_BYPASS) {
    return <>{children}</>
  }

  if (status === 'checking') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500' />
      </div>
    )
  }

  if (status !== 'authenticated' || needsCompanySetup) {
    return null
  }

  return <>{children}</>
}

export default AuthGuard
