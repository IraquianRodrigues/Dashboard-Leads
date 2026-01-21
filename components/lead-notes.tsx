"use client"

import { useState, useEffect } from "react"
import type { LeadNoteWithUser, CreateNoteInput } from "@/lib/types"
import {
  getLeadNotes,
  createLeadNote,
  updateLeadNote,
  deleteLeadNote,
  getCurrentUser,
} from "@/lib/supabase"
import { NoteItem } from "@/components/note-item"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/ui/empty-state"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Send,
  Star,
  Lock,
  Loader2,
} from "lucide-react"

interface LeadNotesProps {
  leadId: number
}

export function LeadNotes({ leadId }: LeadNotesProps) {
  const [notes, setNotes] = useState<LeadNoteWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [newNoteContent, setNewNoteContent] = useState("")
  const [isImportant, setIsImportant] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [replyingTo, setReplyingTo] = useState<LeadNoteWithUser | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadNotes()
    loadCurrentUser()
  }, [leadId])

  const loadCurrentUser = async () => {
    const { user } = await getCurrentUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

  const loadNotes = async () => {
    setLoading(true)
    try {
      const data = await getLeadNotes(leadId)
      setNotes(data)
    } catch (error) {
      console.error("Erro ao carregar notas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!newNoteContent.trim()) {
      toast({
        title: "Atenção",
        description: "Digite uma nota antes de enviar",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const input: CreateNoteInput = {
        lead_id: leadId,
        content: newNoteContent.trim(),
        is_important: isImportant,
        is_private: isPrivate,
        parent_note_id: replyingTo?.id || null,
      }

      const result = await createLeadNote(input)
      if (result) {
        toast({
          title: "Sucesso",
          description: replyingTo ? "Resposta adicionada" : "Nota criada com sucesso",
        })
        setNewNoteContent("")
        setIsImportant(false)
        setIsPrivate(false)
        setReplyingTo(null)
        await loadNotes()
      } else {
        throw new Error("Falha ao criar nota")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a nota",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (noteId: number) => {
    try {
      const success = await deleteLeadNote(noteId)
      if (success) {
        toast({
          title: "Sucesso",
          description: "Nota deletada com sucesso",
        })
        await loadNotes()
      } else {
        throw new Error("Falha ao deletar")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a nota",
        variant: "destructive",
      })
    }
  }

  const handleToggleImportant = async (noteId: number, isImportant: boolean) => {
    try {
      await updateLeadNote(noteId, { is_important: isImportant })
      toast({
        title: "Sucesso",
        description: isImportant
          ? "Nota marcada como importante"
          : "Nota desmarcada como importante",
      })
      await loadNotes()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a nota",
        variant: "destructive",
      })
    }
  }

  const handleTogglePrivate = async (noteId: number, isPrivate: boolean) => {
    try {
      await updateLeadNote(noteId, { is_private: isPrivate })
      toast({
        title: "Sucesso",
        description: isPrivate ? "Nota marcada como privada" : "Nota marcada como pública",
      })
      await loadNotes()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a nota",
        variant: "destructive",
      })
    }
  }

  const handleReply = (note: LeadNoteWithUser) => {
    setReplyingTo(note)
    setNewNoteContent(`Respondendo... `)
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setNewNoteContent("")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* New Note Form */}
      <div className="space-y-3">
        {replyingTo && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">
              Respondendo a{" "}
              <span className="font-medium">
                Usuário {replyingTo.user_id.substring(0, 8)}
              </span>
            </span>
            <Button variant="ghost" size="sm" onClick={cancelReply}>
              Cancelar
            </Button>
          </div>
        )}

        <Textarea
          placeholder="Adicionar uma nota... Use @ para mencionar alguém"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          className="min-h-[100px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              handleSubmit()
            }
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="important"
                checked={isImportant}
                onCheckedChange={(checked) => setIsImportant(checked as boolean)}
              />
              <Label htmlFor="important" className="flex items-center gap-1 cursor-pointer">
                <Star className="h-4 w-4" />
                <span className="text-sm">Importante</span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
              />
              <Label htmlFor="private" className="flex items-center gap-1 cursor-pointer">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Privada</span>
              </Label>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !newNoteContent.trim()}
            className="gradient-primary"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Adicionar Nota
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Dica: Pressione Ctrl+Enter para enviar rapidamente
        </p>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="Nenhuma nota ainda"
            description="Seja o primeiro a adicionar uma nota para este lead"
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-muted-foreground">
                {notes.length} {notes.length === 1 ? "nota" : "notas"}
              </h3>
            </div>

            <div className="space-y-4">
              {notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  currentUserId={currentUserId}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  onToggleImportant={handleToggleImportant}
                  onTogglePrivate={handleTogglePrivate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
