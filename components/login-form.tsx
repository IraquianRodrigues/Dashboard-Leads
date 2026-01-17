"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock } from "lucide-react"
import { signInWithEmail } from "@/lib/supabase"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
      {/* Header */}
      <div className="space-y-2">
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
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="iraquianrodrigues@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 pl-10 bg-[#1a1a1a] border-gray-800 text-white placeholder:text-gray-600 focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)] transition-colors"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-300">
            Senha
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pl-10 bg-[#1a1a1a] border-gray-800 text-white placeholder:text-gray-600 focus:border-[var(--whatsapp-green)] focus:ring-1 focus:ring-[var(--whatsapp-green)] transition-colors"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)] text-white font-semibold transition-colors duration-200"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar no Sistema"}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>Sistema restrito. Apenas usuários autorizados da Dashboard WhatsApp</p>
        <p className="mt-2 text-xs">
          Desenvolvido com 💚 por <span className="text-[var(--whatsapp-green)]">AutomateAI</span>
        </p>
      </div>
    </div>
  )
}
