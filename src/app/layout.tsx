import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { WalletProvider } from '@/contexts/WalletContext'
import '../styles/FlappyGame.css'
import { FlapsProvider } from '@/contexts/FlapsContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-white min-h-screen w-screen overflow-x-hidden bg-black`}>
        <WalletProvider>
          <FlapsProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </FlapsProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
