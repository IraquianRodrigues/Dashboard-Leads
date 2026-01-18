// =====================================================
// TIPOS TYPESCRIPT - CRM PROFISSIONAL
// =====================================================

// Cliente/Lead expandido
export interface Cliente {
  id: number
  created_at: string
  nome: string | null
  telefone: string | null
  trava: boolean
  follow_up: number
  interessado: boolean
  last_followup: string | null
  produto_interesse: string | null
  followup_status: string
  // Novos campos CRM
  avatar_url?: string | null
  empresa?: string | null
  cargo?: string | null
  origem?: string
  valor_potencial?: number | null
  probabilidade?: number
  data_conversao?: string | null
  observacoes?: string | null
  ultima_interacao?: string | null
  stage_id?: number | null
  score?: number
  // Campos de fechamento
  motivo_perda?: string | null
  valor_fechado?: number | null
  data_inicio_contrato?: string | null
  duracao_contrato_meses?: number | null
  is_cliente_ativo?: boolean
}

// Estágio do Pipeline
export interface PipelineStage {
  id: number
  nome: string
  descricao?: string | null
  ordem: number
  cor: string
  ativo: boolean
  created_at: string
  updated_at: string
}

// Atividade do Lead
export interface LeadActivity {
  id: number
  lead_id: number
  tipo: 'call' | 'email' | 'note' | 'meeting' | 'whatsapp' | 'stage_change' | 'task_completed'
  titulo: string
  descricao?: string | null
  metadata?: Record<string, any> | null
  user_id?: string | null
  created_at: string
}

// Atividade com informações do lead
export interface LeadActivityWithLead extends LeadActivity {
  lead?: {
    id: number
    nome: string | null
    empresa?: string | null
  }
}

// Tarefa
export interface Task {
  id: number
  lead_id?: number | null
  titulo: string
  descricao?: string | null
  data_vencimento?: string | null
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
  assignee_id?: string | null
  completed_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

// Tarefa com informações do lead
export interface TaskWithLead extends Task {
  lead?: {
    id: number
    nome: string | null
    empresa?: string | null
  }
  urgencia?: 'vencida' | 'urgente' | 'normal'
}

// Tag
export interface Tag {
  id: number
  nome: string
  cor: string
  descricao?: string | null
  created_at: string
}

// Relacionamento Lead-Tag
export interface LeadTag {
  id: number
  lead_id: number
  tag_id: number
  created_at: string
}

// Template de Mensagem
export interface MessageTemplate {
  id: number
  nome: string
  conteudo: string
  tipo: 'whatsapp' | 'email' | 'sms'
  categoria?: string | null
  variaveis?: string[] | null
  ativo: boolean
  created_by?: string | null
  created_at: string
  updated_at: string
}

// Automação
export interface Automation {
  id: number
  nome: string
  descricao?: string | null
  trigger_tipo: 'novo_lead' | 'mudanca_estagio' | 'sem_interacao' | 'tarefa_vencida' | 'data_especifica'
  trigger_config?: Record<string, any> | null
  acao_tipo: 'enviar_mensagem' | 'criar_tarefa' | 'mudar_estagio' | 'adicionar_tag' | 'notificacao'
  acao_config?: Record<string, any> | null
  ativo: boolean
  created_by?: string | null
  created_at: string
  updated_at: string
}

// Log de Automação
export interface AutomationLog {
  id: number
  automation_id?: number | null
  lead_id?: number | null
  status: 'sucesso' | 'erro' | 'pendente'
  mensagem?: string | null
  metadata?: Record<string, any> | null
  executed_at: string
}

// Métricas do Dashboard
export interface DashboardMetrics {
  total_leads: number
  leads_novos: number
  leads_interessados: number
  conversas_travadas: number
  taxa_conversao: number
  valor_pipeline: number
  tarefas_pendentes: number
  tarefas_vencidas: number
}

// Leads por Estágio (View)
export interface LeadsPorEstagio {
  stage_id: number
  stage_nome: string
  ordem: number
  total_leads: number
  valor_total: number
  probabilidade_media: number
}

// Lead completo com relacionamentos
export interface LeadCompleto extends Cliente {
  stage?: PipelineStage | null
  tags?: Tag[]
  activities?: LeadActivity[]
  tasks?: Task[]
}

// Filtros para busca de leads
export interface LeadFilters {
  search?: string
  stage_id?: number
  origem?: string
  interessado?: boolean
  trava?: boolean
  tag_ids?: number[]
  data_inicio?: string
  data_fim?: string
}

// Opções de ordenação
export interface SortOptions {
  field: keyof Cliente
  direction: 'asc' | 'desc'
}

// Paginação
export interface PaginationOptions {
  page: number
  pageSize: number
}

// Resultado paginado
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
