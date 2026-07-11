'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  if (status === 'checking') {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500' />
      </div>
    )
  }

  if (status === 'authenticated') {
    return null
  }

  return <>{children}</>
}
