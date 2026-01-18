"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createLead } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Cliente } from "@/lib/types"

interface NewLeadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  stages: Array<{ id: number; nome: string }>
}

export function NewLeadModal({ open, onOpenChange, onSuccess, stages }: NewLeadModalProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    empresa: "",
    cargo: "",
    produto_interesse: "",
    valor_potencial: "",
    stage_id: "",
    interessado: false,
    observacoes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const leadData: Omit<Cliente, 'id' | 'created_at'> = {
        nome: formData.nome,
        telefone: formData.telefone || null,
        empresa: formData.empresa || null,
        cargo: formData.cargo || null,
        produto_interesse: formData.produto_interesse || null,
        valor_potencial: formData.valor_potencial ? parseFloat(formData.valor_potencial) : null,
        stage_id: formData.stage_id ? parseInt(formData.stage_id) : null,
        interessado: formData.interessado,
        observacoes: formData.observacoes || null,
        trava: false,
        follow_up: 0,
        last_followup: null,
        followup_status: "pendente",
      }

      const result = await createLead(leadData)

      if (result) {
        toast({
          title: "Lead criado!",
          description: `${formData.nome} foi adicionado ao pipeline.`,
        })
        onSuccess()
        onOpenChange(false)
        // Reset form
        setFormData({
          nome: "",
          telefone: "",
          empresa: "",
          cargo: "",
          produto_interesse: "",
          valor_potencial: "",
          stage_id: "",
          interessado: false,
          observacoes: "",
        })
      } else {
        throw new Error("Falha ao criar lead")
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lead</DialogTitle>
          <DialogDescription>
            Adicione um novo lead ao pipeline de vendas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              placeholder="Nome do lead"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                placeholder="Nome da empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Cargo do lead"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor Potencial (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor_potencial}
                onChange={(e) => setFormData({ ...formData, valor_potencial: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Estágio do Pipeline</Label>
            <Select
              value={formData.stage_id}
              onValueChange={(value) => setFormData({ ...formData, stage_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum (Novos Leads)" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id.toString()}>
                    {stage.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="produto">Produto de Interesse</Label>
            <Input
              id="produto"
              value={formData.produto_interesse}
              onChange={(e) => setFormData({ ...formData, produto_interesse: e.target.value })}
              placeholder="Produto ou serviço"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Notas adicionais sobre o lead"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="interessado"
              checked={formData.interessado}
              onChange={(e) => setFormData({ ...formData, interessado: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="interessado" className="cursor-pointer">
              Lead interessado
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54]"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
