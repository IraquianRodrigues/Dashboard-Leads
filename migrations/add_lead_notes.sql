-- =====================================================
-- MIGRATION: Sistema de Notas e Comentários para Leads
-- =====================================================

-- Criar tabela de notas
CREATE TABLE IF NOT EXISTS lead_notes (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  parent_note_id INTEGER REFERENCES lead_notes(id) ON DELETE CASCADE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índices para performance
CREATE INDEX idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX idx_lead_notes_user_id ON lead_notes(user_id);
CREATE INDEX idx_lead_notes_parent_note_id ON lead_notes(parent_note_id);
CREATE INDEX idx_lead_notes_created_at ON lead_notes(created_at DESC);
CREATE INDEX idx_lead_notes_deleted_at ON lead_notes(deleted_at) WHERE deleted_at IS NULL;

-- Criar tabela de menções
CREATE TABLE IF NOT EXISTS note_mentions (
  id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL REFERENCES lead_notes(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(note_id, mentioned_user_id)
);

-- Criar índice para menções
CREATE INDEX idx_note_mentions_mentioned_user_id ON note_mentions(mentioned_user_id);
CREATE INDEX idx_note_mentions_note_id ON note_mentions(note_id);

-- Habilitar Row Level Security
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_mentions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para lead_notes

-- Política de leitura: usuários autenticados podem ler notas não-privadas ou suas próprias notas privadas
CREATE POLICY "Permitir leitura de notas públicas ou próprias privadas"
  ON lead_notes FOR SELECT
  USING (
    auth.role() = 'authenticated' AND (
      is_private = false OR 
      user_id = auth.uid()
    ) AND
    deleted_at IS NULL
  );

-- Política de criação: usuários autenticados podem criar notas
CREATE POLICY "Permitir criação de notas para usuários autenticados"
  ON lead_notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Política de atualização: apenas o autor pode atualizar suas notas
CREATE POLICY "Permitir atualização apenas do autor"
  ON lead_notes FOR UPDATE
  USING (auth.role() = 'authenticated' AND user_id = auth.uid())
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Política de exclusão: apenas o autor pode deletar suas notas
CREATE POLICY "Permitir exclusão apenas do autor"
  ON lead_notes FOR DELETE
  USING (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Políticas RLS para note_mentions

-- Política de leitura: usuários autenticados podem ler menções
CREATE POLICY "Permitir leitura de menções para usuários autenticados"
  ON note_mentions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política de criação: usuários autenticados podem criar menções
CREATE POLICY "Permitir criação de menções para usuários autenticados"
  ON note_mentions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política de exclusão: apenas quem criou a nota pode deletar menções
CREATE POLICY "Permitir exclusão de menções do autor da nota"
  ON note_mentions FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM lead_notes 
      WHERE lead_notes.id = note_mentions.note_id 
      AND lead_notes.user_id = auth.uid()
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_lead_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_lead_notes_updated_at
  BEFORE UPDATE ON lead_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_notes_updated_at();

-- Comentários nas tabelas
COMMENT ON TABLE lead_notes IS 'Notas e comentários associados aos leads';
COMMENT ON COLUMN lead_notes.is_important IS 'Marca a nota como importante/destacada';
COMMENT ON COLUMN lead_notes.is_private IS 'Nota privada visível apenas para o autor';
COMMENT ON COLUMN lead_notes.parent_note_id IS 'ID da nota pai para threading/respostas';
COMMENT ON COLUMN lead_notes.deleted_at IS 'Soft delete - timestamp de exclusão';

COMMENT ON TABLE note_mentions IS 'Menções de usuários em notas (@usuario)';
