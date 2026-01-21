-- =====================================================
-- MIGRATION: Histórico de Interesses em Cursos
-- =====================================================

-- Criar tabela de histórico de interesses
CREATE TABLE IF NOT EXISTS lead_course_interests (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  curso_nome TEXT NOT NULL,
  curso_id INTEGER REFERENCES cursos(id) ON DELETE SET NULL,
  origem TEXT, -- De onde veio o interesse (whatsapp, site, etc)
  metadata JSONB, -- Dados adicionais
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices
CREATE INDEX idx_lead_course_interests_lead_id ON lead_course_interests(lead_id);
CREATE INDEX idx_lead_course_interests_curso_id ON lead_course_interests(curso_id);
CREATE INDEX idx_lead_course_interests_created_at ON lead_course_interests(created_at DESC);

-- Habilitar RLS
ALTER TABLE lead_course_interests ENABLE ROW LEVEL SECURITY;

-- Política de leitura
CREATE POLICY "Permitir leitura para usuários autenticados"
  ON lead_course_interests FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política de criação
CREATE POLICY "Permitir criação para usuários autenticados"
  ON lead_course_interests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Comentários
COMMENT ON TABLE lead_course_interests IS 'Histórico de interesses em cursos por lead';
COMMENT ON COLUMN lead_course_interests.origem IS 'Origem do interesse (whatsapp, site, formulário, etc)';
COMMENT ON COLUMN lead_course_interests.metadata IS 'Dados adicionais em formato JSON';

-- View para pegar o interesse mais recente de cada lead
CREATE OR REPLACE VIEW v_latest_course_interest AS
SELECT DISTINCT ON (lead_id)
  lead_id,
  curso_nome,
  curso_id,
  origem,
  created_at
FROM lead_course_interests
ORDER BY lead_id, created_at DESC;

COMMENT ON VIEW v_latest_course_interest IS 'Interesse mais recente de cada lead';
