import { LoginForm } from "@/components/login-form"
import { MessageCircle, BarChart3, Users, TrendingUp, Sparkles, Zap, Shield } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#050810] to-[#0d1520] animate-gradient-shift" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-[#25D366] rounded-full animate-float opacity-60" />
        <div className="absolute top-[20%] right-[25%] w-3 h-3 bg-[#25D366] rounded-full animate-float-slow opacity-40" />
        <div className="absolute top-[60%] left-[10%] w-2 h-2 bg-[#25D366] rounded-full animate-float-slower opacity-50" />
        <div className="absolute bottom-[30%] right-[15%] w-2 h-2 bg-[#25D366] rounded-full animate-float opacity-70" />
        <div className="absolute top-[40%] left-[45%] w-1 h-1 bg-white rounded-full animate-pulse-slow opacity-30" />
        <div className="absolute top-[70%] right-[40%] w-1 h-1 bg-white rounded-full animate-pulse opacity-40" />
      </div>

      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10">
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-[#075E54] to-[#25D366] rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-[#34B7F1] to-[#25D366] rounded-full blur-3xl animate-float-slower opacity-50" />
        </div>

        {/* Logo and Title */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 group">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-2xl shadow-[#25D366]/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[#25D366]/50">
              <MessageCircle className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard WhatsApp</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Gerencie seus leads de forma{" "}
              <span className="bg-gradient-to-r from-[#25D366] via-[#34B7F1] to-[#25D366] bg-clip-text text-transparent animate-gradient-shift">
                profissional
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
              Uma suíte completa de ferramentas para você controlar conversas, otimizar o atendimento e maximizar o desempenho dos seus leads.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div className="group space-y-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#25D366]/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/20 border border-[#25D366]/30 group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-6 w-6 text-[#25D366]" />
            </div>
            <h3 className="text-white font-semibold">Gestão Completa</h3>
            <p className="text-gray-400 text-sm">Controle total de operação</p>
          </div>

          <div className="group space-y-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#25D366]/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/20 border border-[#25D366]/30 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-[#25D366]" />
            </div>
            <h3 className="text-white font-semibold">Métricas Inteligentes</h3>
            <p className="text-gray-400 text-sm">Organização eficiente</p>
          </div>

          <div className="group space-y-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-[#25D366]/30 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#25D366]/20 to-[#128C7E]/20 border border-[#25D366]/30 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-[#25D366]" />
            </div>
            <h3 className="text-white font-semibold">Leads</h3>
            <p className="text-gray-400 text-sm">Histórico e prontuários</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="relative z-10 flex items-center gap-8 mt-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Shield className="h-4 w-4 text-[#25D366]" />
            <span>Seguro e Criptografado</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Zap className="h-4 w-4 text-[#25D366]" />
            <span>Rápido e Eficiente</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Sparkles className="h-4 w-4 text-[#25D366]" />
            <span>Interface Moderna</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
