-- =====================================================
-- MIGRATION: Lead Closure Enhancement
-- Adiciona campos para gestão de fechamento de leads
-- =====================================================

-- Adicionar novos campos à tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS motivo_perda TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS valor_fechado DECIMAL(10,2);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS data_inicio_contrato TIMESTAMP WITH TIME ZONE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS duracao_contrato_meses INTEGER;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS is_cliente_ativo BOOLEAN DEFAULT false;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clientes_is_cliente_ativo ON clientes(is_cliente_ativo);
CREATE INDEX IF NOT EXISTS idx_clientes_data_conversao ON clientes(data_conversao);
CREATE INDEX IF NOT EXISTS idx_clientes_motivo_perda ON clientes(motivo_perda) WHERE motivo_perda IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN clientes.motivo_perda IS 'Motivo da perda do lead (quando fechado como perdido)';
COMMENT ON COLUMN clientes.valor_fechado IS 'Valor real do contrato fechado';
COMMENT ON COLUMN clientes.data_inicio_contrato IS 'Data de início do contrato';
COMMENT ON COLUMN clientes.duracao_contrato_meses IS 'Duração do contrato em meses';
COMMENT ON COLUMN clientes.is_cliente_ativo IS 'Flag indicando se é um cliente ativo (lead convertido)';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Migration: Lead Closure Enhancement aplicada com sucesso!';
  RAISE NOTICE '📊 Novos campos: motivo_perda, valor_fechado, data_inicio_contrato, duracao_contrato_meses, is_cliente_ativo';
  RAISE NOTICE '🔍 Índices criados para performance';
END $$;
