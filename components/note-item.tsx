"use client"

import { useState } from "react"
import type { LeadNoteWithUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MoreVertical,
  Star,
  Lock,
  Edit,
  Trash2,
  Reply,
  StarOff,
  LockOpen,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface NoteItemProps {
  note: LeadNoteWithUser
  currentUserId?: string
  onEdit?: (note: LeadNoteWithUser) => void
  onDelete?: (noteId: number) => void
  onReply?: (note: LeadNoteWithUser) => void
  onToggleImportant?: (noteId: number, isImportant: boolean) => void
  onTogglePrivate?: (noteId: number, isPrivate: boolean) => void
  depth?: number
}

export function NoteItem({
  note,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  onToggleImportant,
  onTogglePrivate,
  depth = 0,
}: NoteItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const isAuthor = currentUserId === note.user_id
  const maxDepth = 3

  const getInitials = (userId: string) => {
    // Pega as primeiras 2 letras do user_id
    return userId.substring(0, 2).toUpperCase()
  }

  const formatTimestamp = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(note.id)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className={`space-y-3 ${depth > 0 ? "ml-8 mt-3" : ""}`}>
      <div
        className={`group relative rounded-lg border p-4 transition-all ${
          note.is_important
            ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
            : "bg-card hover:bg-muted/50"
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white font-semibold text-sm flex-shrink-0">
            {getInitials(note.user_id)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                Usuário {note.user_id.substring(0, 8)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(note.created_at)}
              </span>
              {note.is_important && (
                <Badge variant="warning" className="text-xs px-1.5 py-0">
                  <Star className="h-3 w-3 mr-1" />
                  Importante
                </Badge>
              )}
              {note.is_private && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  <Lock className="h-3 w-3 mr-1" />
                  Privado
                </Badge>
              )}
            </div>

            {/* Note Content */}
            <div className="text-sm whitespace-pre-wrap break-words">
              {note.content}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {depth < maxDepth && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onReply(note)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Responder
                </Button>
              )}
            </div>
          </div>

          {/* Menu */}
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onToggleImportant && (
                  <DropdownMenuItem
                    onClick={() => onToggleImportant(note.id, !note.is_important)}
                  >
                    {note.is_important ? (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Desmarcar importante
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Marcar como importante
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onTogglePrivate && (
                  <DropdownMenuItem
                    onClick={() => onTogglePrivate(note.id, !note.is_private)}
                  >
                    {note.is_private ? (
                      <>
                        <LockOpen className="h-4 w-4 mr-2" />
                        Tornar pública
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Tornar privada
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(note)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  </>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Replies */}
      {note.replies && note.replies.length > 0 && (
        <div className="space-y-3">
          {note.replies.map((reply) => (
            <NoteItem
              key={reply.id}
              note={reply}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              onToggleImportant={onToggleImportant}
              onTogglePrivate={onTogglePrivate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta nota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
