"use client"

import { useState, useEffect } from "react"
import { getTasks, completeTask, createTask, deleteTask } from "@/lib/supabase"
import type { Task, TaskWithLead } from "@/lib/types"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { CreateTaskModal } from "@/components/create-task-modal"
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  User,
  Filter,
  MoreVertical,
  Flag,
  TrendingUp,
  Target,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithLead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<Task["status"] | "all">("all")
  const [filterPriority, setFilterPriority] = useState<Task["prioridade"] | "all">("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const data = await getTasks({})
      setTasks(data)
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    try {
      const success = await completeTask(taskId)
      if (success) {
        toast({
          title: "Tarefa concluída",
          description: "Tarefa marcada como concluída",
        })
        loadTasks()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível completar a tarefa",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return

    try {
      const success = await deleteTask(taskId)
      if (success) {
        toast({
          title: "Tarefa excluída",
          description: "Tarefa removida com sucesso",
        })
        loadTasks()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive",
      })
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchTerm ||
      task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.lead?.nome?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.prioridade === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getUrgencia = (task: TaskWithLead): "vencida" | "urgente" | "normal" => {
    if (!task.data_vencimento) return "normal"
    const vencimento = new Date(task.data_vencimento)
    const hoje = new Date()
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)

    if (vencimento < hoje && task.status !== "concluida") return "vencida"
    if (vencimento < amanha && task.status !== "concluida") return "urgente"
    return "normal"
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    })
  }

  const getDaysUntil = (date: string) => {
    const vencimento = new Date(date)
    const hoje = new Date()
    const diff = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diff < 0) return `${Math.abs(diff)}d atrasado`
    if (diff === 0) return "Hoje"
    if (diff === 1) return "Amanhã"
    return `${diff}d restantes`
  }

  const getPriorityColor = (prioridade: Task["prioridade"]) => {
    switch (prioridade) {
      case "alta": return "destructive"
      case "media": return "warning"
      case "baixa": return "outline"
      default: return "outline"
    }
  }

  const getPriorityIcon = (prioridade: Task["prioridade"]) => {
    return <Flag className={`h-3 w-3 ${
      prioridade === "alta" ? "text-red-500" :
      prioridade === "media" ? "text-orange-500" :
      "text-gray-500"
    }`} />
  }

  // Estatísticas
  const totalTasks = tasks.length
  const pendentes = tasks.filter((t) => t.status === "pendente").length
  const emAndamento = tasks.filter((t) => t.status === "em_andamento").length
  const concluidas = tasks.filter((t) => t.status === "concluida").length
  const vencidas = tasks.filter((t) => getUrgencia(t) === "vencida").length
  const taxaConclusao = totalTasks > 0 ? (concluidas / totalTasks) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-96 bg-card rounded-xl animate-pulse" />
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
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length} de {totalTasks} tarefas • {taxaConclusao.toFixed(0)}% concluídas
              </p>
            </div>
          </div>

          <Button className="gradient-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <GlassCard className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendentes}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500 transition-all"
                      style={{ width: `${totalTasks > 0 ? (pendentes / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {totalTasks > 0 ? ((pendentes / totalTasks) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
              <Circle className="h-8 w-8 text-gray-500" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{emAndamento}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${totalTasks > 0 ? (emAndamento / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {totalTasks > 0 ? ((emAndamento / totalTasks) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">{concluidas}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${taxaConclusao}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {taxaConclusao.toFixed(0)}%
                  </span>
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-red-500">{vencidas}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${totalTasks > 0 ? (vencidas / totalTasks) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {totalTasks > 0 ? ((vencidas / totalTasks) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("all")}
            >
              Todas
            </Button>
            <Button
              variant={filterStatus === "pendente" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("pendente")}
            >
              Pendentes
            </Button>
            <Button
              variant={filterStatus === "em_andamento" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("em_andamento")}
            >
              Em Andamento
            </Button>
            <Button
              variant={filterStatus === "concluida" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("concluida")}
            >
              Concluídas
            </Button>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 />}
            title="Nenhuma tarefa encontrada"
            description={
              searchTerm
                ? "Tente ajustar os filtros de busca"
                : "Comece criando sua primeira tarefa"
            }
            action={
              <Button className="gradient-primary" onClick={() => setCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => {
              const urgencia = getUrgencia(task)

              return (
                <GlassCard 
                  key={task.id} 
                  className={`p-4 hover:shadow-lg transition-all group relative overflow-hidden ${
                    task.status === "concluida" ? "opacity-60" : ""
                  }`}
                >
                  {/* Accent Bar */}
                  <div 
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      urgencia === "vencida" ? "bg-red-500" :
                      urgencia === "urgente" ? "bg-orange-500" :
                      task.status === "concluida" ? "bg-green-500" :
                      "bg-[var(--whatsapp-green)]"
                    }`}
                  />

                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={task.status === "concluida"}
                      >
                        {task.status === "concluida" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-[var(--whatsapp-green)]" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${
                          task.status === "concluida" ? "line-through text-muted-foreground" : ""
                        }`}>
                          {task.titulo}
                        </h4>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Description */}
                    {task.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.descricao}
                      </p>
                    )}

                    {/* Lead */}
                    {task.lead && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{task.lead.nome}</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.prioridade)}
                        <Badge variant={getPriorityColor(task.prioridade)} className="text-xs">
                          {task.prioridade}
                        </Badge>
                      </div>

                      {task.data_vencimento && (
                        <div className={`flex items-center gap-1 text-xs ${
                          urgencia === "vencida" ? "text-red-500 font-semibold" :
                          urgencia === "urgente" ? "text-orange-500 font-semibold" :
                          "text-muted-foreground"
                        }`}>
                          <Calendar className="h-3 w-3" />
                          <span>{getDaysUntil(task.data_vencimento)}</span>
                        </div>
                      )}
                    </div>

                    {/* Delete Button (visible on hover) */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={loadTasks}
      />
    </div>
  )
}
