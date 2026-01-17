"use client"

import { useState, useEffect } from "react"
import { getClientes, getPipelineStages, getLeadsPorEstagio } from "@/lib/supabase"
import type { Cliente, PipelineStage, LeadsPorEstagio } from "@/lib/types"
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card"
import { StatCard } from "@/components/ui/stat-card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react"

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<Cliente[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leadsPorEstagio, setLeadsPorEstagio] = useState<LeadsPorEstagio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [leadsData, stagesData] = await Promise.all([
        getClientes(),
        getPipelineStages(),
      ])

      setLeads(leadsData)
      setStages(stagesData)

      // Tentar buscar leads por estágio (pode falhar se tabela não existe)
      try {
        const leadsPorEstagioData = await getLeadsPorEstagio()
        setLeadsPorEstagio(leadsPorEstagioData)
      } catch (error) {
        console.log("Leads por estágio não disponível")
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular métricas
  const totalLeads = leads.length
  const interessados = leads.filter((l) => l.interessado).length
  const taxaConversao = totalLeads > 0 ? ((interessados / totalLeads) * 100).toFixed(1) : "0"
  const valorTotal = leads.reduce((sum, l) => sum + (l.valor_potencial || 0), 0)

  // Dados para gráfico de tendência (últimos 30 dias)
  const getTrendData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    return last30Days.map((date) => {
      const count = leads.filter((lead) => {
        const leadDate = new Date(lead.created_at).toISOString().split("T")[0]
        return leadDate === date
      }).length

      return {
        date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        leads: count,
      }
    })
  }

  // Dados para distribuição por origem
  const getOrigemData = () => {
    const origens = leads.reduce((acc, lead) => {
      const origem = lead.origem || "Não definido"
      acc[origem] = (acc[origem] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(origens).map(([name, value]) => ({
      name,
      value,
    }))
  }

  // Dados para funil de conversão
  const getFunnelData = () => {
    if (leadsPorEstagio.length > 0) {
      return leadsPorEstagio.map((stage) => ({
        name: stage.stage_nome,
        leads: stage.total_leads,
        valor: stage.valor_total,
      }))
    }

    // Fallback se não tiver dados do banco
    return [
      { name: "Total Leads", leads: totalLeads, valor: valorTotal },
      { name: "Interessados", leads: interessados, valor: valorTotal * 0.7 },
      { name: "Em Negociação", leads: Math.floor(interessados * 0.5), valor: valorTotal * 0.4 },
      { name: "Convertidos", leads: Math.floor(interessados * 0.3), valor: valorTotal * 0.2 },
    ]
  }

  const COLORS = ["#00ff88", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981", "#ef4444"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white shadow-lg shadow-[var(--whatsapp-green)]/20">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Análise detalhada do desempenho de vendas
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total de Leads"
            value={totalLeads.toLocaleString()}
            description="Todos os contatos"
            icon={<Users className="h-5 w-5" />}
            variant="primary"
          />

          <StatCard
            title="Taxa de Conversão"
            value={`${taxaConversao}%`}
            description={`${interessados} interessados`}
            icon={<Target className="h-5 w-5" />}
            variant="success"
            trend={{
              value: Number(taxaConversao),
              label: "taxa atual",
            }}
          />

          <StatCard
            title="Valor do Pipeline"
            value={`R$ ${(valorTotal / 1000).toFixed(0)}k`}
            description="Valor potencial total"
            icon={<DollarSign className="h-5 w-5" />}
            variant="default"
          />

          <StatCard
            title="Média por Lead"
            value={`R$ ${totalLeads > 0 ? (valorTotal / totalLeads).toFixed(0) : 0}`}
            description="Valor médio"
            icon={<TrendingUp className="h-5 w-5" />}
            variant="default"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tendência de Leads */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[var(--whatsapp-green)]" />
                Tendência de Leads (30 dias)
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(18, 18, 18, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="var(--whatsapp-green)"
                    strokeWidth={2}
                    dot={{ fill: "var(--whatsapp-green)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCardContent>
          </GlassCard>

          {/* Funil de Conversão */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[var(--whatsapp-green)]" />
                Funil de Conversão
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getFunnelData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(18, 18, 18, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="leads" fill="var(--whatsapp-green)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCardContent>
          </GlassCard>

          {/* Distribuição por Origem */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--whatsapp-green)]" />
                Distribuição por Origem
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getOrigemData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getOrigemData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(18, 18, 18, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </GlassCardContent>
          </GlassCard>

          {/* Valor por Estágio */}
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[var(--whatsapp-green)]" />
                Valor por Estágio
              </GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getFunnelData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(18, 18, 18, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                  />
                  <Bar dataKey="valor" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
