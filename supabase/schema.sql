-- ============================================
-- VOLTZ - Schema PostgreSQL (Supabase)
-- Todas as tabelas e colunas em pt-BR
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: instrutores
-- ============================================
CREATE TABLE instrutores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  cnpj TEXT,
  data_nascimento DATE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT NOT NULL,
  foto_url TEXT DEFAULT '',
  registro_senatran TEXT NOT NULL,
  categorias TEXT[] NOT NULL DEFAULT '{}',
  anos_experiencia INTEGER NOT NULL DEFAULT 0,
  alunos_formados INTEGER NOT NULL DEFAULT 0,
  descricao TEXT NOT NULL DEFAULT '',
  preco_hora NUMERIC(10,2) NOT NULL DEFAULT 0,
  aceita_veiculo_candidato BOOLEAN NOT NULL DEFAULT false,
  genero TEXT NOT NULL CHECK (genero IN ('masculino', 'feminino')),
  status TEXT NOT NULL DEFAULT 'em_analise' CHECK (status IN ('em_analise', 'aprovado', 'recusado', 'suspenso')),
  motivo_recusa TEXT,
  plano TEXT NOT NULL DEFAULT 'basico' CHECK (plano IN ('basico', 'profissional', 'premium')),
  slug TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para buscas frequentes
CREATE INDEX idx_instrutores_status ON instrutores(status);
CREATE INDEX idx_instrutores_slug ON instrutores(slug);
CREATE INDEX idx_instrutores_user_id ON instrutores(user_id);
CREATE INDEX idx_instrutores_email ON instrutores(email);

-- ============================================
-- TABELA: localizacoes
-- ============================================
CREATE TABLE localizacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrutor_id UUID NOT NULL REFERENCES instrutores(id) ON DELETE CASCADE,
  cep TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  bairro TEXT NOT NULL DEFAULT '',
  lat NUMERIC(10,7) DEFAULT 0,
  lng NUMERIC(10,7) DEFAULT 0,
  raio_km INTEGER NOT NULL DEFAULT 10,
  UNIQUE(instrutor_id)
);

CREATE INDEX idx_localizacoes_cidade ON localizacoes(cidade);
CREATE INDEX idx_localizacoes_estado ON localizacoes(estado);

-- ============================================
-- TABELA: veiculos
-- ============================================
CREATE TABLE veiculos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrutor_id UUID NOT NULL REFERENCES instrutores(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  cambio TEXT NOT NULL CHECK (cambio IN ('manual', 'automatico')),
  foto_url TEXT
);

CREATE INDEX idx_veiculos_instrutor ON veiculos(instrutor_id);

-- ============================================
-- TABELA: disponibilidades
-- ============================================
CREATE TABLE disponibilidades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrutor_id UUID NOT NULL REFERENCES instrutores(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde', 'noite'))
);

CREATE INDEX idx_disponibilidades_instrutor ON disponibilidades(instrutor_id);

-- ============================================
-- TABELA: documentos
-- ============================================
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrutor_id UUID NOT NULL REFERENCES instrutores(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('certificado_senatran', 'comprovante_residencia', 'cnh', 'foto_veiculo')),
  nome_arquivo TEXT NOT NULL,
  url TEXT NOT NULL,
  enviado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documentos_instrutor ON documentos(instrutor_id);

-- ============================================
-- TABELA: avaliacoes
-- ============================================
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrutor_id UUID NOT NULL REFERENCES instrutores(id) ON DELETE CASCADE,
  nome_aluno TEXT NOT NULL,
  nota INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT NOT NULL DEFAULT '',
  resposta_instrutor TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_avaliacoes_instrutor ON avaliacoes(instrutor_id);

-- ============================================
-- TABELA: contatos
-- ============================================
CREATE TABLE contatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instrutor_id UUID NOT NULL REFERENCES instrutores(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  mensagem TEXT NOT NULL,
  lido BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contatos_instrutor ON contatos(instrutor_id);

-- ============================================
-- FUNÇÃO: atualizar timestamp
-- ============================================
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_instrutores_atualizado
  BEFORE UPDATE ON instrutores
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp();

-- ============================================
-- FUNÇÃO: verificar se usuário é admin
-- ============================================
CREATE OR REPLACE FUNCTION eh_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Instrutores
ALTER TABLE instrutores ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ver instrutores aprovados
CREATE POLICY "instrutores_ver_aprovados" ON instrutores
  FOR SELECT USING (status = 'aprovado');

-- Instrutor pode ver seu próprio perfil (qualquer status)
CREATE POLICY "instrutores_ver_proprio" ON instrutores
  FOR SELECT USING (auth.uid() = user_id);

-- Admin pode ver todos
CREATE POLICY "instrutores_admin_ver_todos" ON instrutores
  FOR SELECT USING (eh_admin());

-- Instrutor pode inserir seu próprio perfil
CREATE POLICY "instrutores_inserir_proprio" ON instrutores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Instrutor pode atualizar seu próprio perfil (campos limitados)
CREATE POLICY "instrutores_atualizar_proprio" ON instrutores
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin pode atualizar qualquer instrutor (status, motivo_recusa, etc)
CREATE POLICY "instrutores_admin_atualizar" ON instrutores
  FOR UPDATE USING (eh_admin());

-- Localizações
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "localizacoes_ver_publico" ON localizacoes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND status = 'aprovado')
    OR eh_admin()
    OR EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
  );

CREATE POLICY "localizacoes_inserir" ON localizacoes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
  );

CREATE POLICY "localizacoes_atualizar" ON localizacoes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
    OR eh_admin()
  );

-- Veículos
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "veiculos_ver_publico" ON veiculos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND status = 'aprovado')
    OR eh_admin()
    OR EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
  );

CREATE POLICY "veiculos_inserir" ON veiculos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
  );

CREATE POLICY "veiculos_atualizar" ON veiculos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
    OR eh_admin()
  );

CREATE POLICY "veiculos_deletar" ON veiculos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
    OR eh_admin()
  );

-- Disponibilidades
ALTER TABLE disponibilidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "disponibilidades_ver_publico" ON disponibilidades
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND status = 'aprovado')
    OR eh_admin()
    OR EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
  );

CREATE POLICY "disponibilidades_inserir" ON disponibilidades
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
  );

CREATE POLICY "disponibilidades_deletar" ON disponibilidades
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
    OR eh_admin()
  );

-- Documentos
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documentos_ver_proprio" ON documentos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
    OR eh_admin()
  );

CREATE POLICY "documentos_inserir" ON documentos
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
  );

-- Avaliações
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avaliacoes_ver_publico" ON avaliacoes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND status = 'aprovado')
    OR eh_admin()
    OR EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
  );

CREATE POLICY "avaliacoes_inserir" ON avaliacoes
  FOR INSERT WITH CHECK (true);

-- Contatos
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contatos_ver" ON contatos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
    OR eh_admin()
  );

CREATE POLICY "contatos_inserir" ON contatos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contatos_atualizar" ON contatos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM instrutores WHERE id = instrutor_id AND user_id = auth.uid())
    OR eh_admin()
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotos',
  'fotos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage Policies: documentos (privado - só instrutor e admin)
CREATE POLICY "documentos_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documentos'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "documentos_ver" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documentos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR eh_admin()
    )
  );

-- Storage Policies: fotos (público para leitura)
CREATE POLICY "fotos_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'fotos'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "fotos_ver" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotos');

CREATE POLICY "fotos_atualizar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'fotos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- CRIAR ADMIN INICIAL (executar após criar o user no Auth)
-- Troque 'SEU_USER_ID_AQUI' pelo ID do usuário admin
-- ============================================
-- UPDATE auth.users
-- SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@voltz.com.br';
