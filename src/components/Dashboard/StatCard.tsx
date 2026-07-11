'use client'

import type { ReactNode } from 'react'

type StatCardProps = {
  label: string
  value: string
  subtitle?: string
  icon?: ReactNode
  iconBg?: string
}

export default function StatCard({ label, value, subtitle, icon, iconBg = 'bg-primary-50' }: StatCardProps) {
  return (
    <div className='rounded-xl border border-grey-100 bg-white p-4'>
      <div className='flex items-start justify-between'>
        <p className='text-sm text-grey-500'>{label}</p>
        {icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
      <p className='mt-2 text-2xl font-bold text-blackish'>{value}</p>
      {subtitle && <p className='mt-1 text-xs text-grey-400'>{subtitle}</p>}
    </div>
  )
}
