import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import StagingBanner from '@/components/StagingBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mark.0 by Zapie',
  description: 'Create, schedule, and publish LinkedIn posts with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StagingBanner />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
