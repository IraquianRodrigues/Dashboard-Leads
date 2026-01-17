# 🚀 Instalação Rápida - CRM Schema

## ⚠️ IMPORTANTE

O script SQL agora cria a tabela `clientes` do ZERO. Se você já tem dados na tabela `Clientes` (com C maiúsculo), você tem duas opções:

### Opção 1: Migrar dados existentes (RECOMENDADO se tem dados)

```sql
-- 1. Primeiro, execute o script completo crm-complete-schema.sql
-- 2. Depois, migre os dados da tabela antiga para a nova:

INSERT INTO clientes (nome, telefone, trava, follow_up, interessado, last_followup, produto_interesse, followup_status, created_at)
SELECT nome, telefone, trava, follow_up, interessado, last_followup, produto_interesse, followup_status, created_at
FROM "Clientes";

-- 3. Opcional: Deletar tabela antiga
DROP TABLE "Clientes";
```

### Opção 2: Começar do zero (se NÃO tem dados importantes)

Simplesmente execute o script `crm-complete-schema.sql` completo no SQL Editor.

---

## 📋 Passo a Passo

### 1. Acessar Supabase

1. Vá para [https://supabase.com](https://supabase.com)
2. Faça login
3. Selecione seu projeto

### 2. Executar Script SQL

1. Clique em **SQL Editor** no menu lateral
2. Clique em **New Query**
3. Copie TODO o conteúdo do arquivo `crm-complete-schema.sql`
4. Cole no editor
5. Clique em **Run** (ou `Ctrl+Enter`)

### 3. Verificar Criação

Vá em **Table Editor** e verifique se estas tabelas foram criadas:

- ✅ `clientes` (nova, minúsculo)
- ✅ `pipeline_stages` (7 estágios padrão)
- ✅ `lead_activities`
- ✅ `tasks`
- ✅ `tags` (5 tags padrão)
- ✅ `lead_tags`
- ✅ `message_templates` (4 templates padrão)
- ✅ `automations`
- ✅ `automation_logs`

### 4. Reiniciar Servidor

No terminal do projeto:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## ✅ Checklist

- [ ] Script SQL executado sem erros
- [ ] 9 tabelas criadas
- [ ] Dados padrão inseridos (stages, tags, templates)
- [ ] Arquivo `.env.local` atualizado (`NEXT_PUBLIC_TABLE_NAME=clientes`)
- [ ] Servidor reiniciado
- [ ] Dashboard abre sem erros

---

## 🐛 Problemas Comuns

**Erro: "relation already exists"**

- Solução: Algumas tabelas já existem. Tudo bem, o script usa `CREATE TABLE IF NOT EXISTS`

**Erro: "permission denied"**

- Solução: Verifique se você está logado como owner do projeto

**Tabela Clientes antiga ainda aparece**

- Solução: Normal. Você pode manter as duas ou deletar a antiga após migrar os dados

---

## 🎯 Próximo Passo

Após executar o script com sucesso, me avise para eu continuar criando os componentes visuais do CRM! 🚀
