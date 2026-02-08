"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  GraduationCap, 
  Menu, 
  X,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Kanban,
  Users,
  BarChart3,
  CheckCircle2
} from "lucide-react"
import { getCurrentUser, signOut } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/dashboard/pipeline", icon: Kanban },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Tarefas", href: "/dashboard/tasks", icon: CheckCircle2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Cursos", href: "/dashboard/cursos", icon: GraduationCap },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { user } = await getCurrentUser()
    setUser(user)
  }

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
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header - Logo */}
          <div className={cn(
            "flex items-center gap-3 px-6 py-6 relative",
            isCollapsed && "justify-center px-4"
          )}>
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-zinc-900 text-white border border-zinc-800 flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="font-semibold text-base truncate">TopCursos</h2>
                <p className="text-xs text-muted-foreground truncate">Workspace</p>
              </div>
            )}
            
            {/* Botão de Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-foreground shadow-sm transition-all z-10"
              title={isCollapsed ? "Expandir sidebar" : "Minimizar sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronLeft className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = item.href === "/dashboard" 
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-zinc-900 text-white shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    isActive ? "text-[#25D366]" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-border p-3">
            {user && !isCollapsed && (
              <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border border-border flex-shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{userEmail.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Collapsed User */}
            {user && isCollapsed && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium border border-border">
                  {initials}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
