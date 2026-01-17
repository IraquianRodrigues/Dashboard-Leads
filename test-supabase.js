// Teste de Conexão Supabase
// Execute este arquivo para testar a conexão diretamente

import { createClient } from './lib/supabase'

async function testConnection() {
  console.log("=".repeat(60))
  console.log("🧪 TESTE DE CONEXÃO SUPABASE")
  console.log("=".repeat(60))
  
  // Verificar variáveis de ambiente
  console.log("\n1️⃣ Verificando variáveis de ambiente:")
  console.log("   NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Definida" : "❌ Não definida")
  console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Definida" : "❌ Não definida")
  console.log("   NEXT_PUBLIC_TABLE_NAME:", process.env.NEXT_PUBLIC_TABLE_NAME || "❌ Não definida")
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("\n❌ Variáveis de ambiente não configuradas!")
    return
  }
  
  try {
    console.log("\n2️⃣ Criando cliente Supabase...")
    const supabase = createClient()
    console.log("   ✅ Cliente criado com sucesso")
    
    console.log("\n3️⃣ Testando conexão básica...")
    const { data: healthCheck, error: healthError } = await supabase
      .from('clientes')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.error("   ❌ Erro na conexão:")
      console.error("      Mensagem:", healthError.message)
      console.error("      Código:", healthError.code)
      console.error("      Detalhes:", healthError.details)
      console.error("      Hint:", healthError.hint)
    } else {
      console.log("   ✅ Conexão estabelecida")
    }
    
    console.log("\n4️⃣ Buscando dados da tabela 'clientes'...")
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error("   ❌ Erro ao buscar dados:")
      console.error("      Mensagem:", error.message || "Nenhuma")
      console.error("      Código:", error.code || "Nenhum")
      console.error("      Detalhes:", error.details || "Nenhum")
      console.error("      Hint:", error.hint || "Nenhuma")
      console.error("\n   📋 Erro completo:", JSON.stringify(error, null, 2))
      
      // Diagnósticos específicos
      if (!error.message && !error.code) {
        console.error("\n   ⚠️ DIAGNÓSTICO: Erro vazio detectado!")
        console.error("      Possíveis causas:")
        console.error("      1. Row Level Security (RLS) está bloqueando o acesso")
        console.error("      2. Problema de rede ou CORS")
        console.error("      3. URL do Supabase incorreta")
      }
      
      if (error.code === "42501" || error.message?.includes("permission denied")) {
        console.error("\n   ⚠️ DIAGNÓSTICO: Problema de permissão (RLS)")
        console.error("      Solução: Desabilite RLS ou crie uma política de leitura pública")
      }
    } else {
      console.log("   ✅ Dados recuperados com sucesso!")
      console.log("   📊 Total de registros:", data?.length || 0)
      if (data && data.length > 0) {
        console.log("   📝 Primeiro registro:", JSON.stringify(data[0], null, 2))
      }
    }
    
  } catch (exception) {
    console.error("\n❌ EXCEÇÃO CAPTURADA:")
    console.error(exception)
  }
  
  console.log("\n" + "=".repeat(60))
}

testConnection()
