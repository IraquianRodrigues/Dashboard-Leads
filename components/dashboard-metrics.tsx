"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, MessageSquareCode as MessageSquareCheck, Clock, MessageSquareX, Phone } from "lucide-react"
import { getClientes, type Cliente } from "@/lib/supabase"

const calculateMetrics = (clientes: Cliente[]) => {
  const totalLeads = clientes.length
  const interestedLeads = clientes.filter((cliente) => cliente.interessado).length
  const leadsLast7Days = clientes.filter((cliente) => {
    const clienteDate = new Date(cliente.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return clienteDate >= sevenDaysAgo
  }).length
  const conversasTravadas = clientes.filter((cliente) => cliente.trava).length
  const taxaConversao = totalLeads > 0 ? ((interestedLeads / totalLeads) * 100).toFixed(1) : "0"

  return {
    totalLeads,
    interestedLeads,
    leadsLast7Days,
    conversasTravadas,
    taxaConversao,
  }
}

export function DashboardMetrics() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)

  const loadClientes = async () => {
    setLoading(true)
    try {
      const data = await getClientes()
      if (data.length > 0) {
        setClientes(data)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  const metrics = calculateMetrics(clientes)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white shadow-lg shadow-[var(--whatsapp-green)]/20">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard WhatsApp</h2>
            <p className="text-muted-foreground text-sm">Acompanhe o atendimento</p>
          </div>
        </div>
        {!loading && clientes.length > 0 && (
          <div className="text-right hidden md:block">
            <div className="text-sm text-muted-foreground">Última atualização</div>
            <div className="text-xs text-muted-foreground">{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[var(--whatsapp-green)] shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total de Leads</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-[var(--whatsapp-light-green)] flex items-center justify-center group-hover:bg-[var(--whatsapp-green)] group-hover:scale-110 transition-all duration-300">
              <Phone className="h-5 w-5 text-[var(--whatsapp-green)] group-hover:text-white transition-colors duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded"></span>
              ) : (
                metrics.totalLeads.toLocaleString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">Contatos no WhatsApp</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Leads Interessados</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
              <MessageSquareCheck className="h-5 w-5 text-green-500 group-hover:text-white transition-colors duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-3xl font-bold text-green-500">
                {loading ? (
                  <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded"></span>
                ) : (
                  metrics.interestedLeads
                )}
              </div>
              {!loading && metrics.totalLeads > 0 && (
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  ({metrics.taxaConversao}%)
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Responderam positivamente</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Novos (7 dias)</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
              <Clock className="h-5 w-5 text-blue-500 group-hover:text-white transition-colors duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500 mb-1">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded"></span>
              ) : (
                metrics.leadsLast7Days
              )}
            </div>
            <p className="text-xs text-muted-foreground">Novos contatos esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Conversas Travadas</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all duration-300">
              <MessageSquareX className="h-5 w-5 text-red-500 group-hover:text-white transition-colors duration-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500 mb-1">
              {loading ? (
                <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded"></span>
              ) : (
                metrics.conversasTravadas
              )}
            </div>
            <p className="text-xs text-muted-foreground">Conversas pausadas/travadas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
