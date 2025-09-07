import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Navigation } from "@/components/navigation"
import { ServicesProvider } from "@/contexts/services-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Merakii Nails - Uñas impecables, sin vueltas",
  description: "Estudio profesional de uñas. Diseños únicos, técnicas profesionales y la mejor atención personalizada.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <ServicesProvider>
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
        </ServicesProvider>
      </body>
    </html>
  )
}
