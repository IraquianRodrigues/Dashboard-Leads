"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle } from "lucide-react"
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

    try {
      const { data, error } = await signInWithEmail(email, password)

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
    <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4 pb-6">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white shadow-lg shadow-[var(--whatsapp-green)]/30">
            <MessageCircle className="h-8 w-8" />
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Dashboard WhatsApp</CardTitle>
          <p className="text-sm text-muted-foreground">Sistema fechado - Apenas usuários autorizados</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 transition-all duration-200 focus-visible:ring-[var(--whatsapp-green)]"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 transition-all duration-200 focus-visible:ring-[var(--whatsapp-green)]"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] hover:from-[var(--whatsapp-dark-green)] hover:to-[var(--whatsapp-green)] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
