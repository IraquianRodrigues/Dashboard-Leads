"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { PartyPopper, Frown, DollarSign, Calendar, Clock, AlertCircle } from "lucide-react"
import type { Cliente } from "@/lib/types"
import type { LeadClosureType, LeadClosureWonData, LeadClosureLostData, MotivoPerda } from "@/lib/lead-closure-types"
import { MOTIVOS_PERDA_LABELS } from "@/lib/lead-closure-types"
import { closeLeadAsWon, closeLeadAsLost } from "@/lib/supabase"

interface LeadClosureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Cliente | null
  closureType: LeadClosureType | null
  stageId?: number | null
  onSuccess: () => void
}

export function LeadClosureModal({
  open,
  onOpenChange,
  lead,
  closureType,
  stageId,
  onSuccess,
}: LeadClosureModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Estado para "Fechado - Ganho"
  const [wonData, setWonData] = useState<LeadClosureWonData>({
    valor_fechado: lead?.valor_potencial || 0,
    data_inicio_contrato: new Date().toISOString().split('T')[0],
    duracao_contrato_meses: 12,
    criar_onboarding: true,
    enviar_mensagem: true,
  })

  // Estado para "Fechado - Perdido"
  const [lostData, setLostData] = useState<LeadClosureLostData>({
    motivo_perda: 'preco_alto',
    motivo_outro: '',
    observacoes: '',
    agendar_recontato: true,
    dias_recontato: 90,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead) return

    setLoading(true)

    try {
      if (closureType === 'won') {
        // Validações
        if (wonData.valor_fechado <= 0) {
          toast({
            title: "Erro de validação",
            description: "O valor do contrato deve ser maior que zero",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        const success = await closeLeadAsWon(lead.id, wonData, stageId || undefined)
        
        if (success) {
          toast({
            title: "🎊 Parabéns!",
            description: `${lead.nome} foi convertido em cliente!`,
          })
          onSuccess()
          onOpenChange(false)
        } else {
          throw new Error("Falha ao fechar lead")
        }
      } else if (closureType === 'lost') {
        // Validações
        if (lostData.motivo_perda === 'outro' && !lostData.motivo_outro?.trim()) {
          toast({
            title: "Erro de validação",
            description: "Por favor, especifique o motivo",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        const success = await closeLeadAsLost(lead.id, lostData, stageId || undefined)
        
        if (success) {
          toast({
            title: "Lead marcado como perdido",
            description: lostData.agendar_recontato 
              ? "Tarefa de recontato agendada para daqui 90 dias"
              : "Lead arquivado",
          })
          onSuccess()
          onOpenChange(false)
        } else {
          throw new Error("Falha ao fechar lead")
        }
      }
    } catch (error) {
      console.error("Erro ao fechar lead:", error)
      toast({
        title: "Erro",
        description: "Não foi possível processar o fechamento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!lead || !closureType) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {closureType === 'won' ? (
              <>
                <PartyPopper className="h-5 w-5 text-[#25D366]" />
                <span>Fechar Lead como Ganho</span>
              </>
            ) : (
              <>
                <Frown className="h-5 w-5 text-orange-500" />
                <span>Fechar Lead como Perdido</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {closureType === 'won' 
              ? `Parabéns! Vamos converter ${lead.nome} em cliente.`
              : `Registre o motivo da perda de ${lead.nome}.`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {closureType === 'won' ? (
            // Formulário para "Fechado - Ganho"
            <>
              <div className="space-y-2">
                <Label htmlFor="valor_fechado" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#25D366]" />
                  Valor do Contrato (R$) *
                </Label>
                <Input
                  id="valor_fechado"
                  type="number"
                  step="0.01"
                  min="0"
                  value={wonData.valor_fechado}
                  onChange={(e) => setWonData({ ...wonData, valor_fechado: parseFloat(e.target.value) || 0 })}
                  required
                  className="text-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Início
                  </Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={wonData.data_inicio_contrato}
                    onChange={(e) => setWonData({ ...wonData, data_inicio_contrato: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracao" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duração (meses)
                  </Label>
                  <Input
                    id="duracao"
                    type="number"
                    min="1"
                    value={wonData.duracao_contrato_meses}
                    onChange={(e) => setWonData({ ...wonData, duracao_contrato_meses: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-medium">Ações Automáticas</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="criar_onboarding"
                    checked={wonData.criar_onboarding}
                    onCheckedChange={(checked: boolean) => setWonData({ ...wonData, criar_onboarding: checked })}
                  />
                  <label
                    htmlFor="criar_onboarding"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Criar tarefa de onboarding (kickoff em 2 dias)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enviar_mensagem"
                    checked={wonData.enviar_mensagem}
                    onCheckedChange={(checked: boolean) => setWonData({ ...wonData, enviar_mensagem: checked })}
                  />
                  <label
                    htmlFor="enviar_mensagem"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Enviar mensagem de boas-vindas
                  </label>
                </div>
              </div>
            </>
          ) : (
            // Formulário para "Fechado - Perdido"
            <>
              <div className="space-y-2">
                <Label htmlFor="motivo_perda" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  Motivo da Perda *
                </Label>
                <Select
                  value={lostData.motivo_perda}
                  onValueChange={(value) => setLostData({ ...lostData, motivo_perda: value as MotivoPerda })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MOTIVOS_PERDA_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {lostData.motivo_perda === 'outro' && (
                <div className="space-y-2">
                  <Label htmlFor="motivo_outro">Especifique o Motivo *</Label>
                  <Input
                    id="motivo_outro"
                    value={lostData.motivo_outro}
                    onChange={(e) => setLostData({ ...lostData, motivo_outro: e.target.value })}
                    placeholder="Descreva o motivo..."
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <Textarea
                  id="observacoes"
                  value={lostData.observacoes}
                  onChange={(e) => setLostData({ ...lostData, observacoes: e.target.value })}
                  placeholder="Detalhes sobre a perda..."
                  rows={3}
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-medium">Ações Automáticas</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agendar_recontato"
                    checked={lostData.agendar_recontato}
                    onCheckedChange={(checked: boolean) => setLostData({ ...lostData, agendar_recontato: checked })}
                  />
                  <label
                    htmlFor="agendar_recontato"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Agendar recontato em 90 dias
                  </label>
                </div>
              </div>
            </>
          )}

          <DialogFooter className="gap-2">
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
              className={closureType === 'won' 
                ? "bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54]"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              }
              disabled={loading}
            >
              {loading ? "Processando..." : closureType === 'won' ? "🎊 Confirmar Vitória" : "Confirmar Perda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
