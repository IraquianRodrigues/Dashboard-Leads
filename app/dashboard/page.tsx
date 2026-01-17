"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { LeadsTable } from "@/components/leads-table"
import { getCurrentUser, onAuthStateChange } from "@/lib/supabase"
import { MessageCircle } from "lucide-react"

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser()

        if (user && !error) {
          setIsAuthenticated(true)
          setUser(user)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("[error]", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    let subscription: any = null

    const setupAuthListener = async () => {
      try {
        const { data } = await onAuthStateChange((user) => {
          if (user) {
            setIsAuthenticated(true)
            setUser(user)
          } else {
            setIsAuthenticated(false)
            setUser(null)
            router.push("/")
          }
        })
        subscription = data.subscription
      } catch (error) {
        console.error("[v0] Auth listener setup failed:", error)
      }
    }

    setupAuthListener()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4 animate-in fade-in duration-500">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-[var(--whatsapp-green)] mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MessageCircle className="h-7 w-7 text-[var(--whatsapp-green)] animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-foreground font-semibold text-lg">Carregando dashboard...</p>
            <p className="text-sm text-muted-foreground mt-2">Aguarde um momento</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8 max-w-7xl">
        <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <DashboardMetrics />
          <LeadsTable />
        </div>
      </div>
    </div>
  )
}
