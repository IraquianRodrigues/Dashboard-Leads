import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const geistSans = GeistSans.variable
const geistMono = GeistMono.variable

export const metadata: Metadata = {
  title: "Dashboard Leads - CRM Profissional",
  description: "Sistema de gerenciamento de leads e CRM profissional",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${geistSans} ${geistMono} dark antialiased`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
