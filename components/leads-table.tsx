"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChevronLeft, ChevronRight, Lock, Unlock, Filter, MessageCircle, Phone, Search, X, Download } from "lucide-react"
import { getClientes, updateClienteStatus, type Cliente } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { exportLeadsToCsv } from "@/lib/export-csv"

const ITEMS_PER_PAGE = 20

export function LeadsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">("all")
  const [interestFilter, setInterestFilter] = useState<"all" | "interested" | "not-interested">("all")
  const [showFollowUpFilter, setShowFollowUpFilter] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadClientes = async () => {
    setLoading(true)
    try {
      const data = await getClientes()
      if (data.length > 0) {
        setClientes(data)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClientes()
  }, [])

  // Apply all filters
  const filteredClientes = clientes.filter((cliente) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      cliente.nome?.toLowerCase().includes(searchLower) ||
      cliente.telefone?.includes(searchQuery)

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !cliente.trava) ||
      (statusFilter === "locked" && cliente.trava)

    // Interest filter
    const matchesInterest =
      interestFilter === "all" ||
      (interestFilter === "interested" && cliente.interessado) ||
      (interestFilter === "not-interested" && !cliente.interessado)

    // Follow-up filter
    const matchesFollowUp = !showFollowUpFilter || cliente.follow_up >= 1

    return matchesSearch && matchesStatus && matchesInterest && matchesFollowUp
  })

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentClientes = filteredClientes.slice(startIndex, endIndex)

  const handleToggleConversation = async (clienteId: number, clienteName: string | null) => {
    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) return

    const newTravaStatus = !cliente.trava

    const success = await updateClienteStatus(clienteId, newTravaStatus)

    if (success) {
      setClientes((prevClientes) => prevClientes.map((c) => (c.id === clienteId ? { ...c, trava: newTravaStatus } : c)))

      const action = newTravaStatus ? "travada" : "destravada"
      toast({
        title: `Conversa ${action}`,
        description: `A conversa com ${clienteName} foi ${action} com sucesso.`,
      })
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da conversa.",
        variant: "destructive",
      })
    }
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setInterestFilter("all")
    setShowFollowUpFilter(false)
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || interestFilter !== "all" || showFollowUpFilter

  return (
    <Card className="shadow-none border-border">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Leads do WhatsApp</CardTitle>
                <p className="text-xs text-muted-foreground">Gerencie seus contatos e conversas</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  exportLeadsToCsv(filteredClientes)
                  toast({
                    title: "CSV exportado!",
                    description: `${filteredClientes.length} leads exportados com sucesso.`,
                  })
                }}
                disabled={filteredClientes.length === 0}
              >
                <Download className="h-3 w-3" />
                Exportar
              </Button>
              <Badge variant="secondary" className="font-medium">
                {filteredClientes.length} {filteredClientes.length === 1 ? "lead" : "leads"}
              </Badge>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 pr-9 h-9 bg-background/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Status Filter */}
              <Button
                variant={statusFilter !== "all" ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(statusFilter === "all" ? "active" : statusFilter === "active" ? "locked" : "all")
                  setCurrentPage(1)
                }}
                className={cn(
                  "h-9 text-xs",
                  statusFilter !== "all" && "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                )}
              >
                <Filter className="h-3 w-3 mr-2" />
                {statusFilter === "all" ? "Status" : statusFilter === "active" ? "Ativos" : "Travados"}
              </Button>

              {/* Interest Filter */}
              <Button
                variant={interestFilter !== "all" ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setInterestFilter(
                    interestFilter === "all"
                      ? "interested"
                      : interestFilter === "interested"
                        ? "not-interested"
                        : "all"
                  )
                  setCurrentPage(1)
                }}
                className={cn(
                  "h-9 text-xs",
                  interestFilter !== "all" && "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                )}
              >
                {interestFilter === "all" ? "Interesse" : interestFilter === "interested" ? "Interessados" : "Sem Interesse"}
              </Button>

              {/* Follow-up Filter */}
              <Button
                variant={showFollowUpFilter ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setShowFollowUpFilter(!showFollowUpFilter)
                  setCurrentPage(1)
                }}
                 className={cn(
                  "h-9 text-xs",
                  showFollowUpFilter && "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                )}
              >
                Follow Up
              </Button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 text-xs text-muted-foreground hover:text-destructive">
                  <X className="h-3 w-3 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
            <div className="text-muted-foreground text-sm">Carregando dados...</div>
          </div>
        ) : (
          <>
            <div className="border-b border-border">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-10">Lead</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-10">Contato</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-10">Interesse</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-10">Produto</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-10">Status</TableHead>
                    <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground h-10">Follow Up</TableHead>
                    <TableHead className="text-right font-medium text-xs uppercase tracking-wider text-muted-foreground h-10 w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentClientes.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-muted/30 transition-colors border-border/50">
                      <TableCell className="font-medium text-sm py-3">{cliente.nome || "Sem nome"}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{cliente.telefone || "Sem telefone"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge 
                          variant="outline"
                          className={cn("font-normal", cliente.interessado 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" 
                            : "text-muted-foreground"
                          )}
                        >
                          {cliente.interessado ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-sm text-muted-foreground max-w-[150px] truncate block" title={cliente.produto_interesse || ""}>
                          {cliente.produto_interesse || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn("font-normal", !cliente.trava 
                            ? "bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                          )}
                        >
                          {!cliente.trava ? "Ativo" : "Pausado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                         {cliente.follow_up > 0 && (
                            <Badge variant="secondary" className="font-normal bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {cliente.follow_up}x
                            </Badge>
                         )}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10"
                            onClick={() => {
                              const phoneNumber = cliente.telefone?.replace(/\D/g, "") // Remove non-digits
                              if (phoneNumber) {
                                const waLink = `https://wa.me/55${phoneNumber}`
                                window.open(waLink, "_blank")
                              }
                            }}
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                {cliente.trava ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{cliente.trava ? "Destravar" : "Travar"} conversa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja {cliente.trava ? "destravar" : "travar"} a conversa com{" "}
                                  {cliente.nome}?
                                  {cliente.trava
                                    ? " A automação do WhatsApp voltará a funcionar normalmente."
                                    : " A automação do WhatsApp será pausada para este cliente."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleToggleConversation(cliente.id, cliente.nome)}>
                                  {cliente.trava ? "Destravar" : "Travar"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <div className="text-xs text-muted-foreground">
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2 text-xs"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`h-8 w-8 p-0 text-xs ${
                          currentPage === pageNumber 
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
                            : "text-muted-foreground"
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2 text-xs"
                >
                  Próxima
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
