'use client'

import AuthGuard from '@/components/Auth/AuthGuard'
import Sidebar from '@/components/Dashboard/Sidebar'
import { Toaster } from 'sonner'
import { EmployeesProvider } from '@/context/EmployeesContext'
import { GiftingProvider } from '@/context/GiftingContext'
import { WalletProvider } from '@/context/WalletContext'
import { BrandingProvider } from '@/context/BrandingContext'
import { NotificationsProvider } from '@/context/NotificationsContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <NotificationsProvider>
        <EmployeesProvider>
          <GiftingProvider>
            <WalletProvider>
              <BrandingProvider>
                <div className='flex min-h-screen bg-grey-50/30'>
                  <Sidebar />
                  <main className='flex-1 overflow-y-auto app-shell-scrollbar'>
                    {children}
                  </main>
                </div>
                <Toaster
                  position='top-right'
                  richColors
                  toastOptions={{
                    className: 'font-[family-name:var(--font-degular)]',
                  }}
                />
              </BrandingProvider>
            </WalletProvider>
          </GiftingProvider>
        </EmployeesProvider>
      </NotificationsProvider>
    </AuthGuard>
  )
}
