import type React from "react"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background/50 transition-all duration-300 lg:ml-64">
        {children}
      </main>
    </div>
  )
}
