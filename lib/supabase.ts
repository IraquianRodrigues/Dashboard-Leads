import { createBrowserClient } from "@supabase/ssr"

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error("❌ ERRO CRÍTICO: Variáveis de ambiente não encontradas!")
    console.error("URL:", url ? "✅" : "❌ UNDEFINED")
    console.error("KEY:", key ? "✅" : "❌ UNDEFINED")
    throw new Error("Supabase URL and Key are required")
  }
  
  return createBrowserClient(url, key)
}

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}

export async function onAuthStateChange(callback: (user: any) => void) {
  const supabase = createClient()
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
  return { data }
}

export interface User {
  id: string
  email: string
  created_at: string
  last_login?: string
}

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
}

export interface Curso {
  id: number
  created_at: string
  updated_at: string
  nome: string
  descricao: string | null
  valor: number | null
  duracao_media: string | null
  categoria: string | null
  ativo: boolean
  imagem_url: string | null
  detalhes: any | null
}

const TABLE_NAME = process.env.NEXT_PUBLIC_TABLE_NAME!

export async function getClientes(): Promise<Cliente[]> {
  const tableName = TABLE_NAME

  // Validação das variáveis de ambiente
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("❌ Erro: Variáveis de ambiente do Supabase não configuradas")
    return []
  }

  if (!tableName) {
    console.error("❌ Erro: NEXT_PUBLIC_TABLE_NAME não configurada")
    return []
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar clientes:", {
        message: error.message,
        code: error.code,
        table: tableName,
      })
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar clientes:", exception)
    return []
  }
}

export async function updateClienteStatus(id: number, trava: boolean): Promise<boolean> {
  if (!TABLE_NAME) {
    console.error("Erro: NEXT_PUBLIC_TABLE_NAME não configurada")
    return false
  }

  const supabase = createClient()
  const { error } = await supabase.from(TABLE_NAME).update({ trava }).eq("id", id)

  if (error) {
    console.error("Erro ao atualizar status do cliente:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    return false
  }

  return true
}

// ==================== CURSO FUNCTIONS ====================

export async function getCursos(): Promise<Curso[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("cursos")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar cursos:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar cursos:", exception)
    return []
  }
}

export async function getCurso(id: number): Promise<Curso | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("cursos")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erro ao buscar curso:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao buscar curso:", exception)
    return null
  }
}

export async function createCurso(curso: Omit<Curso, "id" | "created_at" | "updated_at">): Promise<Curso | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("cursos")
      .insert([curso])
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar curso:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao criar curso:", exception)
    return null
  }
}

export async function updateCurso(id: number, curso: Partial<Curso>): Promise<Curso | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("cursos")
      .update(curso)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar curso:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao atualizar curso:", exception)
    return null
  }
}

export async function deleteCurso(id: number): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("cursos")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao deletar curso:", error)
      return false
    }

    return true
  } catch (exception) {
    console.error("Exceção ao deletar curso:", exception)
    return false
  }
}

// ==================== CRM FUNCTIONS ====================

// Import types
import type {
  PipelineStage,
  LeadActivity,
  LeadActivityWithLead,
  Task,
  TaskWithLead,
  Tag,
  LeadTag,
  MessageTemplate,
  Automation,
  DashboardMetrics,
  LeadsPorEstagio,
  LeadCompleto,
} from "./types"

// ==================== PIPELINE STAGES ====================

export async function getPipelineStages(): Promise<PipelineStage[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("pipeline_stages")
      .select("*")
      .eq("ativo", true)
      .order("ordem", { ascending: true })

    if (error) {
      console.error("Erro ao buscar estágios do pipeline:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar estágios do pipeline:", exception)
    return []
  }
}

export async function updateLeadStage(leadId: number, stageId: number): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ stage_id: stageId })
      .eq("id", leadId)

    if (error) {
      console.error("Erro ao atualizar estágio do lead:", error)
      return false
    }

    return true
  } catch (exception) {
    console.error("Exceção ao atualizar estágio do lead:", exception)
    return false
  }
}

// ==================== ACTIVITIES ====================

export async function getLeadActivities(leadId: number): Promise<LeadActivity[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lead_activities")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar atividades do lead:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar atividades do lead:", exception)
    return []
  }
}

export async function createActivity(
  leadId: number,
  tipo: LeadActivity["tipo"],
  titulo: string,
  descricao?: string,
  metadata?: Record<string, any>
): Promise<LeadActivity | null> {
  try {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from("lead_activities")
      .insert([{
        lead_id: leadId,
        tipo,
        titulo,
        descricao,
        metadata,
        user_id: userData?.user?.id,
      }])
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar atividade:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao criar atividade:", exception)
    return null
  }
}

export async function getRecentActivities(limit: number = 50): Promise<LeadActivityWithLead[]> {
  try {
    const supabase = createClient()
    const selectQuery = `
      *,
      lead:clientes!lead_id(id, nome, empresa)
    `
    const { data, error } = await supabase
      .from("lead_activities")
      .select(selectQuery)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Erro ao buscar atividades recentes:", error)
      return []
    }

    return (data as unknown as LeadActivityWithLead[]) || []
  } catch (exception) {
    console.error("Exceção ao buscar atividades recentes:", exception)
    return []
  }
}

// ==================== TASKS ====================

export async function getTasks(filters?: {
  status?: Task["status"]
  lead_id?: number
  assignee_id?: string
}): Promise<TaskWithLead[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from("tasks")
      .select(`
        *,
        lead:clientes!lead_id(id, nome, empresa)
      `)

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }
    if (filters?.lead_id) {
      query = query.eq("lead_id", filters.lead_id)
    }
    if (filters?.assignee_id) {
      query = query.eq("assignee_id", filters.assignee_id)
    }

    const { data, error } = await query.order("data_vencimento", { ascending: true })

    if (error) {
      console.error("Erro ao buscar tarefas:", error)
      return []
    }

    return (data as unknown as TaskWithLead[]) || []
  } catch (exception) {
    console.error("Exceção ao buscar tarefas:", exception)
    return []
  }
}

export async function createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task | null> {
  try {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from("tasks")
      .insert([{
        ...task,
        created_by: userData?.user?.id,
      }])
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar tarefa:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao criar tarefa:", exception)
    return null
  }
}

export async function updateTask(id: number, task: Partial<Task>): Promise<Task | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tasks")
      .update(task)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar tarefa:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao atualizar tarefa:", exception)
    return null
  }
}

export async function deleteTask(id: number): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao deletar tarefa:", error)
      return false
    }

    return true
  } catch (exception) {
    console.error("Exceção ao deletar tarefa:", exception)
    return false
  }
}

export async function completeTask(id: number): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .update({
        status: "concluida",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("Erro ao completar tarefa:", error)
      return false
    }

    return true
  } catch (exception) {
    console.error("Exceção ao completar tarefa:", exception)
    return false
  }
}

// ==================== TAGS ====================

export async function getTags(): Promise<Tag[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao buscar tags:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar tags:", exception)
    return []
  }
}

export async function getLeadTags(leadId: number): Promise<Tag[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lead_tags")
      .select("tag:tags(*)")
      .eq("lead_id", leadId)

    if (error) {
      console.error("Erro ao buscar tags do lead:", error)
      return []
    }

    return data?.map((item: any) => item.tag) || []
  } catch (exception) {
    console.error("Exceção ao buscar tags do lead:", exception)
    return []
  }
}

export async function addTagToLead(leadId: number, tagId: number): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("lead_tags")
      .insert([{ lead_id: leadId, tag_id: tagId }])

    if (error) {
      console.error("Erro ao adicionar tag ao lead:", error)
      return false
    }

    return true
  } catch (exception) {
    console.error("Exceção ao adicionar tag ao lead:", exception)
    return false
  }
}

export async function removeTagFromLead(leadId: number, tagId: number): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("lead_tags")
      .delete()
      .eq("lead_id", leadId)
      .eq("tag_id", tagId)

    if (error) {
      console.error("Erro ao remover tag do lead:", error)
      return false
    }

    return true
  } catch (exception) {
    console.error("Exceção ao remover tag do lead:", exception)
    return false
  }
}

// ==================== MESSAGE TEMPLATES ====================

export async function getMessageTemplates(tipo?: MessageTemplate["tipo"]): Promise<MessageTemplate[]> {
  try {
    const supabase = createClient()
    let query = supabase
      .from("message_templates")
      .select("*")
      .eq("ativo", true)

    if (tipo) {
      query = query.eq("tipo", tipo)
    }

    const { data, error } = await query.order("nome", { ascending: true })

    if (error) {
      console.error("Erro ao buscar templates:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar templates:", exception)
    return []
  }
}

export async function createMessageTemplate(
  template: Omit<MessageTemplate, "id" | "created_at" | "updated_at">
): Promise<MessageTemplate | null> {
  try {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from("message_templates")
      .insert([{
        ...template,
        created_by: userData?.user?.id,
      }])
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar template:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao criar template:", exception)
    return null
  }
}

// ==================== AUTOMATIONS ====================

export async function getAutomations(): Promise<Automation[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("automations")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar automações:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar automações:", exception)
    return []
  }
}

// ==================== ANALYTICS ====================

export async function getDashboardMetrics(periodoDias: number = 30): Promise<DashboardMetrics | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .rpc("get_dashboard_metrics", { periodo_dias: periodoDias })
      .single()

    if (error) {
      console.error("Erro ao buscar métricas do dashboard:", error)
      return null
    }

    return data as DashboardMetrics
  } catch (exception) {
    console.error("Exceção ao buscar métricas do dashboard:", exception)
    return null
  }
}

export async function getLeadsPorEstagio(): Promise<LeadsPorEstagio[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_leads_por_estagio")
      .select("*")

    if (error) {
      console.error("Erro ao buscar leads por estágio:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar leads por estágio:", exception)
    return []
  }
}

export async function getLeadCompleto(leadId: number): Promise<LeadCompleto | null> {
  try {
    const supabase = createClient()
    
    // Buscar lead básico primeiro
    const { data: lead, error: leadError } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", leadId)
      .single()

    if (leadError) {
      console.error("Erro ao buscar lead:", leadError)
      return null
    }

    if (!lead) {
      return null
    }

    // Tentar buscar stage (pode não existir se tabela não foi criada)
    let stage = null
    if (lead.stage_id) {
      try {
        const { data: stageData } = await supabase
          .from("pipeline_stages")
          .select("*")
          .eq("id", lead.stage_id)
          .single()
        stage = stageData
      } catch (error) {
        // Tabela pipeline_stages pode não existir ainda
        console.log("Pipeline stages não disponível")
      }
    }

    // Buscar tags (pode falhar se tabela não existe)
    let tags: Tag[] = []
    try {
      tags = await getLeadTags(leadId)
    } catch (error) {
      console.log("Tags não disponíveis")
    }
    
    // Buscar atividades (pode falhar se tabela não existe)
    let activities: LeadActivity[] = []
    try {
      activities = await getLeadActivities(leadId)
    } catch (error) {
      console.log("Atividades não disponíveis")
    }
    
    // Buscar tarefas (pode falhar se tabela não existe)
    let tasks: Task[] = []
    try {
      tasks = await getTasks({ lead_id: leadId })
    } catch (error) {
      console.log("Tarefas não disponíveis")
    }

    return {
      ...lead,
      stage,
      tags,
      activities,
      tasks,
    }
  } catch (exception) {
    console.error("Exceção ao buscar lead completo:", exception)
    return null
  }
}

// ==================== LEAD UPDATES ====================

export async function updateLead(id: number, updates: Partial<Cliente>): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(updates)
      .eq("id", id)

    if (error) {
      console.error("Erro ao atualizar lead:", error)
      return false
    }

    return true
  } catch (exception) {
    console.error("Exceção ao atualizar lead:", exception)
    return false
  }
}

export async function createLead(leadData: Omit<Cliente, 'id' | 'created_at'>): Promise<Cliente | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([leadData])
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar lead:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao criar lead:", exception)
    return null
  }
}
