"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCampaignAnalytics, type CampaignSummary } from "@/lib/supabase"
import {
  Megaphone,
  TrendingUp,
  Users,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react"

const SOURCE_COLORS: Record<string, string> = {
  "WhatsApp": "#25D366",
  "Facebook Ads": "#1877F2",
  "Google Ads": "#EA4335",
  "Instagram Ads": "#E4405F",
  "TikTok Ads": "#EE1D52",
  "Orgânico": "#10b981",
  "Indicação": "#f59e0b",
  "Direto": "#71717a",
  "E-mail": "#06b6d4",
}

function getColor(source: string): string {
  return SOURCE_COLORS[source] || "#71717a"
}

export default function CampanhasPage() {
  const [data, setData] = useState<CampaignSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getCampaignAnalytics()
        setData(result)
      } catch (error) {
        console.error("Erro ao carregar campanhas:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campanhas</h1>
          <p className="text-sm text-muted-foreground">Análise de tráfego pago e UTM</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-lg border bg-card animate-pulse" />
      </div>
    )
  }

  if (!data) return null

  const totalLeads = data.total_leads_com_utm + data.total_leads_sem_utm
  const utmPercentage = totalLeads > 0
    ? ((data.total_leads_com_utm / totalLeads) * 100).toFixed(0)
    : "0"

  // Find best conversion campaign (min 2 leads)
  const bestConversion = [...data.campaigns]
    .filter((c) => c.total >= 2)
    .sort((a, b) => b.taxa_conversao - a.taxa_conversao)[0]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-muted-foreground" />
            Campanhas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Análise de performance de tráfego pago e UTM tracking
          </p>
        </div>
        <Badge variant="secondary" className="font-medium">
          {data.total_leads_com_utm} leads rastreados
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Campanhas */}
        <Card className="shadow-none border-border">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Campanhas</span>
              <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
                <Megaphone className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums">{data.total_campaigns}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.sources_summary.length} fontes de tráfego
            </p>
          </CardContent>
        </Card>

        {/* Leads com UTM */}
        <Card className="shadow-none border-border">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Leads Rastreados</span>
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <div className="text-2xl font-bold tabular-nums">{data.total_leads_com_utm}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-emerald-500 font-medium">{utmPercentage}%</span>
              <span className="text-xs text-muted-foreground">do total de leads</span>
            </div>
          </CardContent>
        </Card>

        {/* Melhor Fonte */}
        <Card className="shadow-none border-border">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Melhor Fonte</span>
              <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-amber-500" />
              </div>
            </div>
            <div className="text-lg font-bold truncate">
              {data.melhor_fonte || "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.sources_summary[0]?.total || 0} leads gerados
            </p>
          </CardContent>
        </Card>

        {/* Melhor Conversão */}
        <Card className="shadow-none border-border">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Melhor Conversão</span>
              <div className="w-8 h-8 rounded-md bg-rose-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-rose-500" />
              </div>
            </div>
            <div className="text-lg font-bold truncate">
              {bestConversion?.campaign || "—"}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {bestConversion && (
                <>
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-semibold tabular-nums">
                    {bestConversion.taxa_conversao}%
                  </span>
                  <span className="text-xs text-muted-foreground">de conversão</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Distribuição por Fonte */}
        <Card className="shadow-none border-border lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Por Fonte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.sources_summary.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados de fonte</p>
            ) : (
              <div className="space-y-3">
                {data.sources_summary.map((source) => {
                  const maxTotal = data.sources_summary[0]?.total || 1
                  const barWidth = (source.total / maxTotal) * 100

                  return (
                    <div key={source.source} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getColor(source.source) }}
                          />
                          <span className="text-sm font-medium">{source.source}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold tabular-nums">{source.total}</span>
                          <span className="text-muted-foreground tabular-nums w-10 text-right">
                            {source.taxa_conversao}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(barWidth, 3)}%`,
                            backgroundColor: getColor(source.source),
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Medium breakdown */}
            {data.mediums_summary.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Por Meio</p>
                <div className="flex flex-wrap gap-2">
                  {data.mediums_summary.map((m) => (
                    <Badge
                      key={m.medium}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {m.medium}: {m.total}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Campanhas */}
        <Card className="shadow-none border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Campanhas Detalhadas
              </CardTitle>
              <span className="text-xs text-muted-foreground tabular-nums">
                {data.campaigns.length} campanhas
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Megaphone className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Sem campanhas rastreadas</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[300px]">
                  Adicione parâmetros UTM (utm_campaign, utm_source) nos links de campanha para rastrear performance.
                </p>
              </div>
            ) : (
              <div className="border-t border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-9">Campanha</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-9">Fonte</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-9 text-center">Leads</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-9 text-center">Interessados</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-9 text-center">Conversão</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-9">Período</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.campaigns.map((campaign) => (
                      <TableRow key={campaign.campaign} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium text-sm py-2.5">
                          {campaign.campaign}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: getColor(campaign.source) }}
                            />
                            <span className="text-sm text-muted-foreground">{campaign.source}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-2.5">
                          <span className="text-sm font-semibold tabular-nums">{campaign.total}</span>
                        </TableCell>
                        <TableCell className="text-center py-2.5">
                          <span className="text-sm tabular-nums">{campaign.interessados}</span>
                        </TableCell>
                        <TableCell className="text-center py-2.5">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium tabular-nums ${
                              campaign.taxa_conversao >= 30
                                ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                                : campaign.taxa_conversao >= 15
                                ? "text-amber-500 border-amber-500/30 bg-amber-500/5"
                                : "text-muted-foreground"
                            }`}
                          >
                            {campaign.taxa_conversao >= 15 ? (
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 mr-0.5" />
                            )}
                            {campaign.taxa_conversao}%
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {campaign.primeiro_lead
                              ? new Date(campaign.primeiro_lead).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
                              : "—"}
                            {campaign.primeiro_lead !== campaign.ultimo_lead && campaign.ultimo_lead && (
                              <> → {new Date(campaign.ultimo_lead).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leads sem rastreamento */}
      {data.total_leads_sem_utm > 0 && (
        <Card className="shadow-none border-border border-dashed">
          <CardContent className="py-4 px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div>
                  <p className="text-sm font-medium">
                    {data.total_leads_sem_utm} leads sem rastreamento UTM
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Considere adicionar parâmetros UTM nos links de campanha para melhorar a análise
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {totalLeads > 0 ? ((data.total_leads_sem_utm / totalLeads) * 100).toFixed(0) : 0}% do total
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
