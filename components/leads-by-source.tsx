"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLeadsBySource, type LeadsBySource } from "@/lib/supabase"
import { Globe, TrendingUp, Loader2 } from "lucide-react"

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

function getSourceColor(source: string): string {
  return SOURCE_COLORS[source] || "#71717a"
}

export function LeadsBySourceCard() {
  const [data, setData] = useState<LeadsBySource[]>([])
  const [loading, setLoading] = useState(true)
  const [animated, setAnimated] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const sources = await getLeadsBySource()
        setData(sources)
      } catch (error) {
        console.error("Erro ao carregar leads por origem:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!loading && data.length > 0) {
      const timer = setTimeout(() => setAnimated(true), 100)
      return () => clearTimeout(timer)
    }
  }, [loading, data])

  const totalLeads = data.reduce((sum, s) => sum + s.total, 0)
  const topSource = data[0]
  const bestConversion = [...data].sort((a, b) => b.taxa_conversao - a.taxa_conversao)[0]

  // Loading skeleton
  if (loading) {
    return (
      <Card ref={cardRef} className="col-span-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Leads por Origem
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-20 bg-muted animate-pulse rounded-sm" />
                    <div className="h-3.5 w-12 bg-muted animate-pulse rounded-sm" />
                  </div>
                  <div className="h-1.5 w-full bg-muted animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card ref={cardRef} className="col-span-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Leads por Origem
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="relative w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">Sem dados de origem</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] leading-relaxed">
              Adicione parâmetros UTM nos links de campanha para rastrear de onde seus leads estão vindo.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card ref={cardRef} className="col-span-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Leads por Origem
          </CardTitle>
          <div className="flex items-center gap-3">
            {topSource && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getSourceColor(topSource.source) }}
                />
                Top: {topSource.source}
              </span>
            )}
            <span className="text-xs tabular-nums text-muted-foreground font-medium">
              {totalLeads} {totalLeads === 1 ? "lead" : "leads"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Source rows */}
        <div className="space-y-2.5">
          {data.slice(0, 7).map((source, index) => {
            const percentage = totalLeads > 0
              ? (source.total / totalLeads) * 100
              : 0

            return (
              <div
                key={source.source}
                className="group flex items-center gap-3 rounded-sm px-2 py-1.5 -mx-2 transition-colors duration-200 hover:bg-muted/50"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Color dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
                  style={{ backgroundColor: getSourceColor(source.source) }}
                />

                {/* Source name */}
                <span className="text-sm font-medium w-28 truncate flex-shrink-0">
                  {source.source}
                </span>

                {/* Progress bar area */}
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: animated ? `${Math.max(percentage, 2)}%` : "0%",
                        backgroundColor: getSourceColor(source.source),
                        transitionDelay: `${index * 80}ms`,
                      }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold tabular-nums w-6 text-right">
                      {source.total}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer insight */}
        {bestConversion && bestConversion.taxa_conversao > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              <span>
                <span className="text-foreground font-medium">{bestConversion.source}</span>
                {" "}tem a melhor conversão com{" "}
                <span className="text-emerald-500 font-semibold tabular-nums">{bestConversion.taxa_conversao}%</span>
                {" "}de interessados
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
