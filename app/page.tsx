import { LoginForm } from "@/components/login-form"
import { MessageCircle, BarChart3, Users, TrendingUp } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a2332] via-[#0f1419] to-[#1a2332] p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[var(--whatsapp-green)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--whatsapp-green)] rounded-full blur-3xl" />
        </div>

        {/* Logo and Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Dashboard WhatsApp</h1>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Gerencie seus leads de forma{" "}
              <span className="text-[var(--whatsapp-green)]">profissional</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md">
              Uma suíte completa de ferramentas para você controlar conversas, otimizar o atendimento e maximizar o desempenho dos seus leads.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--whatsapp-green)]/10 border border-[var(--whatsapp-green)]/20">
              <BarChart3 className="h-6 w-6 text-[var(--whatsapp-green)]" />
            </div>
            <h3 className="text-white font-semibold">Gestão Completa</h3>
            <p className="text-gray-400 text-sm">Controle total de operação</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--whatsapp-green)]/10 border border-[var(--whatsapp-green)]/20">
              <TrendingUp className="h-6 w-6 text-[var(--whatsapp-green)]" />
            </div>
            <h3 className="text-white font-semibold">Métricas Inteligentes</h3>
            <p className="text-gray-400 text-sm">Organização eficiente</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--whatsapp-green)]/10 border border-[var(--whatsapp-green)]/20">
              <Users className="h-6 w-6 text-[var(--whatsapp-green)]" />
            </div>
            <h3 className="text-white font-semibold">Leads</h3>
            <p className="text-gray-400 text-sm">Histórico e prontuários</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
