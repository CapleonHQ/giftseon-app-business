'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import NotificationBell from '@/components/Dashboard/NotificationBell'
import GlobalSearch from '@/components/Dashboard/GlobalSearch'

export default function DashboardHeader({ title = 'Dashboard' }: { title?: string }) {
  const { company } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const companyName = company?.companyName || 'Company'
  const adminFirstName = company?.adminFirstName || 'there'

  return (
    <header className='flex items-center justify-between border-b border-grey-100 bg-white px-6 py-4 lg:px-8'>
      <h1 className='text-xl font-semibold text-blackish lg:text-2xl pl-10 lg:pl-0'>{title}</h1>

      <div className='flex items-center gap-4'>
        <GlobalSearch />

        <NotificationBell />

        <div ref={dropdownRef} className='relative'>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className='flex items-center gap-2 rounded-lg p-1 hover:bg-grey-50 transition-colors'
          >
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-600 overflow-hidden'>
              {company?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.logo} alt={companyName} className='h-full w-full object-cover' />
              ) : (
                companyName.charAt(0)
              )}
            </div>
            <div className='hidden text-left md:block'>
              <p className='text-sm font-medium text-blackish'>{companyName}</p>
              <p className='text-xs text-grey-400'>Hi, {adminFirstName}</p>
            </div>
            <ChevronDown className='hidden h-4 w-4 text-grey-400 md:block' />
          </button>

          {dropdownOpen && (
            <div className='absolute right-0 top-full mt-1 w-48 rounded-lg border border-grey-100 bg-white py-1 shadow-lg'>
              <a href='/settings' className='block px-4 py-2 text-sm text-grey-600 hover:bg-grey-50'>
                Company Profile
              </a>
              <a href='/settings' className='block px-4 py-2 text-sm text-grey-600 hover:bg-grey-50'>
                Settings
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
