-- =====================================================
-- CRM PROFISSIONAL - SCHEMA COMPLETO
-- Dashboard Leads Transformation
-- =====================================================

-- =====================================================
-- 1. CRIAR TABELA CLIENTES (LEADS)
-- =====================================================

-- Criar tabela clientes se não existir
CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  nome TEXT,
  telefone TEXT,
  trava BOOLEAN DEFAULT false,
  follow_up INTEGER DEFAULT 0,
  interessado BOOLEAN DEFAULT false,
  last_followup TIMESTAMP WITH TIME ZONE,
  produto_interesse TEXT,
  followup_status TEXT DEFAULT 'pendente',
  -- Novos campos CRM
  avatar_url TEXT,
  empresa TEXT,
  cargo TEXT,
  origem TEXT DEFAULT 'whatsapp',
  valor_potencial DECIMAL(10,2),
  probabilidade INTEGER DEFAULT 50,
  data_conversao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  ultima_interacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stage_id INTEGER,
  score INTEGER DEFAULT 0
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_origem ON clientes(origem);
CREATE INDEX IF NOT EXISTS idx_clientes_stage ON clientes(stage_id);
CREATE INDEX IF NOT EXISTS idx_clientes_ultima_interacao ON clientes(ultima_interacao DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON clientes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_interessado ON clientes(interessado);

-- Habilitar RLS na tabela clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON clientes;
CREATE POLICY "Permitir leitura para usuários autenticados" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON clientes;
CREATE POLICY "Permitir atualização para usuários autenticados" ON clientes
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON clientes;
CREATE POLICY "Permitir inserção para usuários autenticados" ON clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 2. PIPELINE STAGES (ESTÁGIOS DO FUNIL)
-- =====================================================

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  cor TEXT DEFAULT '#00ff88',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir estágios padrão
INSERT INTO pipeline_stages (nome, descricao, ordem, cor) VALUES
  ('Novo Lead', 'Lead recém-cadastrado, aguardando primeiro contato', 1, '#00ff88'),
  ('Contato Inicial', 'Primeiro contato realizado, aguardando resposta', 2, '#3b82f6'),
  ('Qualificação', 'Lead qualificado, demonstrou interesse', 3, '#8b5cf6'),
  ('Proposta', 'Proposta enviada, em análise pelo cliente', 4, '#f59e0b'),
  ('Negociação', 'Em negociação de valores e condições', 5, '#ec4899'),
  ('Fechado - Ganho', 'Negócio fechado com sucesso', 6, '#10b981'),
  ('Fechado - Perdido', 'Negócio perdido', 7, '#ef4444')
ON CONFLICT DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_ordem ON pipeline_stages(ordem);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_ativo ON pipeline_stages(ativo);

-- =====================================================
-- 3. ATIVIDADES/HISTÓRICO
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'call', 'email', 'note', 'meeting', 'whatsapp', 'stage_change', 'task_completed'
  titulo TEXT NOT NULL,
  descricao TEXT,
  metadata JSONB, -- Dados adicionais flexíveis
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_tipo ON lead_activities(tipo);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_activities_user_id ON lead_activities(user_id);

-- =====================================================
-- 4. TAREFAS
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_vencimento TIMESTAMP WITH TIME ZONE,
  prioridade TEXT DEFAULT 'media', -- 'baixa', 'media', 'alta'
  status TEXT DEFAULT 'pendente', -- 'pendente', 'em_andamento', 'concluida', 'cancelada'
  assignee_id UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_prioridade ON tasks(prioridade);
CREATE INDEX IF NOT EXISTS idx_tasks_data_vencimento ON tasks(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);

-- =====================================================
-- 5. TAGS
-- =====================================================

CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  cor TEXT DEFAULT '#00ff88',
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir tags padrão
INSERT INTO tags (nome, cor, descricao) VALUES
  ('Alta Prioridade', '#ef4444', 'Lead de alta prioridade'),
  ('Tech Industry', '#3b82f6', 'Setor de tecnologia'),
  ('Referral', '#10b981', 'Indicação de cliente'),
  ('Decision Maker', '#f59e0b', 'Tomador de decisão'),
  ('Hot Lead', '#ec4899', 'Lead quente, pronto para fechar')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. RELACIONAMENTO LEAD-TAGS (MANY-TO-MANY)
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_tags (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lead_id, tag_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lead_tags_lead_id ON lead_tags(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_tags_tag_id ON lead_tags(tag_id);

-- =====================================================
-- 7. TEMPLATES DE MENSAGENS
-- =====================================================

CREATE TABLE IF NOT EXISTS message_templates (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  tipo TEXT DEFAULT 'whatsapp', -- 'whatsapp', 'email', 'sms'
  categoria TEXT, -- 'boas_vindas', 'follow_up', 'proposta', 'agradecimento'
  variaveis TEXT[], -- Array de variáveis disponíveis: ['nome', 'empresa', 'produto']
  ativo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir templates padrão
INSERT INTO message_templates (nome, conteudo, tipo, categoria, variaveis) VALUES
  ('Boas-vindas', 'Olá {nome}! 👋 Obrigado por entrar em contato. Como posso ajudá-lo hoje?', 'whatsapp', 'boas_vindas', ARRAY['nome']),
  ('Follow-up 1', 'Oi {nome}, tudo bem? Gostaria de saber se teve a chance de avaliar nossa proposta sobre {produto}?', 'whatsapp', 'follow_up', ARRAY['nome', 'produto']),
  ('Proposta Enviada', 'Olá {nome}! Acabei de enviar a proposta para {empresa}. Fico à disposição para esclarecer qualquer dúvida! 📄', 'whatsapp', 'proposta', ARRAY['nome', 'empresa']),
  ('Agradecimento', 'Muito obrigado pela confiança, {nome}! Estamos muito felizes em ter {empresa} como cliente! 🎉', 'whatsapp', 'agradecimento', ARRAY['nome', 'empresa'])
ON CONFLICT DO NOTHING;

-- Índices
CREATE INDEX IF NOT EXISTS idx_message_templates_tipo ON message_templates(tipo);
CREATE INDEX IF NOT EXISTS idx_message_templates_categoria ON message_templates(categoria);
CREATE INDEX IF NOT EXISTS idx_message_templates_ativo ON message_templates(ativo);

-- =====================================================
-- 8. AUTOMAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS automations (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  trigger_tipo TEXT NOT NULL, -- 'novo_lead', 'mudanca_estagio', 'sem_interacao', 'tarefa_vencida', 'data_especifica'
  trigger_config JSONB, -- Configuração do trigger (ex: dias sem interação, estágio específico)
  acao_tipo TEXT NOT NULL, -- 'enviar_mensagem', 'criar_tarefa', 'mudar_estagio', 'adicionar_tag', 'notificacao'
  acao_config JSONB, -- Configuração da ação (ex: template_id, novo_estagio_id)
  ativo BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_automations_trigger_tipo ON automations(trigger_tipo);
CREATE INDEX IF NOT EXISTS idx_automations_ativo ON automations(ativo);

-- =====================================================
-- 9. LOGS DE AUTOMAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS automation_logs (
  id SERIAL PRIMARY KEY,
  automation_id INTEGER REFERENCES automations(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'sucesso', 'erro', 'pendente'
  mensagem TEXT,
  metadata JSONB,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_automation_logs_automation_id ON automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_lead_id ON automation_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_executed_at ON automation_logs(executed_at DESC);

-- =====================================================
-- 10. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_pipeline_stages_updated_at ON pipeline_stages;
CREATE TRIGGER update_pipeline_stages_updated_at
  BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_message_templates_updated_at ON message_templates;
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_automations_updated_at ON automations;
CREATE TRIGGER update_automations_updated_at
  BEFORE UPDATE ON automations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar ultima_interacao do lead
CREATE OR REPLACE FUNCTION update_lead_ultima_interacao()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clientes
  SET ultima_interacao = NOW()
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar ultima_interacao quando atividade é criada
DROP TRIGGER IF EXISTS update_lead_ultima_interacao_on_activity ON lead_activities;
CREATE TRIGGER update_lead_ultima_interacao_on_activity
  AFTER INSERT ON lead_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_ultima_interacao();

-- Função para registrar mudança de estágio
CREATE OR REPLACE FUNCTION log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO lead_activities (lead_id, tipo, titulo, descricao, metadata)
    VALUES (
      NEW.id,
      'stage_change',
      'Mudança de Estágio',
      'Lead movido para novo estágio',
      jsonb_build_object(
        'old_stage_id', OLD.stage_id,
        'new_stage_id', NEW.stage_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar mudança de estágio
DROP TRIGGER IF EXISTS log_stage_change_trigger ON clientes;
CREATE TRIGGER log_stage_change_trigger
  AFTER UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION log_stage_change();

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para pipeline_stages
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON pipeline_stages;
CREATE POLICY "Permitir leitura para usuários autenticados" ON pipeline_stages
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON pipeline_stages;
CREATE POLICY "Permitir inserção para usuários autenticados" ON pipeline_stages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON pipeline_stages;
CREATE POLICY "Permitir atualização para usuários autenticados" ON pipeline_stages
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para lead_activities
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON lead_activities;
CREATE POLICY "Permitir leitura para usuários autenticados" ON lead_activities
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON lead_activities;
CREATE POLICY "Permitir inserção para usuários autenticados" ON lead_activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para tasks
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON tasks;
CREATE POLICY "Permitir leitura para usuários autenticados" ON tasks
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON tasks;
CREATE POLICY "Permitir inserção para usuários autenticados" ON tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON tasks;
CREATE POLICY "Permitir atualização para usuários autenticados" ON tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON tasks;
CREATE POLICY "Permitir exclusão para usuários autenticados" ON tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para tags
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON tags;
CREATE POLICY "Permitir leitura para usuários autenticados" ON tags
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON tags;
CREATE POLICY "Permitir inserção para usuários autenticados" ON tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON tags;
CREATE POLICY "Permitir atualização para usuários autenticados" ON tags
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para lead_tags
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON lead_tags;
CREATE POLICY "Permitir leitura para usuários autenticados" ON lead_tags
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON lead_tags;
CREATE POLICY "Permitir inserção para usuários autenticados" ON lead_tags
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON lead_tags;
CREATE POLICY "Permitir exclusão para usuários autenticados" ON lead_tags
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para message_templates
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON message_templates;
CREATE POLICY "Permitir leitura para usuários autenticados" ON message_templates
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON message_templates;
CREATE POLICY "Permitir inserção para usuários autenticados" ON message_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON message_templates;
CREATE POLICY "Permitir atualização para usuários autenticados" ON message_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para automations
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON automations;
CREATE POLICY "Permitir leitura para usuários autenticados" ON automations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON automations;
CREATE POLICY "Permitir inserção para usuários autenticados" ON automations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON automations;
CREATE POLICY "Permitir atualização para usuários autenticados" ON automations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para automation_logs
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON automation_logs;
CREATE POLICY "Permitir leitura para usuários autenticados" ON automation_logs
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON automation_logs;
CREATE POLICY "Permitir inserção para usuários autenticados" ON automation_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 12. VIEWS PARA ANALYTICS
-- =====================================================

-- View: Leads por estágio
CREATE OR REPLACE VIEW v_leads_por_estagio AS
SELECT 
  ps.id as stage_id,
  ps.nome as stage_nome,
  ps.ordem,
  COUNT(c.id) as total_leads,
  COALESCE(SUM(c.valor_potencial), 0) as valor_total,
  ROUND(AVG(c.probabilidade), 2) as probabilidade_media
FROM pipeline_stages ps
LEFT JOIN clientes c ON c.stage_id = ps.id
WHERE ps.ativo = true
GROUP BY ps.id, ps.nome, ps.ordem
ORDER BY ps.ordem;

-- View: Atividades recentes
CREATE OR REPLACE VIEW v_atividades_recentes AS
SELECT 
  la.id,
  la.lead_id,
  c.nome as lead_nome,
  la.tipo,
  la.titulo,
  la.descricao,
  la.created_at
FROM lead_activities la
JOIN clientes c ON c.id = la.lead_id
ORDER BY la.created_at DESC
LIMIT 50;

-- View: Tarefas pendentes
CREATE OR REPLACE VIEW v_tarefas_pendentes AS
SELECT 
  t.id,
  t.titulo,
  t.descricao,
  t.data_vencimento,
  t.prioridade,
  t.lead_id,
  c.nome as lead_nome,
  CASE 
    WHEN t.data_vencimento < NOW() THEN 'vencida'
    WHEN t.data_vencimento < NOW() + INTERVAL '1 day' THEN 'urgente'
    ELSE 'normal'
  END as urgencia
FROM tasks t
LEFT JOIN clientes c ON c.id = t.lead_id
WHERE t.status = 'pendente'
ORDER BY t.data_vencimento ASC;

-- =====================================================
-- 13. FUNÇÕES DE ANALYTICS
-- =====================================================

-- Função: Calcular taxa de conversão
CREATE OR REPLACE FUNCTION calcular_taxa_conversao()
RETURNS TABLE (
  total_leads BIGINT,
  leads_convertidos BIGINT,
  taxa_conversao NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_leads,
    COUNT(*) FILTER (WHERE data_conversao IS NOT NULL)::BIGINT as leads_convertidos,
    ROUND(
      (COUNT(*) FILTER (WHERE data_conversao IS NOT NULL)::NUMERIC / 
       NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
      2
    ) as taxa_conversao
  FROM clientes;
END;
$$ LANGUAGE plpgsql;

-- Função: Obter métricas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_metrics(periodo_dias INTEGER DEFAULT 30)
RETURNS TABLE (
  total_leads BIGINT,
  leads_novos BIGINT,
  leads_interessados BIGINT,
  conversas_travadas BIGINT,
  taxa_conversao NUMERIC,
  valor_pipeline NUMERIC,
  tarefas_pendentes BIGINT,
  tarefas_vencidas BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_leads,
    COUNT(*) FILTER (WHERE created_at >= NOW() - (periodo_dias || ' days')::INTERVAL)::BIGINT as leads_novos,
    COUNT(*) FILTER (WHERE interessado = true)::BIGINT as leads_interessados,
    COUNT(*) FILTER (WHERE trava = true)::BIGINT as conversas_travadas,
    ROUND(
      (COUNT(*) FILTER (WHERE interessado = true)::NUMERIC / 
       NULLIF(COUNT(*)::NUMERIC, 0)) * 100, 
      2
    ) as taxa_conversao,
    COALESCE(SUM(valor_potencial), 0) as valor_pipeline,
    (SELECT COUNT(*) FROM tasks WHERE status = 'pendente')::BIGINT as tarefas_pendentes,
    (SELECT COUNT(*) FROM tasks WHERE status = 'pendente' AND data_vencimento < NOW())::BIGINT as tarefas_vencidas
  FROM clientes;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Schema CRM Profissional criado com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas: clientes, pipeline_stages, lead_activities, tasks, tags, lead_tags, message_templates, automations, automation_logs';
  RAISE NOTICE '🔧 Funções e triggers configurados';
  RAISE NOTICE '🔒 Row Level Security habilitado';
  RAISE NOTICE '📈 Views de analytics criadas';
  RAISE NOTICE '🚀 Sistema pronto para uso!';
END $$;
