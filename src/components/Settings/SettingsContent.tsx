'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import ProfileBanner from '@/components/Settings/ProfileBanner'
import CompanyInfoTab from '@/components/Settings/CompanyInfoTab'
import NotificationsTab from '@/components/Settings/NotificationsTab'
import SecurityTab from '@/components/Settings/SecurityTab'
import { useAuth } from '@/context/AuthContext'

const TABS = ['Company Information', 'Notifications', 'Security'] as const
type Tab = (typeof TABS)[number]

export default function SettingsContent() {
  const { company, updateCompany } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('Company Information')

  return (
    <div className='flex flex-col'>
      <DashboardHeader title='Settings' />
      <div className='p-6 lg:p-8'>
        <div className='rounded-xl border border-grey-100 bg-white'>
          <ProfileBanner
            companyName={company?.companyName || 'Your Company'}
            businessType={company?.businessType || 'Company'}
            isVerified={company?.isVerified ?? false}
            logoUrl={company?.logo}
            onLogoChange={(file) => updateCompany({ logo: URL.createObjectURL(file) })}
          />

          <div className='mt-14 border-b border-grey-100 px-8'>
            <div className='flex'>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab ? 'text-primary-500' : 'text-grey-400 hover:text-grey-600'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className='absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary-500' />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className='p-8'>
            {activeTab === 'Company Information' && <CompanyInfoTab />}
            {activeTab === 'Notifications' && <NotificationsTab />}
            {activeTab === 'Security' && <SecurityTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
