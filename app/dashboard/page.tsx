"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardMetrics } from "@/components/dashboard-metrics"
import { LeadsTable } from "@/components/leads-table"
import { LeadsBySourceCard } from "@/components/leads-by-source"
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-in fade-in duration-500">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-zinc-900 dark:border-white mx-auto"></div>
          </div>
          <div>
            <p className="text-foreground font-medium text-sm">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 max-w-7xl">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <DashboardMetrics />
          <LeadsBySourceCard />
          <LeadsTable />
        </div>
      </div>
    </div>
  )
}
