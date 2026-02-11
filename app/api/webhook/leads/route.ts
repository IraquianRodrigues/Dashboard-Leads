import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const WEBHOOK_SECRET = process.env.WEBHOOK_API_KEY || ""
const TABLE_NAME = process.env.NEXT_PUBLIC_TABLE_NAME || "clientes"

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Supabase admin credentials not configured")
  }

  return createClient(url, serviceKey)
}

interface WebhookPayload {
  // Generic / Direct
  nome?: string
  name?: string
  telefone?: string
  phone?: string
  email?: string
  empresa?: string
  company?: string
  cargo?: string
  position?: string
  produto_interesse?: string
  product?: string
  observacoes?: string
  notes?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  origem?: string
  source?: string
  valor_potencial?: number
  value?: number
  // Kommo specific
  leads?: {
    add?: Array<{
      name?: string
      custom_fields_values?: Array<{
        field_name: string
        values: Array<{ value: string }>
      }>
    }>
  }
  // GHL specific
  contact?: {
    name?: string
    phone?: string
    email?: string
    company_name?: string
    tags?: string[]
    custom_field?: Record<string, string>
    source?: string
  }
}

function extractFromKommo(payload: WebhookPayload) {
  const lead = payload.leads?.add?.[0]
  if (!lead) return null

  const getField = (name: string) => {
    const field = lead.custom_fields_values?.find(
      (f) => f.field_name.toLowerCase() === name.toLowerCase()
    )
    return field?.values?.[0]?.value || null
  }

  return {
    nome: lead.name || null,
    telefone: getField("telefone") || getField("phone") || null,
    empresa: getField("empresa") || getField("company") || null,
    cargo: getField("cargo") || getField("position") || null,
    produto_interesse: getField("produto") || getField("product") || null,
    observacoes: null,
    utm_source: getField("utm_source") || "kommo",
    utm_medium: getField("utm_medium") || null,
    utm_campaign: getField("utm_campaign") || null,
    utm_content: getField("utm_content") || null,
    utm_term: getField("utm_term") || null,
    origem: "kommo",
    valor_potencial: null,
  }
}

function extractFromGHL(payload: WebhookPayload) {
  const contact = payload.contact
  if (!contact) return null

  return {
    nome: contact.name || null,
    telefone: contact.phone || null,
    empresa: contact.company_name || null,
    cargo: contact.custom_field?.position || null,
    produto_interesse: contact.custom_field?.product || null,
    observacoes: contact.tags?.join(", ") || null,
    utm_source: contact.custom_field?.utm_source || contact.source || "ghl",
    utm_medium: contact.custom_field?.utm_medium || null,
    utm_campaign: contact.custom_field?.utm_campaign || null,
    utm_content: contact.custom_field?.utm_content || null,
    utm_term: contact.custom_field?.utm_term || null,
    origem: "ghl",
    valor_potencial: null,
  }
}

function extractGeneric(payload: WebhookPayload) {
  return {
    nome: payload.nome || payload.name || null,
    telefone: payload.telefone || payload.phone || null,
    empresa: payload.empresa || payload.company || null,
    cargo: payload.cargo || payload.position || null,
    produto_interesse: payload.produto_interesse || payload.product || null,
    observacoes: payload.observacoes || payload.notes || null,
    utm_source: payload.utm_source || payload.origem || payload.source || null,
    utm_medium: payload.utm_medium || null,
    utm_campaign: payload.utm_campaign || null,
    utm_content: payload.utm_content || null,
    utm_term: payload.utm_term || null,
    origem: payload.origem || payload.source || "webhook",
    valor_potencial: payload.valor_potencial || payload.value || null,
  }
}

function detectAndExtract(payload: WebhookPayload) {
  if (payload.leads?.add) return { format: "kommo", data: extractFromKommo(payload) }
  if (payload.contact) return { format: "ghl", data: extractFromGHL(payload) }
  return { format: "generic", data: extractGeneric(payload) }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "")

    if (WEBHOOK_SECRET && apiKey !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized", message: "API key inválida ou ausente" },
        { status: 401 }
      )
    }

    const body = await request.json() as WebhookPayload
    const { format, data } = detectAndExtract(body)

    if (!data) {
      return NextResponse.json(
        { error: "Bad Request", message: "Payload não reconhecido" },
        { status: 400 }
      )
    }

    if (!data.nome && !data.telefone) {
      return NextResponse.json(
        { error: "Bad Request", message: "Nome ou telefone são obrigatórios" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const leadData = {
      ...data,
      trava: false,
      follow_up: 0,
      interessado: false,
      followup_status: "pendente",
    }

    const { data: created, error } = await supabase
      .from(TABLE_NAME)
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error("Erro ao inserir lead via webhook:", error)
      return NextResponse.json(
        { error: "Internal Error", message: "Falha ao salvar lead" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        format,
        lead: { id: created.id, nome: created.nome },
        message: `Lead criado via ${format}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Internal Error", message: "Erro ao processar webhook" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhook/leads",
    methods: ["POST"],
    formats: ["generic", "kommo", "ghl"],
    auth: WEBHOOK_SECRET ? "api-key" : "none",
    docs: {
      headers: { "x-api-key": "sua-chave-api" },
      generic: {
        nome: "string",
        telefone: "string",
        empresa: "string (optional)",
        utm_source: "string (optional)",
        utm_medium: "string (optional)",
        utm_campaign: "string (optional)",
      },
      kommo: "Auto-detected: payload.leads.add[0]",
      ghl: "Auto-detected: payload.contact",
    },
  })
}
