import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import degular from '@/assets/fonts/degular'
import georgia from '@/assets/fonts/georgia'
import QueryProvider from '@/components/Providers/QueryProvider'
import { AuthProvider } from '@/context/AuthContext'
import { SuccessModalProvider } from '@/context/SuccessModalContext'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Giftseon Business',
    template: '%s | Giftseon Business',
  },
  description:
    'Giftseon Business is the company dashboard HR managers and founders use to configure and track automated employee and client gifting on Giftseon.',
  keywords: [
    'company dashboard',
    'employee gifting',
    'corporate gifting',
    'gifting automation',
    'HR gifting platform',
    'Giftseon business',
  ],
  authors: [{ name: 'Giftseon Team' }],
  creator: 'Giftseon',
  publisher: 'Giftseon',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${degular.variable} ${georgia.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <SuccessModalProvider>
              {children}
            </SuccessModalProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
