'use client'

import { useState } from 'react'
import type { NotificationCategory } from '@/types/Settings'

const INITIAL_SETTINGS: NotificationCategory[] = [
  {
    title: 'GIFTING ACTIVITY',
    items: [
      { label: 'Get notified when a gift is automatically triggered for an employee.', email: false, inApp: true, sms: false },
      { label: 'Be updated when a gift is claimed or delivered.', email: true, inApp: true, sms: false },
      { label: 'Get alerted if a gift fails to send or deliver.', email: true, inApp: true, sms: true },
    ],
  },
  {
    title: 'BUDGET & WALLET ALERTS',
    items: [
      { label: 'Be notified when your company wallet balance falls below your threshold.', email: true, inApp: true, sms: false },
      { label: 'Get updates whenever your wallet is topped up.', email: false, inApp: true, sms: false },
      { label: 'Receive alerts when you’re approaching your gifting budget cap.', email: true, inApp: true, sms: false },
    ],
  },
  {
    title: 'EMPLOYEE & PLATFORM UPDATES',
    items: [
      { label: 'Get notified when a new employee completes their Giftseon profile.', email: false, inApp: true, sms: false },
      { label: 'Stay informed about new features, gifting formats, and announcements.', email: false, inApp: true, sms: false },
      { label: 'Receive periodic summaries of your company’s gifting activity.', email: true, inApp: false, sms: false },
    ],
  },
]

export default function NotificationsTab() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS)

  const toggleSetting = (
    catIndex: number,
    itemIndex: number,
    channel: 'email' | 'inApp' | 'sms'
  ) => {
    setSettings((prev) =>
      prev.map((cat, ci) => {
        if (ci !== catIndex) return cat
        return {
          ...cat,
          items: cat.items.map((item, ii) => {
            if (ii !== itemIndex) return item
            return { ...item, [channel]: !item[channel] }
          }),
        }
      })
    )
  }

  return (
    <div>
      <h3 className='text-base font-semibold text-blackish'>Notifications</h3>
      <p className='text-sm text-grey-400'>
        Choose how and when you&apos;d like to be notified about activities on your company account.
      </p>

      <div className='mt-5'>
        <div className='flex items-center border-b border-grey-100 pb-3'>
          <div className='flex-1 text-sm font-medium text-grey-500'>Notification Type</div>
          <div className='flex w-48 justify-between text-sm font-medium text-grey-500 md:w-56'>
            <span className='w-16 text-center'>Email</span>
            <span className='w-16 text-center'>In-App</span>
            <span className='w-16 text-center'>SMS</span>
          </div>
        </div>

        {settings.map((category, catIndex) => (
          <div key={category.title} className='mt-5'>
            <p className='mb-3 text-xs font-semibold tracking-wide text-grey-500'>
              {category.title}
            </p>
            <div className='space-y-3'>
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className='flex items-start'>
                  <p className='flex-1 text-sm text-grey-700 pr-4'>{item.label}</p>
                  <div className='flex w-48 shrink-0 justify-between md:w-56'>
                    {(['email', 'inApp', 'sms'] as const).map((channel) => (
                      <div key={channel} className='flex w-16 justify-center'>
                        <button
                          onClick={() => toggleSetting(catIndex, itemIndex, channel)}
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                            item[channel]
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-grey-300 bg-white hover:border-grey-400'
                          }`}
                        >
                          {item[channel] && (
                            <svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
                              <path d='M2.5 6L5 8.5L9.5 4' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
