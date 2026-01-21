-- =====================================================
-- FIX: Ajustar RLS Policies para Course Interests
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON lead_course_interests;
DROP POLICY IF EXISTS "Permitir criação para usuários autenticados" ON lead_course_interests;

-- Criar políticas mais permissivas
CREATE POLICY "Enable read access for authenticated users"
  ON lead_course_interests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON lead_course_interests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verificar se a tabela existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'lead_course_interests'
  ) THEN
    RAISE NOTICE 'ATENÇÃO: Tabela lead_course_interests não existe! Execute a migration add_course_interests_history.sql primeiro.';
  ELSE
    RAISE NOTICE 'Tabela lead_course_interests existe. RLS policies atualizadas com sucesso!';
  END IF;
END $$;

-- Verificar se a view existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'v_latest_course_interest'
  ) THEN
    RAISE NOTICE 'ATENÇÃO: View v_latest_course_interest não existe!';
  ELSE
    RAISE NOTICE 'View v_latest_course_interest existe!';
  END IF;
END $$;
