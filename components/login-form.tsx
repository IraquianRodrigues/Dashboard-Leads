"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowRight } from "lucide-react"
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
          title: "Acesso negado",
          description: error.message || "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        })
      } else if (data.user) {
        toast({
          title: "Bem-vindo de volta!",
          description: "Redirecionando para o dashboard...",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email Corporativo
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="nome@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-md focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-300">
                    Senha
                </Label>
                <a href="#" className="text-xs text-[#25D366] hover:text-[#25D366]/80 transition-colors">
                    Esqueceu a senha?
                </a>
            </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-md focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] transition-all"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 bg-[#25D366] hover:bg-[#20b857] text-[#09090b] font-semibold rounded-md transition-all duration-200 mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processando...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Acessar Plataforma</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        )}
      </Button>
    </form>
  )
}
