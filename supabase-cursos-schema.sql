-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS cursos (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  nome TEXT NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2),
  duracao_media TEXT,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  imagem_url TEXT,
  detalhes JSONB
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON cursos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública
CREATE POLICY "Allow public read access on cursos"
  ON cursos
  FOR SELECT
  TO public
  USING (true);

-- Permitir inserção autenticada
CREATE POLICY "Allow authenticated insert on cursos"
  ON cursos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir atualização autenticada
CREATE POLICY "Allow authenticated update on cursos"
  ON cursos
  FOR UPDATE
  TO authenticated
  USING (true);

-- Permitir deleção autenticada
CREATE POLICY "Allow authenticated delete on cursos"
  ON cursos
  FOR DELETE
  TO authenticated
  USING (true);

-- Inserir alguns cursos de exemplo
INSERT INTO cursos (nome, descricao, valor, duracao_media, categoria, ativo) VALUES
  ('Curso de Marketing Digital', 'Aprenda as melhores estratégias de marketing digital para alavancar seu negócio online.', 497.00, '3 meses', 'Marketing', true),
  ('Desenvolvimento Web Completo', 'Do zero ao profissional: HTML, CSS, JavaScript, React e Node.js', 997.00, '6 meses', 'Programação', true),
  ('Excel Avançado para Negócios', 'Domine fórmulas, tabelas dinâmicas e automações no Excel', 297.00, '2 meses', 'Produtividade', true);
