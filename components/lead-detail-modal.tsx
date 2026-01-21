"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Timeline, TimelineItem, TimelineContent } from "@/components/ui/timeline"
import { EmptyState } from "@/components/ui/empty-state"
import type { Cliente, LeadActivity, Task, Tag } from "@/lib/types"
import {
  getLeadCompleto,
  updateLead,
  getLeadActivities,
  getTasks,
  getLeadTags,
} from "@/lib/supabase"
import {
  User,
  Building2,
  Phone,
  Mail,
  Briefcase,
  DollarSign,
  Calendar,
  MessageCircle,
  CheckCircle,
  Clock,
  FileText,
  Tag as TagIcon,
  Save,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LeadNotes } from "@/components/lead-notes"
import { CourseInterests } from "@/components/course-interests"

interface LeadDetailModalProps {
  leadId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function LeadDetailModal({
  leadId,
  open,
  onOpenChange,
  onUpdate,
}: LeadDetailModalProps) {
  const [lead, setLead] = useState<Cliente | null>(null)
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editedLead, setEditedLead] = useState<Partial<Cliente>>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open && leadId) {
      loadLeadData()
    }
  }, [open, leadId])

  const loadLeadData = async () => {
    if (!leadId) return
    
    setLoading(true)
    try {
      const [leadData, activitiesData, tasksData, tagsData] = await Promise.all([
        getLeadCompleto(leadId),
        getLeadActivities(leadId),
        getTasks({ lead_id: leadId }),
        getLeadTags(leadId),
      ])

      if (leadData) {
        setLead(leadData)
        setEditedLead(leadData)
      }
      setActivities(activitiesData)
      setTasks(tasksData)
      setTags(tagsData)
    } catch (error) {
      console.error("Erro ao carregar lead:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do lead",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!leadId) return

    setSaving(true)
    try {
      const success = await updateLead(leadId, editedLead)
      if (success) {
        toast({
          title: "Sucesso",
          description: "Lead atualizado com sucesso",
        })
        onUpdate?.()
        onOpenChange(false)
      } else {
        throw new Error("Falha ao atualizar")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getActivityIcon = (tipo: string) => {
    switch (tipo) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "whatsapp":
        return <MessageCircle className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      case "stage_change":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (tipo: string) => {
    switch (tipo) {
      case "call":
        return "bg-[#25D366]"
      case "email":
        return "bg-purple-500"
      case "whatsapp":
        return "bg-[var(--whatsapp-green)]"
      case "meeting":
        return "bg-orange-500"
      case "note":
        return "bg-gray-500"
      case "stage_change":
        return "bg-green-500"
      default:
        return "bg-muted"
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!lead && !loading) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white font-semibold">
              {lead?.nome?.substring(0, 2).toUpperCase() || "?"}
            </div>
            <div>
              <div className="text-xl font-bold">{lead?.nome || "Carregando..."}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {lead?.empresa || "Sem empresa"}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Gerencie todas as informações e interações com este lead
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
            <TabsTrigger value="interests">Interesses</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="communication">Comunicação</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Tab: Informações */}
            <TabsContent value="info" className="space-y-4 mt-0">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nome"
                        value={editedLead.nome || ""}
                        onChange={(e) =>
                          setEditedLead({ ...editedLead, nome: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefone"
                        value={editedLead.telefone || ""}
                        onChange={(e) =>
                          setEditedLead({ ...editedLead, telefone: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="empresa"
                        value={editedLead.empresa || ""}
                        onChange={(e) =>
                          setEditedLead({ ...editedLead, empresa: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cargo"
                        value={editedLead.cargo || ""}
                        onChange={(e) =>
                          setEditedLead({ ...editedLead, cargo: e.target.value })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valor_potencial">Valor Potencial</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="valor_potencial"
                        type="number"
                        value={editedLead.valor_potencial || ""}
                        onChange={(e) =>
                          setEditedLead({
                            ...editedLead,
                            valor_potencial: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origem">Origem</Label>
                    <Input
                      id="origem"
                      value={editedLead.origem || ""}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, origem: e.target.value })
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <textarea
                      id="observacoes"
                      value={editedLead.observacoes || ""}
                      onChange={(e) =>
                        setEditedLead({ ...editedLead, observacoes: e.target.value })
                      }
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  {tags.length > 0 && (
                    <div className="col-span-2 space-y-2">
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            style={{ backgroundColor: tag.cor }}
                            className="text-white"
                          >
                            {tag.nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tab: Notas */}
            <TabsContent value="notes" className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <LeadNotes leadId={leadId!} />
              )}
            </TabsContent>

            {/* Tab: Interesses */}
            <TabsContent value="interests" className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <CourseInterests leadId={leadId!} />
              )}
            </TabsContent>

            {/* Tab: Timeline */}
            <TabsContent value="timeline" className="mt-0">
              {activities.length === 0 ? (
                <EmptyState
                  icon={<Clock />}
                  title="Nenhuma atividade"
                  description="O histórico de atividades aparecerá aqui"
                />
              ) : (
                <Timeline>
                  {activities.map((activity, index) => (
                    <TimelineItem
                      key={activity.id}
                      icon={getActivityIcon(activity.tipo)}
                      iconColor={getActivityColor(activity.tipo)}
                      isLast={index === activities.length - 1}
                    >
                      <TimelineContent
                        title={activity.titulo}
                        description={activity.descricao || undefined}
                        timestamp={formatDate(activity.created_at)}
                      />
                    </TimelineItem>
                  ))}
                </Timeline>
              )}
            </TabsContent>

            {/* Tab: Tarefas */}
            <TabsContent value="tasks" className="mt-0">
              {tasks.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle />}
                  title="Nenhuma tarefa"
                  description="Crie tarefas para organizar o acompanhamento deste lead"
                  action={
                    <Button className="gradient-primary">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Nova Tarefa
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{task.titulo}</h4>
                          {task.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.descricao}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                task.prioridade === "alta"
                                  ? "destructive"
                                  : task.prioridade === "media"
                                  ? "warning"
                                  : "outline"
                              }
                            >
                              {task.prioridade}
                            </Badge>
                            {task.data_vencimento && (
                              <span className="text-xs text-muted-foreground">
                                {formatDate(task.data_vencimento)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            task.status === "concluida" ? "success" : "outline"
                          }
                        >
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tab: Comunicação */}
            <TabsContent value="communication" className="mt-0">
              <EmptyState
                icon={<MessageCircle />}
                title="Histórico de comunicação"
                description="Em breve: histórico completo de mensagens WhatsApp e emails"
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            className="gradient-primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
