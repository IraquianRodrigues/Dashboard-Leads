"use client"


import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, MessageCircle } from "lucide-react"
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

  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white shadow-md shadow-[var(--whatsapp-green)]/20">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{process.env.NEXT_PUBLIC_DASHBOARD_NAME! ?? "Painel Atendimento"}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">Olá, {user?.email || "Usuário"}</span>
            <Button variant="outline" className="cursor-pointer hover:bg-accent transition-colors duration-200" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
