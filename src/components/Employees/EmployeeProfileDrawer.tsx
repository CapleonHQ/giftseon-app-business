'use client'

import { X, CheckCircle2, Circle, Gift } from 'lucide-react'
import type { Employee } from '@/types/Employee'
import { formatDate } from '@/lib/utils/dateTime'

const GIFT_STATUS_STYLES: Record<string, string> = {
  Delivered: 'bg-success-50 text-success-500',
  Claimed: 'bg-information-50 text-information-500',
  Pending: 'text-warning-500',
  Failed: 'bg-error-50 text-error-500',
}

type EmployeeProfileDrawerProps = {
  employee: Employee | null
  onClose: () => void
}

export default function EmployeeProfileDrawer({ employee, onClose }: EmployeeProfileDrawerProps) {
  if (!employee) return null

  const safeDate = (value: string) => {
    try {
      return formatDate(value)
    } catch {
      return value
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />
      <div className='relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl app-shell-scrollbar'>
        <div className='flex items-center justify-between border-b border-grey-100 px-6 py-5'>
          <h3 className='text-lg font-semibold text-blackish'>Employee Profile</h3>
          <button onClick={onClose} className='text-grey-400 hover:text-blackish'>
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='flex-1 px-6 py-6 space-y-6'>
          <div className='flex items-center gap-3'>
            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-600'>
              {employee.name.charAt(0)}
            </div>
            <div>
              <p className='text-base font-semibold text-blackish'>{employee.name}</p>
              <p className='text-sm text-grey-400'>{employee.tag || 'No @tag linked'}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 rounded-xl border border-grey-100 bg-grey-50/40 p-4 text-sm'>
            <div>
              <p className='text-xs text-grey-400'>Department</p>
              <p className='mt-0.5 font-medium text-blackish'>{employee.department}</p>
            </div>
            <div>
              <p className='text-xs text-grey-400'>Role</p>
              <p className='mt-0.5 font-medium text-blackish'>{employee.role}</p>
            </div>
            <div>
              <p className='text-xs text-grey-400'>Date of Joining</p>
              <p className='mt-0.5 font-medium text-blackish'>{safeDate(employee.dateOfJoining)}</p>
            </div>
            <div>
              <p className='text-xs text-grey-400'>Date of Birth</p>
              <p className='mt-0.5 font-medium text-blackish'>{safeDate(employee.dateOfBirth)}</p>
            </div>
            <div>
              <p className='text-xs text-grey-400'>Email</p>
              <p className='mt-0.5 font-medium text-blackish break-all'>{employee.email}</p>
            </div>
            <div>
              <p className='text-xs text-grey-400'>Phone</p>
              <p className='mt-0.5 font-medium text-blackish'>{employee.phone}</p>
            </div>
          </div>

          {/* Profile completion — boolean indicators only, never interests themselves */}
          <div className='rounded-xl border border-grey-100 p-4'>
            <p className='text-sm font-semibold text-blackish'>Giftseon Profile Status</p>
            <div className='mt-3 space-y-2.5'>
              <div className='flex items-center gap-2 text-sm'>
                {employee.profileCompletion === 'Complete' ? (
                  <CheckCircle2 className='h-4 w-4 text-success-500' />
                ) : (
                  <Circle className='h-4 w-4 text-grey-300' />
                )}
                <span className={employee.profileCompletion === 'Complete' ? 'text-blackish' : 'text-grey-500'}>
                  Profile {employee.profileCompletion === 'Complete' ? 'complete' : 'incomplete'}
                </span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                {employee.interestsSet ? (
                  <CheckCircle2 className='h-4 w-4 text-success-500' />
                ) : (
                  <Circle className='h-4 w-4 text-grey-300' />
                )}
                <span className={employee.interestsSet ? 'text-blackish' : 'text-grey-500'}>
                  Gift interests {employee.interestsSet ? 'set' : 'pending'}
                </span>
              </div>
            </div>
            <p className='mt-3 text-xs text-grey-400'>
              For privacy, employees&apos; specific interest selections are only visible to them — you can only see whether their profile is set up.
            </p>
          </div>

          <div>
            <p className='mb-3 text-sm font-semibold text-blackish'>Gifting History</p>
            {employee.giftHistory.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-grey-200 py-8 text-center'>
                <Gift className='h-6 w-6 text-grey-300' />
                <p className='mt-2 text-xs text-grey-400'>No gifts sent to {employee.name.split(' ')[0]} yet.</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {employee.giftHistory.map((gift) => (
                  <div key={gift.id} className='flex items-center justify-between rounded-lg border border-grey-100 px-3.5 py-3'>
                    <div>
                      <p className='text-sm font-medium text-blackish'>{gift.occasion}</p>
                      <p className='text-xs text-grey-400'>{safeDate(gift.date)}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-blackish'>&#8358;{gift.amount.toLocaleString()}</span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${GIFT_STATUS_STYLES[gift.status]}`}>
                        {gift.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
