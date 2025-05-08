// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Phòng đọc sách Thép Tây Đô',
  description: 'Hệ thống phòng đọc sách Thép Tây Đô',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Font từ Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300&display=swap"
          rel="stylesheet"
        />

        {/* Font Computer Modern */}
        <link
          rel="stylesheet"
          href="https://cdn.rawgit.com/dreampulse/computer-modern-web-font/master/fonts.css"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />

      </head>
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
