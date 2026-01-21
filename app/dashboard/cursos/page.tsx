"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  GraduationCap, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  DollarSign, 
  Clock,
  BookOpen,
  TrendingUp,
  Users,
  MoreVertical
} from "lucide-react"
import { getCursos, createCurso, updateCurso, deleteCurso, type Curso } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase"
import { EmptyState } from "@/components/ui/empty-state"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null)
  const [deletingCurso, setDeletingCurso] = useState<Curso | null>(null)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    valor: "",
    duracao_media: "",
    categoria: "",
    ativo: true,
  })

  useEffect(() => {
    checkAuth()
    loadCursos()
  }, [])

  const checkAuth = async () => {
    const { user, error } = await getCurrentUser()
    if (!user || error) {
      router.push("/")
    } else {
      setUser(user)
    }
  }

  const loadCursos = async () => {
    setLoading(true)
    const data = await getCursos()
    setCursos(data)
    setLoading(false)
  }

  const handleOpenDialog = (curso?: Curso) => {
    if (curso) {
      setEditingCurso(curso)
      setFormData({
        nome: curso.nome,
        descricao: curso.descricao || "",
        valor: curso.valor?.toString() || "",
        duracao_media: curso.duracao_media || "",
        categoria: curso.categoria || "",
        ativo: curso.ativo,
      })
    } else {
      setEditingCurso(null)
      setFormData({
        nome: "",
        descricao: "",
        valor: "",
        duracao_media: "",
        categoria: "",
        ativo: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cursoData = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      valor: formData.valor ? parseFloat(formData.valor) : null,
      duracao_media: formData.duracao_media || null,
      categoria: formData.categoria || null,
      ativo: formData.ativo,
      imagem_url: null,
      detalhes: null,
    }

    if (editingCurso) {
      const updated = await updateCurso(editingCurso.id, cursoData)
      if (updated) {
        toast({
          title: "Curso atualizado",
          description: "O curso foi atualizado com sucesso.",
        })
        loadCursos()
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o curso.",
          variant: "destructive",
        })
      }
    } else {
      const created = await createCurso(cursoData)
      if (created) {
        toast({
          title: "Curso criado",
          description: "O curso foi criado com sucesso.",
        })
        loadCursos()
        setIsDialogOpen(false)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível criar o curso.",
          variant: "destructive",
        })
      }
    }
  }

  const handleDelete = async () => {
    if (!deletingCurso) return

    const success = await deleteCurso(deletingCurso.id)
    if (success) {
      toast({
        title: "Curso deletado",
        description: "O curso foi deletado com sucesso.",
      })
      loadCursos()
      setIsDeleteDialogOpen(false)
      setDeletingCurso(null)
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o curso.",
        variant: "destructive",
      })
    }
  }

  const filteredCursos = cursos.filter((curso) =>
    curso.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    curso.categoria?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Stats
  const totalCursos = cursos.length
  const cursosAtivos = cursos.filter(c => c.ativo).length
  const valorTotal = cursos.reduce((sum, c) => sum + (c.valor || 0), 0)
  const categorias = [...new Set(cursos.map(c => c.categoria).filter(Boolean))].length

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
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cursos</h1>
              <p className="text-sm text-muted-foreground">
                {filteredCursos.length} de {totalCursos} cursos
              </p>
            </div>
          </div>

          <Button className="gradient-primary" onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <GlassCard className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalCursos}</p>
              </div>
              <BookOpen className="h-8 w-8 text-[var(--whatsapp-green)]" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{cursosAtivos}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {(valorTotal / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#25D366]" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold">{categorias}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </GlassCard>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Cursos Grid */}
        {filteredCursos.length === 0 ? (
          <EmptyState
            icon={<GraduationCap />}
            title="Nenhum curso encontrado"
            description={
              searchQuery
                ? "Tente ajustar sua busca"
                : "Comece criando seu primeiro curso"
            }
            action={
              <Button className="gradient-primary" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Curso
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCursos.map((curso) => (
              <GlassCard 
                key={curso.id} 
                className="p-4 hover:shadow-lg transition-all group relative overflow-hidden"
              >
                {/* Accent Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--whatsapp-green)] to-transparent" />

                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate group-hover:text-[var(--whatsapp-green)] transition-colors">
                        {curso.nome}
                      </h3>
                      {curso.categoria && (
                        <Badge variant="outline" className="mt-1">
                          {curso.categoria}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge 
                        className={curso.ativo 
                          ? "bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30 font-medium" 
                          : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {curso.ativo ? "Ativo" : "Inativo"}
                      </Badge>
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(curso)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            // Duplicar curso
                            setFormData({
                              nome: `${curso.nome} (Cópia)`,
                              descricao: curso.descricao || "",
                              valor: curso.valor?.toString() || "",
                              duracao_media: curso.duracao_media || "",
                              categoria: curso.categoria || "",
                              ativo: curso.ativo,
                            })
                            setEditingCurso(null)
                            setIsDialogOpen(true)
                          }}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setDeletingCurso(curso)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {curso.descricao || "Sem descrição disponível"}
                  </p>

                  {/* Info */}
                  <div className="flex items-center gap-4 text-sm pt-2 border-t border-border/50">
                    {curso.valor && (
                      <div className="flex items-center gap-1 text-[var(--whatsapp-green)]">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">R$ {curso.valor.toFixed(2)}</span>
                      </div>
                    )}
                    {curso.duracao_media && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{curso.duracao_media}</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCurso ? "Editar Curso" : "Novo Curso"}</DialogTitle>
            <DialogDescription>
              Preencha as informações do curso abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome do Curso <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração</Label>
                <Input
                  id="duracao"
                  placeholder="Ex: 6 meses"
                  value={formData.duracao_media}
                  onChange={(e) => setFormData({ ...formData, duracao_media: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gradient-primary">
                {editingCurso ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Curso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o curso "{deletingCurso?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
