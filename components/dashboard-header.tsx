"use client"


import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, MessageCircle, User } from "lucide-react"
import { signOut } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface DashboardHeaderProps {
  user?: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const { error } = await signOut()

      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso",
        })
        router.push("/")
      }
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  // Get user initials from email
  const getUserInitials = (email: string) => {
    if (!email) return "U"
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  const userEmail = user?.email || "usuario@email.com"
  const initials = getUserInitials(userEmail)

  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Dashboard Leads</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Gestão de Leads</p>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-3">
            {/* User Avatar and Info */}
            <div className="hidden md:flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-md">
                {initials}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground leading-none">{userEmail.split("@")[0]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Administrador</p>
              </div>
            </div>

            {/* Mobile Avatar */}
            <div className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white font-semibold text-sm shadow-md">
              {initials}
            </div>

            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
