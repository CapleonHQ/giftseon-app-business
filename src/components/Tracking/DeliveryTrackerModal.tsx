'use client'

import { useEffect, useState } from 'react'
import { X, Truck, MapPin } from 'lucide-react'
import type { PhysicalDelivery } from '@/types/Tracking'

interface DeliveryTrackerModalProps {
  delivery: PhysicalDelivery | null
  onClose: () => void
}

export default function DeliveryTrackerModal({ delivery, onClose }: DeliveryTrackerModalProps) {
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    if (!delivery) return
    setSecondsAgo(0)
    const interval = setInterval(() => setSecondsAgo((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [delivery])

  if (!delivery) return null

  const currentStepIndex = delivery.steps.findIndex((s) => !s.completed)
  const activeIndex = currentStepIndex === -1 ? delivery.steps.length - 1 : currentStepIndex

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
      <div className='w-full max-w-md rounded-xl bg-white p-6 shadow-xl'>
        <div className='mb-1 flex items-start justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-blackish'>Live tracking</h3>
            <p className='text-xs text-grey-400'>{delivery.item} · {delivery.employee}</p>
          </div>
          <button onClick={onClose} className='text-grey-400 hover:text-blackish'><X className='h-5 w-5' /></button>
        </div>

        <div className='mt-4 flex items-center justify-between rounded-lg border border-grey-100 bg-grey-50/50 px-4 py-3 text-sm'>
          <div className='flex items-center gap-2'>
            <Truck className='h-4 w-4 text-primary-500' />
            <span className='text-blackish'>{delivery.courier}</span>
          </div>
          <span className='text-grey-400'>Ref: {delivery.trackingRef}</span>
        </div>

        <div className='mt-2 flex items-center gap-1.5 text-xs text-success-500'>
          <span className='relative flex h-2 w-2'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-success-500' />
          </span>
          Live · updated {secondsAgo}s ago
        </div>

        <div className='mt-5 space-y-0'>
          {delivery.steps.map((step, i) => {
            const isActive = i === activeIndex
            return (
              <div key={step.label} className='flex gap-3'>
                <div className='flex flex-col items-center'>
                  <span className={`relative flex h-5 w-5 items-center justify-center rounded-full ${
                    step.completed ? 'bg-success-500' : isActive ? 'bg-primary-500' : 'bg-grey-200'
                  }`}>
                    {isActive && !step.completed && (
                      <span className='absolute h-5 w-5 animate-ping rounded-full bg-primary-400 opacity-60' />
                    )}
                    <MapPin className='relative h-3 w-3 text-white' />
                  </span>
                  {i < delivery.steps.length - 1 && (
                    <span className={`h-8 w-0.5 ${step.completed ? 'bg-success-500' : 'bg-grey-200'}`} />
                  )}
                </div>
                <div className='pb-6'>
                  <p className={`text-sm font-medium ${step.completed || isActive ? 'text-blackish' : 'text-grey-400'}`}>{step.label}</p>
                  <p className='text-xs text-grey-400'>{step.timestamp}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className='rounded-lg bg-primary-50/60 px-4 py-3 text-sm text-primary-700'>{delivery.eta}</div>
      </div>
    </div>
  )
}
