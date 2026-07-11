'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!DEV_BYPASS && status === 'unauthenticated') {
      const currentPath = `${window.location.pathname}${window.location.search}`
      router.replace(`/login?next=${encodeURIComponent(currentPath)}`)
    }
  }, [status, router])

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

  if (status !== 'authenticated') {
    return null
  }

  return <>{children}</>
}

export default AuthGuard
