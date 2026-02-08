import { LoginForm } from "@/components/login-form"
import { MessageCircle, ShieldCheck, Zap, LayoutDashboard } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-[#09090b] text-white overflow-hidden">
      {/* Left Side - Visual Narrative (60%) */}
      <div className="hidden lg:flex w-[60%] relative bg-[#0c0c0e] items-center justify-center p-12 overflow-hidden border-r border-[#27272a]">
        {/* Subtle Background Pattern - Dot Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>
        
        {/* Abstract Architectural Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-[#25D366]/5 rounded-full animate-[spin_120s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-[#25D366]/10 rounded-full animate-[spin_90s_linear_infinite_reverse]" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#25D366]/20 bg-[#25D366]/5 text-[#25D366] text-xs font-medium tracking-wide uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
              </span>
              Sistema Online
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white/90 leading-tight">
              Gerencie seus leads com <span className="text-[#25D366]">inteligência</span>.
            </h1>
            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed mt-6">
              A plataforma definitiva para centralizar conversas, automações e métricas do WhatsApp em um único lugar.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-16 border-t border-zinc-800 pt-12">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20">
                <LayoutDashboard className="w-5 h-5 text-[#25D366]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Dashboard Central</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Visão 360º de toda sua operação de atendimento e vendas.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20">
                <Zap className="w-5 h-5 text-[#25D366]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Automação Real</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Responda leads instantaneamente e aumente sua conversão.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Interaction Area (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center px-8 sm:px-12 xl:px-24 bg-[#09090b] relative">
         <div className="absolute top-8 right-8 lg:hidden">
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
         </div>
         
         <div className="max-w-[400px] mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 rounded-lg bg-[#25D366] text-black mb-6">
                 <MessageCircle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">Acesse sua conta</h2>
              <p className="text-zinc-500 text-sm">
                Entre com suas credenciais para continuar.
              </p>
            </div>

            <LoginForm />

            <div className="mt-10 pt-6 border-t border-zinc-800 text-center lg:text-left">
               <div className="flex items-center justify-center lg:justify-start gap-2 text-zinc-600 text-xs">
                 <ShieldCheck className="w-3.5 h-3.5" />
                 <span>Ambiente seguro e criptografado de ponta a ponta.</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
