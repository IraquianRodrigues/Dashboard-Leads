import type { Cliente } from "@/lib/types"

const CSV_HEADERS: Record<string, string> = {
  nome: "Nome",
  telefone: "Telefone",
  empresa: "Empresa",
  cargo: "Cargo",
  produto_interesse: "Produto de Interesse",
  interessado: "Interessado",
  trava: "Status",
  follow_up: "Follow Ups",
  followup_status: "Status Follow Up",
  created_at: "Data Criação",
  origem: "Origem",
  utm_source: "UTM Source",
  utm_medium: "UTM Medium",
  utm_campaign: "UTM Campaign",
  utm_content: "UTM Content",
  utm_term: "UTM Term",
  valor_potencial: "Valor Potencial",
  score: "Score",
}

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return ""

  switch (key) {
    case "interessado":
      return value ? "Sim" : "Não"
    case "trava":
      return value ? "Pausado" : "Ativo"
    case "created_at":
      return new Date(String(value)).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    case "valor_potencial":
      return typeof value === "number"
        ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : ""
    default:
      return String(value)
  }
}

function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function exportLeadsToCsv(leads: Cliente[], filename?: string) {
  const keys = Object.keys(CSV_HEADERS) as Array<keyof typeof CSV_HEADERS>
  const headers = keys.map((key) => CSV_HEADERS[key])

  const rows = leads.map((lead) =>
    keys.map((key) => {
      const value = lead[key as keyof Cliente]
      return escapeCsvField(formatValue(key, value))
    })
  )

  const BOM = "\uFEFF"
  const csvContent = BOM + [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const dateStr = new Date().toISOString().slice(0, 10)
  const finalFilename = filename || `leads-export-${dateStr}.csv`

  const link = document.createElement("a")
  link.href = url
  link.download = finalFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
