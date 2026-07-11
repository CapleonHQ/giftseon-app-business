'use client'

import { Gift } from 'lucide-react'

export default function EmptyState({ message = 'You have no data here yet!' }: { message?: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-10'>
      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-grey-50'>
        <Gift className='h-6 w-6 text-grey-300' />
      </div>
      <p className='mt-3 text-sm text-grey-400'>{message}</p>
    </div>
  )
}
