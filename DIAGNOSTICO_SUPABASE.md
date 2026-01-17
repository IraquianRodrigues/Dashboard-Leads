# Guia de Diagnóstico - Conexão Supabase

## Problema Atual

O erro `"Erro ao buscar clientes: {}"` indica que o Supabase está retornando um objeto de erro vazio, o que geralmente acontece quando:

1. **Row Level Security (RLS)** está bloqueando o acesso
2. Há um problema de CORS ou rede
3. A URL do Supabase está incorreta

## Passo 1: Verificar RLS no Supabase

### Como verificar:

1. Abra o **Supabase Dashboard**
2. Vá para **Table Editor** → **clientes**
3. Clique no ícone de **cadeado** 🔒 ao lado do nome da tabela
4. Verifique se **"Enable RLS"** está marcado

### Soluções:

**Opção A: Desabilitar RLS (apenas para teste)**

- Desmarque "Enable RLS"
- Recarregue a página do dashboard
- Se funcionar, o problema é RLS

**Opção B: Criar política de leitura pública**

```sql
-- Execute no SQL Editor do Supabase
CREATE POLICY "Allow public read access"
ON clientes
FOR SELECT
TO public
USING (true);
```

## Passo 2: Verificar no Console do Navegador

1. Abra o dashboard em `http://localhost:3001`
2. Pressione **F12** para abrir o DevTools
3. Vá para a aba **Console**
4. Procure por:
   ```
   ==================================================
   🔍 DIAGNÓSTICO SUPABASE - getClientes()
   ==================================================
   ```

### O que verificar:

- ✅ As três variáveis devem mostrar "✅ Definida"
- ❌ Se mostrar "❌ UNDEFINED", reinicie o servidor (`npm run dev`)
- 📋 Anote qualquer mensagem de erro que aparecer

## Passo 3: Verificar Estrutura da Tabela

Certifique-se de que a tabela `clientes` tem as seguintes colunas:

- `id` (int8, primary key)
- `created_at` (timestamp)
- `nome` (text)
- `telefone` (text)
- `trava` (boolean)
- `follow_up` (int4)
- `interessado` (boolean)
- `last_followup` (timestamp)
- `produto_interesse` (text)
- `followup_status` (text)

## Próximos Passos

Após verificar o RLS:

1. Se desabilitou RLS e funcionou → Criar políticas adequadas
2. Se ainda não funciona → Verificar logs do console
3. Se os logs mostram erro vazio → Problema pode ser de rede/CORS
