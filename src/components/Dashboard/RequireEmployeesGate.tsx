'use client'

import { useRouter } from 'next/navigation'
import { Users, Upload, UserPlus } from 'lucide-react'
import { useEmployees } from '@/context/EmployeesContext'

interface RequireEmployeesGateProps {
  pageLabel: string
  children: React.ReactNode
}

export default function RequireEmployeesGate({ pageLabel, children }: RequireEmployeesGateProps) {
  const router = useRouter()
  const { employees } = useEmployees()

  if (employees.length > 0) return <>{children}</>

  return (
    <div className='flex flex-1 items-center justify-center py-12'>
      <div className='max-w-md rounded-xl border border-grey-100 bg-white p-8 text-center'>
        <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50'>
          <Users className='h-6 w-6 text-primary-500' />
        </div>
        <h2 className='text-base font-semibold text-blackish'>Add your team to get started</h2>
        <p className='mt-2 text-sm text-grey-500'>
          {pageLabel} needs your employee list first — once you&apos;ve added your team, this page comes to life with real data instead of a blank slate.
        </p>
        <div className='mt-6 flex flex-col gap-2 sm:flex-row'>
          <button
            onClick={() => router.push('/employees/new')}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-grey-200 py-2.5 text-sm font-medium text-grey-600 hover:bg-grey-50 transition-colors'
          >
            <UserPlus className='h-4 w-4' /> Add manually
          </button>
          <button
            onClick={() => router.push('/employees/bulk-upload')}
            className='flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium text-white transition-all'
            style={{ background: 'linear-gradient(to bottom, var(--primary-400) 17.5%, var(--primary-600))' }}
          >
            <Upload className='h-4 w-4' /> Upload spreadsheet
          </button>
        </div>
      </div>
    </div>
  )
}
