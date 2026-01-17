"use client"

import { useState, useEffect } from "react"
import { getClientes } from "@/lib/supabase"
import type { Cliente } from "@/lib/types"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
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
  Filter,
  Plus,
  MessageCircle,
  Phone,
  Building2,
  ExternalLink,
  Lock,
  Unlock,
} from "lucide-react"

export default function LeadsPage() {
  const [leads, setLeads] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterInterested, setFilterInterested] = useState<boolean | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    loadLeads()
  }, [])

  const loadLeads = async () => {
    setLoading(true)
    try {
      const data = await getClientes()
      setLeads(data)
    } catch (error) {
      console.error("Erro ao carregar leads:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !searchTerm ||
      lead.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.telefone?.includes(searchTerm) ||
      lead.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.produto_interesse?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterInterested === null || lead.interessado === filterInterested

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
    loadLeads()
  }

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
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white shadow-lg shadow-[var(--whatsapp-green)]/20">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Gestão de Leads</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredLeads.length} de {leads.length} leads
                </p>
              </div>
            </div>

            <Button className="gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
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

          {/* Table */}
          {filteredLeads.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="Nenhum lead encontrado"
              description={
                searchTerm
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando seu primeiro lead"
              }
              action={
                <Button className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Lead
                </Button>
              }
            />
          ) : (
            <div className="rounded-xl border bg-card shadow-md overflow-hidden">
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
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[var(--whatsapp-green)] to-[var(--whatsapp-dark-green)] text-white font-semibold text-sm">
                            {lead.nome?.substring(0, 2).toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-medium">{lead.nome || "Sem nome"}</div>
                            <div className="text-xs text-muted-foreground">
                              {lead.cargo || "—"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {lead.telefone || "—"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          {lead.empresa || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{lead.produto_interesse || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {lead.interessado ? (
                            <Badge className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                              Interessado
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border-border">
                              Não interessado
                            </Badge>
                          )}
                          {lead.trava && (
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
                            onClick={() => openWhatsApp(lead.telefone)}
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openLeadDetail(lead.id)}
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
          )}
        </div>
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        leadId={selectedLeadId}
        open={modalOpen}
        onOpenChange={handleModalClose}
        onUpdate={handleLeadUpdate}
      />
    </>
  )
}
