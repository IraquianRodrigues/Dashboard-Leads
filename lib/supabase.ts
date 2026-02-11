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

// Re-export Cliente from types.ts (single source of truth)
export type { Cliente } from "./types"

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
  Cliente,
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
  LeadNote,
  LeadNoteWithUser,
  CreateNoteInput,
  UpdateNoteInput,
  NoteMention,
  LeadCourseInterest,
  LatestCourseInterest,
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

// ==================== LEADS BY SOURCE ====================

export interface LeadsBySource {
  source: string
  total: number
  interessados: number
  taxa_conversao: number
}

export async function getLeadsBySource(): Promise<LeadsBySource[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("origem, utm_source, interessado")

    if (error) {
      console.error("Erro ao buscar leads por origem:", error)
      return []
    }

    if (!data || data.length === 0) return []

    const sourceMap = new Map<string, { total: number; interessados: number }>()

    for (const lead of data) {
      const source = lead.utm_source || lead.origem || "Direto"
      const current = sourceMap.get(source) || { total: 0, interessados: 0 }
      current.total++
      if (lead.interessado) current.interessados++
      sourceMap.set(source, current)
    }

    return Array.from(sourceMap.entries())
      .map(([source, stats]) => ({
        source: formatSourceName(source),
        total: stats.total,
        interessados: stats.interessados,
        taxa_conversao: stats.total > 0
          ? Number(((stats.interessados / stats.total) * 100).toFixed(1))
          : 0,
      }))
      .sort((a, b) => b.total - a.total)
  } catch (exception) {
    console.error("Exceção ao buscar leads por origem:", exception)
    return []
  }
}

function formatSourceName(source: string): string {
  const names: Record<string, string> = {
    whatsapp: "WhatsApp",
    facebook: "Facebook Ads",
    google: "Google Ads",
    instagram: "Instagram Ads",
    tiktok: "TikTok Ads",
    organic: "Orgânico",
    referral: "Indicação",
    direct: "Direto",
    email: "E-mail",
    Direto: "Direto",
  }
  return names[source] || source.charAt(0).toUpperCase() + source.slice(1)
}

// ==================== FUNNEL DATA ====================

export interface FunnelStage {
  id: number
  nome: string
  ordem: number
  cor: string
  total: number
  percentageOfFirst: number
  conversionFromPrev: number | null
}

export async function getFunnelData(): Promise<FunnelStage[]> {
  try {
    const supabase = createClient()

    const [stagesResult, leadsResult] = await Promise.all([
      supabase
        .from("pipeline_stages")
        .select("id, nome, ordem, cor")
        .eq("ativo", true)
        .order("ordem", { ascending: true }),
      supabase
        .from(TABLE_NAME)
        .select("stage_id"),
    ])

    if (stagesResult.error || leadsResult.error) {
      console.error("Erro ao buscar dados do funil:", stagesResult.error || leadsResult.error)
      return []
    }

    const stages = stagesResult.data || []
    const leads = leadsResult.data || []

    if (stages.length === 0) return []

    const countByStage = new Map<number, number>()
    for (const lead of leads) {
      if (lead.stage_id != null) {
        countByStage.set(lead.stage_id, (countByStage.get(lead.stage_id) || 0) + 1)
      }
    }

    const firstStageCount = countByStage.get(stages[0].id) || 0

    return stages.map((stage, index) => {
      const total = countByStage.get(stage.id) || 0
      const prevTotal = index > 0 ? (countByStage.get(stages[index - 1].id) || 0) : null

      return {
        id: stage.id,
        nome: stage.nome,
        ordem: stage.ordem,
        cor: stage.cor,
        total,
        percentageOfFirst: firstStageCount > 0
          ? Number(((total / firstStageCount) * 100).toFixed(1))
          : 0,
        conversionFromPrev: prevTotal !== null && prevTotal > 0
          ? Number(((total / prevTotal) * 100).toFixed(1))
          : null,
      }
    })
  } catch (exception) {
    console.error("Exceção ao buscar dados do funil:", exception)
    return []
  }
}

// ==================== CAMPAIGN ANALYTICS ====================

export interface CampaignData {
  campaign: string
  source: string
  medium: string
  total: number
  interessados: number
  taxa_conversao: number
  primeiro_lead: string
  ultimo_lead: string
}

export interface CampaignSummary {
  total_campaigns: number
  total_leads_com_utm: number
  total_leads_sem_utm: number
  melhor_campanha: string | null
  melhor_fonte: string | null
  campaigns: CampaignData[]
  sources_summary: Array<{ source: string; total: number; interessados: number; taxa_conversao: number }>
  mediums_summary: Array<{ medium: string; total: number; interessados: number; taxa_conversao: number }>
  daily_leads: Array<{ date: string; total: number; fonte: string }>
}

export async function getCampaignAnalytics(): Promise<CampaignSummary> {
  const empty: CampaignSummary = {
    total_campaigns: 0,
    total_leads_com_utm: 0,
    total_leads_sem_utm: 0,
    melhor_campanha: null,
    melhor_fonte: null,
    campaigns: [],
    sources_summary: [],
    mediums_summary: [],
    daily_leads: [],
  }

  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("utm_source, utm_medium, utm_campaign, interessado, created_at")

    if (error || !data) {
      console.error("Erro ao buscar campaign analytics:", error)
      return empty
    }

    const leadsComUtm = data.filter((l) => l.utm_source || l.utm_campaign)
    const leadsSemUtm = data.filter((l) => !l.utm_source && !l.utm_campaign)

    // Group by campaign
    interface CampaignAccumulator { source: string; medium: string; total: number; interessados: number; dates: string[] }
    const campaignMap = new Map<string, CampaignAccumulator>()
    for (const lead of leadsComUtm) {
      const campaign = lead.utm_campaign || "(sem campanha)"
      let current = campaignMap.get(campaign)
      if (!current) {
        current = {
          source: lead.utm_source || "direto",
          medium: lead.utm_medium || "none",
          total: 0,
          interessados: 0,
          dates: [] as string[],
        }
      }
      current.total++
      if (lead.interessado) current.interessados++
      current.dates.push(lead.created_at as string)
      campaignMap.set(campaign, current)
    }

    const campaigns: CampaignData[] = Array.from(campaignMap.entries())
      .map(([campaign, stats]) => ({
        campaign: formatSourceName(campaign),
        source: formatSourceName(stats.source),
        medium: stats.medium,
        total: stats.total,
        interessados: stats.interessados,
        taxa_conversao: stats.total > 0
          ? Number(((stats.interessados / stats.total) * 100).toFixed(1))
          : 0,
        primeiro_lead: stats.dates.sort()[0] || "",
        ultimo_lead: stats.dates.sort().reverse()[0] || "",
      }))
      .sort((a, b) => b.total - a.total)

    // Group by source
    const sourceMap = new Map<string, { total: number; interessados: number }>()
    for (const lead of leadsComUtm) {
      const source = formatSourceName(lead.utm_source || "direto")
      const current = sourceMap.get(source) || { total: 0, interessados: 0 }
      current.total++
      if (lead.interessado) current.interessados++
      sourceMap.set(source, current)
    }
    const sources_summary = Array.from(sourceMap.entries())
      .map(([source, s]) => ({
        source,
        total: s.total,
        interessados: s.interessados,
        taxa_conversao: s.total > 0 ? Number(((s.interessados / s.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total)

    // Group by medium
    const mediumMap = new Map<string, { total: number; interessados: number }>()
    for (const lead of leadsComUtm) {
      const medium = lead.utm_medium || "none"
      const current = mediumMap.get(medium) || { total: 0, interessados: 0 }
      current.total++
      if (lead.interessado) current.interessados++
      mediumMap.set(medium, current)
    }
    const mediums_summary = Array.from(mediumMap.entries())
      .map(([medium, s]) => ({
        medium,
        total: s.total,
        interessados: s.interessados,
        taxa_conversao: s.total > 0 ? Number(((s.interessados / s.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.total - a.total)

    // Daily leads (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const dailyMap = new Map<string, { total: number; fonte: string }>()
    for (const lead of leadsComUtm) {
      const d = new Date(lead.created_at)
      if (d >= thirtyDaysAgo) {
        const dateKey = d.toISOString().slice(0, 10)
        const current = dailyMap.get(dateKey) || { total: 0, fonte: lead.utm_source || "" }
        current.total++
        dailyMap.set(dateKey, current)
      }
    }
    const daily_leads = Array.from(dailyMap.entries())
      .map(([date, d]) => ({ date, total: d.total, fonte: d.fonte }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const melhorCampanha = campaigns[0]?.campaign || null
    const melhorFonte = sources_summary[0]?.source || null

    return {
      total_campaigns: campaigns.length,
      total_leads_com_utm: leadsComUtm.length,
      total_leads_sem_utm: leadsSemUtm.length,
      melhor_campanha: melhorCampanha,
      melhor_fonte: melhorFonte,
      campaigns,
      sources_summary,
      mediums_summary,
      daily_leads,
    }
  } catch (exception) {
    console.error("Exceção ao buscar campaign analytics:", exception)
    return empty
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

// ==================== LEAD CLOSURE ====================

import type { LeadClosureWonData, LeadClosureLostData } from "./lead-closure-types"

/**
 * Fecha um lead como ganho (convertido em cliente)
 */
export async function closeLeadAsWon(leadId: number, data: LeadClosureWonData, stageId?: number): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // 1. Atualizar lead
    const updateData: Record<string, unknown> = {
      valor_fechado: data.valor_fechado,
      data_inicio_contrato: data.data_inicio_contrato,
      duracao_contrato_meses: data.duracao_contrato_meses,
      is_cliente_ativo: true,
      interessado: true,
      data_conversao: new Date().toISOString(),
    }
    if (stageId) updateData.stage_id = stageId

    const { error: updateError } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq("id", leadId)

    if (updateError) {
      console.error("Erro ao atualizar lead como ganho:", updateError)
      return false
    }

    // 2. Criar atividade de fechamento
    await createActivity(
      leadId,
      "stage_change",
      "🎉 Negócio Fechado!",
      `Lead convertido em cliente. Valor: R$ ${data.valor_fechado.toFixed(2)}`,
      {
        tipo_fechamento: "ganho",
        valor_fechado: data.valor_fechado,
        data_inicio_contrato: data.data_inicio_contrato,
        duracao_meses: data.duracao_contrato_meses,
      }
    )

    // 3. Criar tarefa de onboarding (se solicitado)
    if (data.criar_onboarding) {
      const dataVencimento = new Date()
      dataVencimento.setDate(dataVencimento.getDate() + 2) // +2 dias

      await createTask({
        lead_id: leadId,
        titulo: "Agendar reunião de kickoff",
        descricao: "Reunião inicial para alinhamento e início do projeto",
        data_vencimento: dataVencimento.toISOString(),
        prioridade: "alta",
        status: "pendente",
      })
    }

    // 4. TODO: Enviar mensagem de boas-vindas (se solicitado)
    // if (data.enviar_mensagem) {
    //   await sendWelcomeMessage(leadId)
    // }

    return true
  } catch (exception) {
    console.error("Exceção ao fechar lead como ganho:", exception)
    return false
  }
}

/**
 * Fecha um lead como perdido
 */
export async function closeLeadAsLost(leadId: number, data: LeadClosureLostData, stageId?: number): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // Preparar motivo final
    const motivoFinal = data.motivo_perda === 'outro' && data.motivo_outro
      ? `outro: ${data.motivo_outro}`
      : data.motivo_perda

    // 1. Atualizar lead
    const updateData: Record<string, unknown> = {
      motivo_perda: motivoFinal,
      observacoes: data.observacoes || null,
    }
    if (stageId) updateData.stage_id = stageId

    const { error: updateError } = await supabase
      .from(TABLE_NAME)
      .update(updateData)
      .eq("id", leadId)

    if (updateError) {
      console.error("Erro ao atualizar lead como perdido:", updateError)
      return false
    }

    // 2. Criar atividade de fechamento
    await createActivity(
      leadId,
      "stage_change",
      "😔 Negócio Perdido",
      `Motivo: ${motivoFinal}${data.observacoes ? `\n\nObservações: ${data.observacoes}` : ''}`,
      {
        tipo_fechamento: "perdido",
        motivo_perda: motivoFinal,
        observacoes: data.observacoes,
      }
    )

    // 3. Criar tarefa de recontato (se solicitado)
    if (data.agendar_recontato) {
      const diasRecontato = data.dias_recontato || 90
      const dataVencimento = new Date()
      dataVencimento.setDate(dataVencimento.getDate() + diasRecontato)

      await createTask({
        lead_id: leadId,
        titulo: "Recontatar lead perdido",
        descricao: `Tentar reengajar lead que foi perdido por: ${motivoFinal}`,
        data_vencimento: dataVencimento.toISOString(),
        prioridade: "baixa",
        status: "pendente",
      })
    }

    return true
  } catch (exception) {
    console.error("Exceção ao fechar lead como perdido:", exception)
    return false
  }
}

// ==================== LEAD NOTES ====================

/**
 * Buscar notas de um lead
 */
export async function getLeadNotes(leadId: number): Promise<LeadNoteWithUser[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", leadId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar notas do lead:", error)
      return []
    }

    // Organizar notas com threading
    const notes = (data as unknown as LeadNoteWithUser[]) || []
    const notesMap = new Map<number, LeadNoteWithUser>()
    const rootNotes: LeadNoteWithUser[] = []

    // Primeiro, criar mapa de todas as notas
    notes.forEach((note) => {
      notesMap.set(note.id, { ...note, replies: [] })
    })

    // Depois, organizar hierarquia
    notes.forEach((note) => {
      const noteWithReplies = notesMap.get(note.id)!
      if (note.parent_note_id) {
        const parent = notesMap.get(note.parent_note_id)
        if (parent) {
          if (!parent.replies) parent.replies = []
          parent.replies.push(noteWithReplies)
        }
      } else {
        rootNotes.push(noteWithReplies)
      }
    })

    return rootNotes
  } catch (exception) {
    console.error("Exceção ao buscar notas do lead:", exception)
    return []
  }
}

/**
 * Criar nova nota
 */
export async function createLeadNote(input: CreateNoteInput): Promise<LeadNote | null> {
  try {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user) {
      console.error("Usuário não autenticado")
      return null
    }

    const { data, error } = await supabase
      .from("lead_notes")
      .insert([{
        lead_id: input.lead_id,
        user_id: userData.user.id,
        content: input.content,
        is_important: input.is_important || false,
        is_private: input.is_private || false,
        parent_note_id: input.parent_note_id || null,
      }])
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar nota:", error)
      return null
    }

    // Extrair e criar menções
    if (data) {
      const mentions = extractMentions(input.content)
      if (mentions.length > 0) {
        await createNoteMentions(data.id, mentions)
      }

      // Criar atividade no lead
      await createActivity(
        input.lead_id,
        "note",
        "Nova nota adicionada",
        input.content.substring(0, 100) + (input.content.length > 100 ? "..." : "")
      )
    }

    return data
  } catch (exception) {
    console.error("Exceção ao criar nota:", exception)
    return null
  }
}

/**
 * Atualizar nota existente
 */
export async function updateLeadNote(
  noteId: number,
  input: UpdateNoteInput
): Promise<LeadNote | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lead_notes")
      .update(input)
      .eq("id", noteId)
      .select()
      .single()

    if (error) {
      console.error("Erro ao atualizar nota:", error)
      return null
    }

    // Atualizar menções se o conteúdo mudou
    if (input.content && data) {
      await deleteNoteMentions(noteId)
      const mentions = extractMentions(input.content)
      if (mentions.length > 0) {
        await createNoteMentions(noteId, mentions)
      }
    }

    return data
  } catch (exception) {
    console.error("Exceção ao atualizar nota:", exception)
    return null
  }
}

/**
 * Deletar nota (soft delete)
 */
export async function deleteLeadNote(noteId: number): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from("lead_notes")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", noteId)

    if (error) {
      console.error("Erro ao deletar nota:", error)
      return false
    }

    return true
  } catch (exception) {
    console.error("Exceção ao deletar nota:", exception)
    return false
  }
}

/**
 * Extrair menções (@usuario) do texto
 */
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }

  return mentions
}

/**
 * Criar menções na tabela note_mentions
 */
async function createNoteMentions(noteId: number, usernames: string[]): Promise<void> {
  try {
    const supabase = createClient()
    
    // Buscar IDs dos usuários mencionados (por email)
    const { data: users } = await supabase
      .from("auth.users")
      .select("id")
      .in("email", usernames.map(u => `${u}@example.com`)) // Ajustar conforme necessário

    if (!users || users.length === 0) return

    const mentions = users.map(user => ({
      note_id: noteId,
      mentioned_user_id: user.id,
    }))

    await supabase.from("note_mentions").insert(mentions)
  } catch (exception) {
    console.error("Erro ao criar menções:", exception)
  }
}

/**
 * Deletar menções de uma nota
 */
async function deleteNoteMentions(noteId: number): Promise<void> {
  try {
    const supabase = createClient()
    await supabase.from("note_mentions").delete().eq("note_id", noteId)
  } catch (exception) {
    console.error("Erro ao deletar menções:", exception)
  }
}

/**
 * Buscar menções de um usuário
 */
export async function getUserMentions(userId: string): Promise<NoteMention[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("note_mentions")
      .select(`
        *,
        note:lead_notes!note_id(*)
      `)
      .eq("mentioned_user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar menções do usuário:", error)
      return []
    }

    return (data as unknown as NoteMention[]) || []
  } catch (exception) {
    console.error("Exceção ao buscar menções do usuário:", exception)
    return []
  }
}

// ==================== COURSE INTERESTS HISTORY ====================

/**
 * Buscar histórico de interesses de um lead
 */
export async function getLeadCourseInterests(leadId: number): Promise<LeadCourseInterest[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lead_course_interests")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar interesses do lead:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar interesses do lead:", exception)
    return []
  }
}

/**
 * Registrar novo interesse em curso
 */
export async function createCourseInterest(
  leadId: number,
  cursoNome: string,
  cursoId?: number,
  origem?: string,
  metadata?: Record<string, any>
): Promise<LeadCourseInterest | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lead_course_interests")
      .insert([{
        lead_id: leadId,
        curso_nome: cursoNome,
        curso_id: cursoId || null,
        origem: origem || null,
        metadata: metadata || null,
      }])
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar interesse:", error)
      return null
    }

    // Atualizar o campo produto_interesse do lead com o mais recente
    await supabase
      .from(TABLE_NAME)
      .update({ produto_interesse: cursoNome })
      .eq("id", leadId)

    // Criar atividade
    await createActivity(
      leadId,
      "note",
      "Novo interesse registrado",
      `Interesse em: ${cursoNome}`
    )

    return data
  } catch (exception) {
    console.error("Exceção ao criar interesse:", exception)
    return null
  }
}

/**
 * Buscar interesse mais recente de um lead
 */
export async function getLatestCourseInterest(leadId: number): Promise<LatestCourseInterest | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_latest_course_interest")
      .select("*")
      .eq("lead_id", leadId)
      .single()

    if (error) {
      console.error("Erro ao buscar interesse mais recente:", error)
      return null
    }

    return data
  } catch (exception) {
    console.error("Exceção ao buscar interesse mais recente:", exception)
    return null
  }
}

/**
 * Buscar todos os interesses mais recentes (para dashboard)
 */
export async function getAllLatestCourseInterests(): Promise<LatestCourseInterest[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("v_latest_course_interest")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar interesses mais recentes:", error)
      return []
    }

    return data || []
  } catch (exception) {
    console.error("Exceção ao buscar interesses mais recentes:", exception)
    return []
  }
}
