"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { signInWithEmail } from "@/lib/supabase"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    try {
      const { data, error } = await signInWithEmail(trimmedEmail, trimmedPassword)

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message || "Credenciais inválidas",
          variant: "destructive",
        })
      } else if (data.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Dashboard WhatsApp",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Glassmorphism Card */}
      <div className="glass-card rounded-3xl p-8 space-y-8 shadow-2xl">
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-lg shadow-[#25D366]/30 mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Bem-vindo de volta</h2>
          <p className="text-gray-400">Insira suas credenciais para acessar o sistema</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 transition-colors duration-300 ${
                  focusedField === 'email' ? 'text-[#25D366]' : 'text-gray-500'
                }`} />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="iraquianrodrigues@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                className="h-14 pl-12 pr-4 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:bg-white/10 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all duration-300"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-300">
              Senha
            </Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-[#25D366]' : 'text-gray-500'
                }`} />
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                required
                className="h-14 pl-12 pr-4 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl focus:bg-white/10 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all duration-300"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-[1.02] group"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Entrando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>Entrar no Sistema</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-500">
          Sistema restrito. Apenas usuários autorizados da Dashboard WhatsApp
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <span>Desenvolvido com</span>
          <span className="text-[#25D366] animate-pulse">💚</span>
          <span>por</span>
          <span className="text-[#25D366] font-semibold">AutomateAI</span>
        </div>
      </div>
    </div>
  )
}
