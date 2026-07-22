'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Right after OTP verification a user becomes "authenticated" but is still
  // partway through the registration wizard's company-details/verification
  // steps (3 and 4) — the wizard manages its own multi-step completion and
  // only navigates to /dashboard explicitly once it's actually done (see
  // handleEnterDashboard in register/page.tsx). Never force-redirect away
  // from /register on account of auth status alone, or a user could get
  // bounced out mid-wizard with a session but no company/verification yet.
  const isOnRegisterPage = pathname === '/register'

  useEffect(() => {
    if (status === 'authenticated' && !isOnRegisterPage) {
      router.replace('/dashboard')
    }
  }, [status, isOnRegisterPage, router])

  if (status === 'checking') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500' />
      </div>
    )
  }

  if (status === 'authenticated' && !isOnRegisterPage) {
    return null
  }

  return <>{children}</>
}
