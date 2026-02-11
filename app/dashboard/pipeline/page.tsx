"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { getPipelineStages, getClientes, updateLeadStage, createActivity } from "@/lib/supabase"
import type { PipelineStage, Cliente } from "@/lib/types"
import { NewLeadModal } from "@/components/new-lead-modal"
import { LeadClosureModal } from "@/components/lead-closure-modal"
import type { LeadClosureType } from "@/lib/lead-closure-types"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter, 
  GripVertical,
  Phone,
  Mail,
  Building2,
  DollarSign,
  Calendar,
  MoreVertical,
  TrendingUp,
  Target,
  Users as UsersIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [leads, setLeads] = useState<Cliente[]>([])
  const [allLeads, setAllLeads] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false)
  const [closureModalOpen, setClosureModalOpen] = useState(false)
  const [closureType, setClosureType] = useState<LeadClosureType | null>(null)
  const [closingLead, setClosingLead] = useState<Cliente | null>(null)
  const [closureStageId, setClosureStageId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [stagesData, leadsData] = await Promise.all([
        getPipelineStages(),
        getClientes(),
      ])
      setStages(stagesData)
      setAllLeads(leadsData)
      // Filtrar leads fechados (ganho ou perdido) para não aparecerem no kanban
      const activeLeads = leadsData.filter(
        (l) => !l.is_cliente_ativo && !l.motivo_perda
      )
      setLeads(activeLeads)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const getLeadsByStage = (stageId: number | null) => {
    if (stageId === null) {
      return leads.filter((lead) => !lead.stage_id)
    }
    return leads.filter((lead) => lead.stage_id === stageId)
  }

  const filteredLeads = (stageLeads: Cliente[]) => {
    if (!searchTerm) return stageLeads
    return stageLeads.filter((lead) =>
      lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone?.includes(searchTerm) ||
      lead.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const calculateStageValue = (stageLeads: Cliente[]) => {
    return stageLeads.reduce((sum, lead) => sum + (lead.valor_potencial || 0), 0)
  }

  const calculateStageStats = (stageLeads: Cliente[]) => {
    const total = stageLeads.length
    const interessados = stageLeads.filter(l => l.interessado).length
    const valor = calculateStageValue(stageLeads)
    const taxaConversao = total > 0 ? (interessados / total) * 100 : 0
    
    return { total, interessados, valor, taxaConversao }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const leadId = parseInt(draggableId)
    const newStageId = destination.droppableId === "no-stage" ? null : parseInt(destination.droppableId)
    const lead = leads.find(l => l.id === leadId)
    const targetStage = stages.find(s => s.id === newStageId)

    // Detectar se foi movido para estágio final
    if (targetStage && lead) {
      const stageName = targetStage.nome.toLowerCase()
      
      if (stageName.includes('fechado') && stageName.includes('ganho')) {
        // Abrir modal de fechamento como ganho
        setClosingLead(lead)
        setClosureType('won')
        setClosureStageId(newStageId)
        setClosureModalOpen(true)
        return // Não mover ainda, esperar modal
      }
      
      if (stageName.includes('fechado') && stageName.includes('perdido')) {
        // Abrir modal de fechamento como perdido
        setClosingLead(lead)
        setClosureType('lost')
        setClosureStageId(newStageId)
        setClosureModalOpen(true)
        return // Não mover ainda, esperar modal
      }
    }

    // Movimentação normal (não é estágio final)
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === leadId ? { ...lead, stage_id: newStageId } : lead
      )
    )

    try {
      if (newStageId !== null) {
        const success = await updateLeadStage(leadId, newStageId)
        if (success) {
          const stage = stages.find((s) => s.id === newStageId)
          if (stage) {
            await createActivity(
              leadId,
              "stage_change",
              `Movido para ${stage.nome}`,
              `Lead movido para o estágio "${stage.nome}"`
            )
          }
          toast({
            title: "Lead atualizado",
            description: `Lead movido para ${stage?.nome || "novo estágio"}`,
          })
        } else {
          throw new Error("Falha ao atualizar")
        }
      } else {
        const success = await updateLeadStage(leadId, 0)
        if (!success) throw new Error("Falha ao atualizar")
        toast({
          title: "Lead atualizado",
          description: "Lead removido do pipeline",
        })
      }
    } catch (error) {
      loadData()
      toast({
        title: "Erro",
        description: "Não foi possível mover o lead",
        variant: "destructive",
      })
    }
  }

  const handleClosureSuccess = () => {
    // Recarregar dados após fechamento
    loadData()
    setClosureModalOpen(false)
    setClosingLead(null)
    setClosureType(null)
    setClosureStageId(null)
  }

  // Stats usam TODOS os leads (incluindo fechados)
  const totalLeads = allLeads.length
  const totalValor = allLeads.reduce((sum, l) => sum + (l.valor_potencial || 0), 0)
  const convertidos = allLeads.filter(l => l.is_cliente_ativo).length
  const taxaConversao = totalLeads > 0 ? ((convertidos / totalLeads) * 100).toFixed(0) : "0"
  const valorFechado = allLeads.filter(l => l.is_cliente_ativo).reduce((sum, l) => sum + (l.valor_fechado || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-card rounded-xl animate-pulse" />
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white shadow-lg shadow-[var(--whatsapp-green)]/20">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pipeline de Vendas</h1>
              <p className="text-sm text-muted-foreground">
                {totalLeads} leads • R$ {(totalValor / 1000).toFixed(0)}k em oportunidades
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54]"
              onClick={() => setIsNewLeadModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
                <p className="text-xs text-muted-foreground">{leads.length} ativos no pipeline</p>
              </div>
              <UsersIcon className="h-8 w-8 text-[var(--whatsapp-green)]" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor em Pipeline</p>
                <p className="text-2xl font-bold">R$ {(totalValor / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#25D366]" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{taxaConversao}%</p>
                <p className="text-xs text-muted-foreground">{convertidos} convertidos</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negócios Fechados</p>
                <p className="text-2xl font-bold text-[#25D366]">R$ {valorFechado > 0 ? (valorFechado / 1000).toFixed(1) + "k" : "0"}</p>
                <p className="text-xs text-muted-foreground">{convertidos} clientes ativos</p>
              </div>
              <Target className="h-8 w-8 text-[#25D366]" />
            </div>
          </GlassCard>
        </div>

        {/* Kanban Board with DnD */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
            {/* Leads sem estágio */}
            <StageColumn
              stageId={null}
              stageName="Novos Leads"
              stageColor="#00ff88"
              leads={filteredLeads(getLeadsByStage(null))}
              stats={calculateStageStats(getLeadsByStage(null))}
              searchTerm={searchTerm}
            />

            {/* Estágios do pipeline */}
            {stages.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id)
              const filtered = filteredLeads(stageLeads)

              return (
                <StageColumn
                  key={stage.id}
                  stageId={stage.id}
                  stageName={stage.nome}
                  stageColor={stage.cor}
                  leads={filtered}
                  stats={calculateStageStats(stageLeads)}
                  searchTerm={searchTerm}
                />
              )
            })}
          </div>
        </DragDropContext>

        {/* Modal de Novo Lead */}
        <NewLeadModal
          open={isNewLeadModalOpen}
          onOpenChange={setIsNewLeadModalOpen}
          onSuccess={loadData}
          stages={stages}
        />

        {/* Modal de Fechamento de Lead */}
        <LeadClosureModal
          open={closureModalOpen}
          onOpenChange={setClosureModalOpen}
          lead={closingLead}
          closureType={closureType}
          stageId={closureStageId}
          onSuccess={handleClosureSuccess}
        />
      </div>
    </div>
  )
}

interface StageColumnProps {
  stageId: number | null
  stageName: string
  stageColor: string
  leads: Cliente[]
  stats: { total: number; interessados: number; valor: number; taxaConversao: number }
  searchTerm: string
}

function StageColumn({ stageId, stageName, stageColor, leads, stats, searchTerm }: StageColumnProps) {
  const droppableId = stageId === null ? "no-stage" : stageId.toString()
  const progressPercent = stats.total > 0 ? (stats.interessados / stats.total) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Column Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md pb-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ backgroundColor: stageColor, boxShadow: `0 0 10px ${stageColor}50` }}
            />
            <h3 className="font-semibold text-sm">{stageName}</h3>
          </div>
          <Badge variant="outline" className="bg-muted/50">
            {stats.total}
          </Badge>
        </div>

        {/* Stats */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Valor</span>
            <span className="font-semibold text-[var(--whatsapp-green)]">
              R$ {(stats.valor / 1000).toFixed(1)}k
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Conversão</span>
              <span className="font-medium">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2 min-h-[200px] rounded-lg p-2 transition-all duration-200 ${
              snapshot.isDraggingOver 
                ? "bg-muted/50 ring-2 ring-[var(--whatsapp-green)]/50" 
                : ""
            }`}
          >
            {leads.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                {searchTerm ? "Nenhum resultado" : "Arraste leads aqui"}
              </div>
            ) : (
              leads.map((lead, index) => (
                <Draggable
                  key={lead.id}
                  draggableId={lead.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <LeadCard
                        lead={lead}
                        stageColor={stageColor}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

interface LeadCardProps {
  lead: Cliente
  stageColor: string
  isDragging?: boolean
}

function LeadCard({ lead, stageColor, isDragging }: LeadCardProps) {
  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const getDaysAgo = (date: string) => {
    const created = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return "Hoje"
    if (diff === 1) return "Ontem"
    return `${diff}d atrás`
  }

  return (
    <GlassCard
      className={`p-3 transition-all duration-300 cursor-grab active:cursor-grabbing group relative overflow-hidden ${
        isDragging ? "shadow-2xl scale-105 rotate-2 ring-2 ring-[var(--whatsapp-green)]" : "hover:shadow-lg"
      }`}
    >
      {/* Gradient Accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${stageColor}, transparent)` }}
      />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br flex-shrink-0 text-white font-semibold text-sm shadow-md"
            style={{
              background: `linear-gradient(135deg, ${stageColor} 0%, ${stageColor}dd 100%)`,
            }}
          >
            {getInitials(lead.nome)}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate group-hover:text-[var(--whatsapp-green)] transition-colors">
              {lead.nome || "Sem nome"}
            </h4>
            {lead.cargo && (
              <p className="text-xs text-muted-foreground truncate">{lead.cargo}</p>
            )}
          </div>

          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-xs">
          {lead.empresa && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.empresa}</span>
            </div>
          )}
          {lead.telefone && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{lead.telefone}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {lead.valor_potencial ? (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-[var(--whatsapp-green)]" />
              <span className="text-sm font-semibold text-[var(--whatsapp-green)]">
                R$ {(lead.valor_potencial / 1000).toFixed(1)}k
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Sem valor</div>
          )}

          <div className="flex items-center gap-2">
            {lead.interessado && (
              <Badge variant="success" className="text-xs px-1.5 py-0">
                Quente
              </Badge>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{getDaysAgo(lead.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (visible on hover) */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
            <Phone className="h-3 w-3 mr-1" />
            Ligar
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
