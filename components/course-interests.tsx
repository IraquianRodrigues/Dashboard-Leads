"use client"

import { useState, useEffect } from "react"
import type { LeadCourseInterest } from "@/lib/types"
import { getLeadCourseInterests, createCourseInterest, getCursos } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Timeline, TimelineItem, TimelineContent } from "@/components/ui/timeline"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GraduationCap, Plus, BookOpen, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Curso } from "@/lib/supabase"

interface CourseInterestsProps {
  leadId: number
}

export function CourseInterests({ leadId }: CourseInterestsProps) {
  const [interests, setInterests] = useState<LeadCourseInterest[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCurso, setSelectedCurso] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [leadId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [interestsData, cursosData] = await Promise.all([
        getLeadCourseInterests(leadId),
        getCursos(),
      ])
      setInterests(interestsData)
      setCursos(cursosData.filter(c => c.ativo))
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInterest = async () => {
    if (!selectedCurso) {
      toast({
        title: "Atenção",
        description: "Selecione um curso",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const curso = cursos.find(c => c.nome === selectedCurso)
      const result = await createCourseInterest(
        leadId,
        selectedCurso,
        curso?.id,
        "manual"
      )

      if (result) {
        toast({
          title: "Sucesso",
          description: "Interesse registrado com sucesso",
        })
        setIsDialogOpen(false)
        setSelectedCurso("")
        await loadData()
      } else {
        throw new Error("Falha ao criar interesse")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível registrar o interesse",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTimestamp = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  const getOrigemBadge = (origem?: string | null) => {
    switch (origem) {
      case "whatsapp":
        return <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">WhatsApp</Badge>
      case "manual":
        return <Badge variant="outline">Manual</Badge>
      case "n8n":
        return <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800">Automação</Badge>
      default:
        return origem ? <Badge variant="outline">{origem}</Badge> : null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Histórico de Interesses</h3>
          <p className="text-sm text-muted-foreground">
            {interests.length} {interests.length === 1 ? "interesse registrado" : "interesses registrados"}
          </p>
        </div>
        <Button
          size="sm"
          className="gradient-primary"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Interesse
        </Button>
      </div>

      {/* Timeline */}
      {interests.length === 0 ? (
        <EmptyState
          icon={<GraduationCap />}
          title="Nenhum interesse registrado"
          description="Adicione os cursos de interesse deste lead"
        />
      ) : (
        <Timeline>
          {interests.map((interest, index) => (
            <TimelineItem
              key={interest.id}
              icon={<BookOpen className="h-4 w-4" />}
              iconColor="bg-[var(--whatsapp-green)]"
              isLast={index === interests.length - 1}
            >
              <TimelineContent
                title={interest.curso_nome}
                description={
                  <div className="flex items-center gap-2 mt-1">
                    {getOrigemBadge(interest.origem)}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(interest.created_at)}
                    </span>
                  </div>
                }
              />
            </TimelineItem>
          ))}
        </Timeline>
      )}

      {/* Add Interest Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Interesse</DialogTitle>
            <DialogDescription>
              Registre um novo curso de interesse para este lead
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Select value={selectedCurso} onValueChange={setSelectedCurso}>
                <SelectTrigger id="curso">
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((curso) => (
                    <SelectItem key={curso.id} value={curso.nome}>
                      {curso.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="gradient-primary"
              onClick={handleAddInterest}
              disabled={submitting || !selectedCurso}
            >
              {submitting ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
