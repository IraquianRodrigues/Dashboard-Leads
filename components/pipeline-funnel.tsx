"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFunnelData, type FunnelStage } from "@/lib/supabase"
import { ArrowDown, GitBranch } from "lucide-react"

export function PipelineFunnel() {
  const [stages, setStages] = useState<FunnelStage[]>([])
  const [loading, setLoading] = useState(true)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFunnelData()
        setStages(data)
      } catch (error) {
        console.error("Erro ao carregar funil:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!loading && stages.length > 0) {
      const timer = setTimeout(() => setAnimated(true), 150)
      return () => clearTimeout(timer)
    }
  }, [loading, stages])

  const totalLeads = stages.reduce((sum, s) => sum + s.total, 0)
  const maxCount = Math.max(...stages.map((s) => s.total), 1)

  // Loading skeleton
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            Funil de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[100, 80, 55, 35, 20].map((w, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-3 bg-muted animate-pulse rounded-sm" style={{ width: `${w}%` }} />
                <div className="h-3 w-8 bg-muted animate-pulse rounded-sm flex-shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (stages.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            Funil de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <GitBranch className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">Sem estágios configurados</p>
            <p className="text-xs text-muted-foreground mt-1">
              Configure os estágios do pipeline para visualizar o funil
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            Funil de Vendas
          </CardTitle>
          <span className="text-xs tabular-nums text-muted-foreground font-medium">
            {totalLeads} leads no pipeline
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {stages.map((stage, index) => {
            const barWidth = maxCount > 0 ? (stage.total / maxCount) * 100 : 0

            return (
              <div key={stage.id}>
                {/* Conversion arrow between stages */}
                {index > 0 && stage.conversionFromPrev !== null && (
                  <div className="flex items-center gap-2 py-1 pl-4">
                    <ArrowDown className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {stage.conversionFromPrev}% conversão
                    </span>
                  </div>
                )}

                {/* Stage row */}
                <div className="group flex items-center gap-3 rounded-sm px-2 py-2 -mx-2 transition-colors duration-200 hover:bg-muted/50">
                  {/* Stage color indicator */}
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0 transition-all duration-200 group-hover:h-9"
                    style={{ backgroundColor: stage.cor || "#71717a" }}
                  />

                  {/* Stage info + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{stage.nome}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold tabular-nums">
                          {stage.total}
                        </span>
                        {stage.percentageOfFirst > 0 && index > 0 && (
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {stage.percentageOfFirst}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Funnel bar */}
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: animated ? `${Math.max(barWidth, 2)}%` : "0%",
                          backgroundColor: stage.cor || "#71717a",
                          opacity: 0.8,
                          transitionDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Funnel summary */}
        {stages.length >= 2 && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Taxa geral:{" "}
                <span className="text-foreground font-semibold tabular-nums">
                  {stages[0].total > 0
                    ? ((stages[stages.length - 1].total / stages[0].total) * 100).toFixed(1)
                    : 0}%
                </span>
                <span className="ml-1">
                  ({stages[0].nome} → {stages[stages.length - 1].nome})
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
