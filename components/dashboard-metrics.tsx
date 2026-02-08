"use client"

import { useState, useEffect } from "react"
import { StatCard } from "@/components/ui/stat-card"
import { MessageCircle, CheckCircle, Clock, MessageSquareX, Phone, TrendingUp } from "lucide-react"
import { getClientes } from "@/lib/supabase"
import type { Cliente } from "@/lib/types"

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

  // Calcular tendências (comparação com período anterior)
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const leadsPreviousWeek = clientes.filter((cliente) => {
    const clienteDate = new Date(cliente.created_at)
    return clienteDate >= fourteenDaysAgo && clienteDate < sevenDaysAgo
  }).length

  const trendPercentage = leadsPreviousWeek > 0 
    ? Math.round(((leadsLast7Days - leadsPreviousWeek) / leadsPreviousWeek) * 100)
    : leadsLast7Days > 0 ? 100 : 0

  return {
    totalLeads,
    interestedLeads,
    leadsLast7Days,
    conversasTravadas,
    taxaConversao,
    trendPercentage,
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

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground text-sm">Visão geral do sistema</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg border bg-card animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm">Visão geral dos seus leads e métricas.</p>
        </div>
        {!loading && clientes.length > 0 && (
          <div className="hidden md:block">
             <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/10">
                Atualizado: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Leads"
          value={metrics.totalLeads.toLocaleString()}
          description="Contatos no WhatsApp"
          icon={<Phone className="h-5 w-5" />}
          variant="primary"
        />

        <StatCard
          title="Leads Interessados"
          value={metrics.interestedLeads}
          description={`Taxa de conversão: ${metrics.taxaConversao}%`}
          icon={<CheckCircle className="h-5 w-5" />}
          variant="success"
          trend={{
            value: Number(metrics.taxaConversao),
            label: "taxa de conversão",
          }}
        />

        <StatCard
          title="Novos (7 dias)"
          value={metrics.leadsLast7Days}
          description="Novos contatos esta semana"
          icon={<Clock className="h-5 w-5" />}
          variant="default"
          trend={{
            value: metrics.trendPercentage,
            label: "vs semana anterior",
          }}
        />

        <StatCard
          title="Conversas Travadas"
          value={metrics.conversasTravadas}
          description="Conversas pausadas/travadas"
          icon={<MessageSquareX className="h-5 w-5" />}
          variant="danger"
        />
      </div>
    </div>
  )
}

