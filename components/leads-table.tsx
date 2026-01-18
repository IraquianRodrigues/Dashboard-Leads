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
import { ChevronLeft, ChevronRight, Lock, Unlock, Filter, MessageCircle, Phone, Search, X } from "lucide-react"
import { getClientes, updateClienteStatus, type Cliente } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white shadow-md shadow-[var(--whatsapp-green)]/20">
                <MessageCircle className="h-5 w-5" />
              </div>
              <span className="text-xl">Clientes do WhatsApp</span>
            </div>
            <Badge variant="secondary" className="font-medium">
              {filteredClientes.length} {filteredClientes.length === 1 ? "cliente" : "clientes"}
            </Badge>
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
                className="pl-9 pr-9 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Status Filter */}
              <Button
                variant={statusFilter !== "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(statusFilter === "all" ? "active" : statusFilter === "active" ? "locked" : "all")
                  setCurrentPage(1)
                }}
                className={statusFilter !== "all" ? "bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)]" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                {statusFilter === "all" ? "Status" : statusFilter === "active" ? "Ativos" : "Travados"}
              </Button>

              {/* Interest Filter */}
              <Button
                variant={interestFilter !== "all" ? "default" : "outline"}
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
                className={interestFilter !== "all" ? "bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)]" : ""}
              >
                {interestFilter === "all" ? "Interesse" : interestFilter === "interested" ? "Interessados" : "Sem Interesse"}
              </Button>

              {/* Follow-up Filter */}
              <Button
                variant={showFollowUpFilter ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowFollowUpFilter(!showFollowUpFilter)
                  setCurrentPage(1)
                }}
                className={showFollowUpFilter ? "bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)]" : ""}
              >
                Follow Up
              </Button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--whatsapp-green)] mb-4"></div>
            <div className="text-muted-foreground text-sm">Carregando clientes...</div>
          </div>
        ) : (
          <>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50 transition-colors">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Telefone</TableHead>
                    <TableHead className="font-semibold">Interessado</TableHead>
                    <TableHead className="font-semibold">Produto</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Follow Up</TableHead>
                    <TableHead className="text-right font-semibold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentClientes.map((cliente) => (
                    <TableRow key={cliente.id} className="hover:bg-muted/30 transition-colors duration-200">
                      <TableCell className="font-medium">{cliente.nome || "Sem nome"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[var(--whatsapp-green)]" />
                          <span className="text-sm font-medium">{cliente.telefone || "Sem telefone"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cliente.interessado 
                            ? "bg-[#25D366]/10 dark:bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30" 
                            : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {cliente.interessado ? "Sim" : "Não"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate" title={cliente.produto_interesse || ""}>
                          {cliente.produto_interesse || "Não informado"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={!cliente.trava 
                            ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" 
                            : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                          }
                        >
                          {!cliente.trava ? "Ativo" : "Travado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cliente.follow_up > 1 ? "default" : "outline"}>{cliente.follow_up}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 bg-transparent hover:bg-[var(--whatsapp-green)] hover:text-white hover:scale-110 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
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
                              <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-transparent hover:bg-accent hover:scale-110 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md">
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
            <div className="flex items-center justify-between space-x-2 py-4 border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length}{" "}
                {showFollowUpFilter ? "clientes com follow up > 1" : "clientes do WhatsApp"}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="hover:bg-accent transition-colors duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
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
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`h-8 w-8 p-0 transition-all duration-200 ${
                          currentPage === pageNumber 
                            ? "bg-[var(--whatsapp-green)] hover:bg-[var(--whatsapp-dark-green)]" 
                            : "hover:bg-accent"
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
                  className="hover:bg-accent transition-colors duration-200"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
