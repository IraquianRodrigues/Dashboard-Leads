// =====================================================
// TIPOS PARA FECHAMENTO DE LEADS
// =====================================================

export type LeadClosureType = 'won' | 'lost'

export type MotivoPerda = 
  | 'preco_alto'
  | 'escolheu_concorrente'
  | 'sem_orcamento'
  | 'timing_errado'
  | 'nao_viu_valor'
  | 'outro'

export interface LeadClosureWonData {
  valor_fechado: number
  data_inicio_contrato: string
  duracao_contrato_meses: number
  criar_onboarding: boolean
  enviar_mensagem: boolean
}

export interface LeadClosureLostData {
  motivo_perda: MotivoPerda
  motivo_outro?: string
  observacoes?: string
  agendar_recontato: boolean
  dias_recontato?: number
}

export const MOTIVOS_PERDA_LABELS: Record<MotivoPerda, string> = {
  preco_alto: 'Preço muito alto',
  escolheu_concorrente: 'Escolheu concorrente',
  sem_orcamento: 'Sem orçamento',
  timing_errado: 'Timing errado',
  nao_viu_valor: 'Não viu valor',
  outro: 'Outro motivo'
}
