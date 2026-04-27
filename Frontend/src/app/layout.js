import { Geist, Geist_Mono } from 'next/font/google'
import QueryProvider          from '@/providers/QueryProvider'
import './globals.css'

// Load Google Fonts — Geist is clean and modern, perfect for dashboards
const geistSans = Geist({
  variable: '--font-body',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-display',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Forkcast — Restaurant Analytics',
  description: 'B2B analytics dashboard for restaurant performance',
}

// This is the root layout — every page in the app is wrapped in this.
// We add the fonts and the QueryProvider here so they're available everywhere.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}