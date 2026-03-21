"use client"

import { useEffect, useState } from "react"
import { getClientes } from "@/lib/supabase"
import type { Cliente } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { StatCard } from "@/components/ui/stat-card"
import { LeadDetailModal } from "@/components/lead-detail-modal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Search,
  MessageCircle,
  Phone,
  Building2,
  ExternalLink,
  Lock,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react"

export default function ClientePage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterInterested, setFilterInterested] = useState<boolean | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    setLoading(true)
    try {
      const data = await getClientes()
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
      setClientes(sortedData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalClientes = clientes.length
  const interessadosCount = clientes.filter((cliente) => cliente.interessado).length
  const naoInteressadosCount = totalClientes - interessadosCount
  const travadosCount = clientes.filter((cliente) => cliente.trava).length
  const taxaInteresse = totalClientes > 0 ? ((interessadosCount / totalClientes) * 100).toFixed(1) : "0"

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      !searchTerm ||
      cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.includes(searchTerm) ||
      cliente.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.produto_interesse?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterInterested === null || cliente.interessado === filterInterested

    return matchesSearch && matchesFilter
  })

  const openWhatsApp = (telefone: string | null) => {
    if (!telefone) return
    const cleanPhone = telefone.replace(/\D/g, "")
    window.open(`https://wa.me/${cleanPhone}`, "_blank")
  }

  const openLeadDetail = (leadId: number) => {
    setSelectedLeadId(leadId)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedLeadId(null)
  }

  const handleLeadUpdate = () => {
    loadClientes()
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Sem atualização"
    return lastUpdated.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6">
            <div className="h-8 w-56 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-80 bg-muted animate-pulse rounded" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-14 bg-card rounded-xl animate-pulse" />
          <div className="h-96 bg-card rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white shadow-lg shadow-[var(--whatsapp-green)]/20">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredClientes.length} de {totalClientes} clientes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Atualizado às {formatLastUpdated()}
              </p>
              <Button variant="outline" size="sm" onClick={loadClientes}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total de Clientes"
              value={totalClientes.toLocaleString()}
              description="Base completa"
              icon={<Users className="h-5 w-5" />}
              variant="primary"
            />
            <StatCard
              title="Interessados"
              value={interessadosCount.toLocaleString()}
              description={`${taxaInteresse}% da base`}
              icon={<UserCheck className="h-5 w-5" />}
              variant="success"
            />
            <StatCard
              title="Não Interessados"
              value={naoInteressadosCount.toLocaleString()}
              description="Sem interesse no momento"
              icon={<UserX className="h-5 w-5" />}
              variant="default"
            />
            <StatCard
              title="Travados"
              value={travadosCount.toLocaleString()}
              description="Automação pausada"
              icon={<Lock className="h-5 w-5" />}
              variant="warning"
            />
          </div>

          <div className="rounded-xl border bg-card p-3 md:p-4 space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone, empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Button
                  variant={filterInterested === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterInterested(null)}
                >
                  Todos
                </Button>
                <Button
                  variant={filterInterested === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterInterested(true)}
                >
                  Interessados
                </Button>
                <Button
                  variant={filterInterested === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterInterested(false)}
                >
                  Não Interessados
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Exibindo <span className="font-medium text-foreground">{filteredClientes.length}</span> cliente(s) com os filtros atuais
            </div>
          </div>

          {filteredClientes.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="Nenhum cliente encontrado"
              description={
                searchTerm
                  ? "Tente ajustar os filtros de busca"
                  : "Os clientes aparecerão aqui conforme os leads forem entrando"
              }
            />
          ) : (
            <>
              <div className="grid gap-3 md:hidden">
                {filteredClientes.map((cliente) => (
                  <div key={cliente.id} className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white font-semibold text-sm">
                        {cliente.nome?.substring(0, 2).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{cliente.nome || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground truncate">{cliente.empresa || "Sem empresa"}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{cliente.telefone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{cliente.produto_interesse || "Sem interesse definido"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {cliente.interessado ? (
                        <Badge className="bg-[var(--whatsapp-green)]/10 text-[var(--whatsapp-green)] border-[var(--whatsapp-green)]/30 dark:bg-[var(--whatsapp-green)]/15 dark:text-[var(--whatsapp-light-blue)] dark:border-[var(--whatsapp-green)]/40">
                          Interessado
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground border-border">
                          Não interessado
                        </Badge>
                      )}
                      {cliente.trava && (
                        <Badge className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                          Travado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openWhatsApp(cliente.telefone)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openLeadDetail(cliente.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block rounded-xl border bg-card shadow-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Interesse</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClientes.map((cliente) => (
                      <TableRow key={cliente.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white font-semibold text-sm">
                              {cliente.nome?.substring(0, 2).toUpperCase() || "?"}
                            </div>
                            <div>
                              <div className="font-medium">{cliente.nome || "Sem nome"}</div>
                              <div className="text-xs text-muted-foreground">
                                {cliente.cargo || "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {cliente.telefone || "—"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {cliente.empresa || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{cliente.produto_interesse || "—"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {cliente.interessado ? (
                              <Badge className="bg-[var(--whatsapp-green)]/10 text-[var(--whatsapp-green)] border-[var(--whatsapp-green)]/30 dark:bg-[var(--whatsapp-green)]/15 dark:text-[var(--whatsapp-light-blue)] dark:border-[var(--whatsapp-green)]/40">
                                Interessado
                              </Badge>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground border-border">
                                Não interessado
                              </Badge>
                            )}
                            {cliente.trava && (
                              <Badge className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                                <Lock className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openWhatsApp(cliente.telefone)}
                              title="Abrir WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openLeadDetail(cliente.id)}
                              title="Ver detalhes"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </div>

      <LeadDetailModal
        leadId={selectedLeadId}
        open={modalOpen}
        onOpenChange={handleModalClose}
        onUpdate={handleLeadUpdate}
      />
    </>
  )
}
