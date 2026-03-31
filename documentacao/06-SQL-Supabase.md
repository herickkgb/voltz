# 6. SQL para Supabase

## Schema Completo (criar tabelas)

Execute este SQL no SQL Editor do Supabase para criar todas as tabelas do zero:

```sql
-- ==========================================
-- SCHEMA COMPLETO DA VOLTZ
-- ==========================================

-- Tabela principal de instrutores (dados publicos)
CREATE TABLE IF NOT EXISTS instrutores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  foto_url TEXT DEFAULT '',
  categorias TEXT[] DEFAULT '{}',
  anos_experiencia INTEGER DEFAULT 0,
  alunos_formados INTEGER DEFAULT 0,
  descricao TEXT DEFAULT '',
  preco_hora DECIMAL(10,2) DEFAULT 0,
  aceita_veiculo_candidato BOOLEAN DEFAULT false,
  genero TEXT CHECK (genero IN ('masculino', 'feminino')) DEFAULT 'masculino',
  status TEXT CHECK (status IN ('em_analise', 'aprovado', 'recusado', 'suspenso')) DEFAULT 'em_analise',
  motivo_recusa TEXT,
  plano TEXT CHECK (plano IN ('basico', 'profissional', 'premium')) DEFAULT 'basico',
  visualizacoes INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Dados privados (LGPD) - tabela separada com RLS restritiva
CREATE TABLE IF NOT EXISTS instrutores_dados_privados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id UUID REFERENCES instrutores(id) ON DELETE CASCADE,
  cpf TEXT,
  cnpj TEXT,
  data_nascimento DATE,
  email TEXT,
  telefone TEXT,
  registro_senatran TEXT
);

-- Localizacoes
CREATE TABLE IF NOT EXISTS localizacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id UUID REFERENCES instrutores(id) ON DELETE CASCADE,
  cep TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  lat DECIMAL(10,7) DEFAULT 0,
  lng DECIMAL(10,7) DEFAULT 0,
  raio_km INTEGER DEFAULT 15
);

-- Veiculos
CREATE TABLE IF NOT EXISTS veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id UUID REFERENCES instrutores(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  ano INTEGER NOT NULL,
  cambio TEXT CHECK (cambio IN ('manual', 'automatico')) DEFAULT 'manual',
  foto_url TEXT
);

-- Disponibilidades
CREATE TABLE IF NOT EXISTS disponibilidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id UUID REFERENCES instrutores(id) ON DELETE CASCADE,
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  turno TEXT CHECK (turno IN ('manha', 'tarde', 'noite'))
);

-- Documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id UUID REFERENCES instrutores(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('certificado_senatran', 'comprovante_residencia', 'cnh', 'foto_veiculo')),
  nome_arquivo TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'aprovado', 'recusado')) DEFAULT 'pendente',
  motivo_recusa TEXT,
  enviado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Avaliacoes
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id UUID REFERENCES instrutores(id) ON DELETE CASCADE,
  nome_aluno TEXT NOT NULL,
  nota INTEGER CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT DEFAULT '',
  resposta_instrutor TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Contatos (rastreamento de cliques WhatsApp)
CREATE TABLE IF NOT EXISTS contatos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instrutor_id UUID REFERENCES instrutores(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  mensagem TEXT DEFAULT '',
  lido BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_instrutores_status ON instrutores(status);
CREATE INDEX IF NOT EXISTS idx_instrutores_slug ON instrutores(slug);
CREATE INDEX IF NOT EXISTS idx_instrutores_user_id ON instrutores(user_id);
CREATE INDEX IF NOT EXISTS idx_localizacoes_cidade ON localizacoes(cidade);
```

---

## RLS Policies

```sql
-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE instrutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE instrutores_dados_privados ENABLE ROW LEVEL SECURITY;
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;

-- INSTRUTORES: leitura publica (aprovados) + proprio perfil
CREATE POLICY "instrutores_publicos" ON instrutores FOR SELECT
  USING (status = 'aprovado' OR user_id = auth.uid());

CREATE POLICY "instrutores_insert" ON instrutores FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "instrutores_update" ON instrutores FOR UPDATE
  USING (user_id = auth.uid());

-- DADOS PRIVADOS: somente o dono
CREATE POLICY "dados_privados_select" ON instrutores_dados_privados FOR SELECT
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "dados_privados_insert" ON instrutores_dados_privados FOR INSERT
  WITH CHECK (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

-- LOCALIZACOES: publicas (de aprovados) + proprias
CREATE POLICY "loc_select" ON localizacoes FOR SELECT
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE status = 'aprovado' OR user_id = auth.uid()));

CREATE POLICY "loc_insert" ON localizacoes FOR INSERT
  WITH CHECK (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "loc_update" ON localizacoes FOR UPDATE
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

-- VEICULOS: publicos (de aprovados) + proprios
CREATE POLICY "veic_select" ON veiculos FOR SELECT
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE status = 'aprovado' OR user_id = auth.uid()));

CREATE POLICY "veic_insert" ON veiculos FOR INSERT
  WITH CHECK (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "veic_update" ON veiculos FOR UPDATE
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "veic_delete" ON veiculos FOR DELETE
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

-- DISPONIBILIDADES: publicas (de aprovados) + proprias
CREATE POLICY "disp_select" ON disponibilidades FOR SELECT
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE status = 'aprovado' OR user_id = auth.uid()));

CREATE POLICY "disp_insert" ON disponibilidades FOR INSERT
  WITH CHECK (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "disp_delete" ON disponibilidades FOR DELETE
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

-- DOCUMENTOS: somente o dono
CREATE POLICY "docs_select" ON documentos FOR SELECT
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "docs_insert" ON documentos FOR INSERT
  WITH CHECK (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "docs_update" ON documentos FOR UPDATE
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

-- AVALIACOES: publicas (de aprovados) + proprias
CREATE POLICY "aval_select" ON avaliacoes FOR SELECT
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE status = 'aprovado' OR user_id = auth.uid()));

CREATE POLICY "aval_insert" ON avaliacoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "aval_update" ON avaliacoes FOR UPDATE
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

-- CONTATOS: somente o dono + qualquer visitante pode inserir
CREATE POLICY "contatos_select" ON contatos FOR SELECT
  USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "contatos_insert" ON contatos FOR INSERT
  WITH CHECK (true);
```

---

## SQL: Inserir 20 instrutores de teste (cidades mais populosas)

```sql
-- ==========================================
-- INSTRUTORES DE TESTE - 20 CIDADES MAIS POPULOSAS DO BRASIL
-- Para testar o autocomplete, busca e perfis
-- Todos com status 'aprovado' para aparecer no site
-- ==========================================

DO $$
DECLARE
  inst_id UUID;
BEGIN

-- 1. SAO PAULO - SP
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Carlos Eduardo Santos', 'carlos-eduardo-santos-sp', '', ARRAY['A','B'], 10, 450, 'Instrutor credenciado com 10 anos de experiencia em Sao Paulo. Especialista em primeira habilitacao, com metodo paciente e didatico. Atendo na zona sul e centro.', 95, true, 'masculino', 'aprovado', 'profissional');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '11122233344', 'carlos.sp@email.com', '11999001001', 'SEN-2024-SP001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '01001-000', 'Sao Paulo', 'SP', 'Se', -23.5505, -46.6333, 20);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Volkswagen', 'Polo', 2023, 'automatico');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert_senatran.pdf', 'https://placeholder.co/cert', 'aprovado');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'cnh', 'cnh_frente_verso.pdf', 'https://placeholder.co/cnh', 'aprovado');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'comprovante_residencia', 'comprovante.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 1, 'tarde'), (inst_id, 2, 'manha'), (inst_id, 3, 'tarde'), (inst_id, 4, 'manha'), (inst_id, 5, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Maria L.', 5, 'Excelente instrutor! Passei de primeira.'), (inst_id, 'Pedro S.', 5, 'Muito paciente e didatico.'), (inst_id, 'Ana C.', 4, 'Bom instrutor, recomendo.');

-- 2. RIO DE JANEIRO - RJ
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Fernanda Oliveira Lima', 'fernanda-oliveira-lima-rj', '', ARRAY['B'], 8, 320, 'Instrutora credenciada no Rio de Janeiro. Especialista em alunos com medo de dirigir. Paciencia e seguranca sao meus diferenciais.', 85, false, 'feminino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '22233344455', 'fernanda.rj@email.com', '21999002002', 'SEN-2024-RJ001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '20040-020', 'Rio de Janeiro', 'RJ', 'Centro', -22.9068, -43.1729, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Chevrolet', 'Onix', 2022, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 2, 'tarde'), (inst_id, 3, 'manha'), (inst_id, 4, 'tarde'), (inst_id, 5, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Lucas M.', 5, 'Super atenciosa!'), (inst_id, 'Carla R.', 4, 'Muito boa, recomendo.');

-- 3. BELO HORIZONTE - MG
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Roberto Almeida Costa', 'roberto-almeida-costa-bh', '', ARRAY['B','C'], 12, 580, 'Instrutor em BH com mais de 12 anos. Dou aulas em carro manual e automatico. Regiao do Barreiro e centro.', 80, true, 'masculino', 'aprovado', 'premium');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '33344455566', 'roberto.bh@email.com', '31999003003', 'SEN-2024-MG001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '30130-000', 'Belo Horizonte', 'MG', 'Savassi', -19.9191, -43.9386, 20);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Fiat', 'Argo', 2023, 'manual'), (inst_id, 'Hyundai', 'HB20', 2022, 'automatico');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 1, 'tarde'), (inst_id, 2, 'manha'), (inst_id, 3, 'noite'), (inst_id, 4, 'manha'), (inst_id, 5, 'tarde'), (inst_id, 6, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario, resposta_instrutor) VALUES (inst_id, 'Julia A.', 5, 'Passei de primeira gracas ao Roberto!', 'Obrigado Julia! Sucesso na estrada!'), (inst_id, 'Marcos T.', 5, 'Profissional demais.'), (inst_id, 'Tatiana F.', 4, 'Muito bom, pontual e dedicado.');

-- 4. BRASILIA - DF
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Patricia Mendes Silva', 'patricia-mendes-silva-df', '', ARRAY['A','B'], 6, 180, 'Instrutora em Brasilia. Aulas no Plano Piloto e Lago Sul. Especialista em moto e carro.', 90, false, 'feminino', 'aprovado', 'profissional');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '44455566677', 'patricia.df@email.com', '61999004004', 'SEN-2024-DF001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '70040-010', 'Brasilia', 'DF', 'Asa Sul', -15.7975, -47.8919, 25);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Toyota', 'Yaris', 2023, 'automatico');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'tarde'), (inst_id, 2, 'manha'), (inst_id, 3, 'tarde'), (inst_id, 5, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Rafael B.', 5, 'Otima instrutora!'), (inst_id, 'Camila S.', 4, 'Muito boa.');

-- 5. SALVADOR - BA
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Andre Rodrigues Souza', 'andre-rodrigues-souza-ba', '', ARRAY['B'], 9, 290, 'Instrutor em Salvador. Atendo Pituba, Barra e Ondina. Carro com duplo comando e ar condicionado.', 75, true, 'masculino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '55566677788', 'andre.ba@email.com', '71999005005', 'SEN-2024-BA001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '40140-010', 'Salvador', 'BA', 'Pituba', -12.9714, -38.5124, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Renault', 'Kwid', 2023, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 2, 'tarde'), (inst_id, 4, 'manha'), (inst_id, 5, 'tarde'), (inst_id, 6, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Thiago R.', 5, 'Show de bola!'), (inst_id, 'Amanda F.', 4, 'Muito bom instrutor.');

-- 6. FORTALEZA - CE
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Luciana Barbosa Reis', 'luciana-barbosa-reis-ce', '', ARRAY['B'], 7, 210, 'Instrutora em Fortaleza com foco em seguranca e confianca. Atendo Aldeota, Meireles e Centro.', 70, false, 'feminino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '66677788899', 'luciana.ce@email.com', '85999006006', 'SEN-2024-CE001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '60110-000', 'Fortaleza', 'CE', 'Aldeota', -3.7172, -38.5433, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Fiat', 'Mobi', 2022, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 3, 'tarde'), (inst_id, 5, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Joao P.', 5, 'Muito dedicada!');

-- 7. CURITIBA - PR
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Marcos Henrique Pereira', 'marcos-henrique-pereira-pr', '', ARRAY['B','D'], 15, 720, 'Instrutor veterano em Curitiba. Categorias B e D. Veiculo proprio com duplo comando.', 100, false, 'masculino', 'aprovado', 'premium');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '77788899900', 'marcos.pr@email.com', '41999007007', 'SEN-2024-PR001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '80010-000', 'Curitiba', 'PR', 'Centro', -25.4284, -49.2733, 20);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Chevrolet', 'Tracker', 2023, 'automatico');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 1, 'tarde'), (inst_id, 2, 'manha'), (inst_id, 3, 'tarde'), (inst_id, 4, 'manha'), (inst_id, 5, 'tarde'), (inst_id, 6, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Gabriel V.', 5, 'Melhor instrutor de Curitiba!'), (inst_id, 'Isabela N.', 5, 'Excelente!'), (inst_id, 'Ricardo F.', 4, 'Muito bom.');

-- 8. RECIFE - PE
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Aline Souza Ferreira', 'aline-souza-ferreira-pe', '', ARRAY['B'], 5, 140, 'Instrutora em Recife. Atendo Boa Viagem, Pina e Imbiribeira. Foco em primeira habilitacao.', 65, true, 'feminino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '88899900011', 'aline.pe@email.com', '81999008008', 'SEN-2024-PE001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '51020-010', 'Recife', 'PE', 'Boa Viagem', -8.0476, -34.8770, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Volkswagen', 'Gol', 2021, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'tarde'), (inst_id, 3, 'manha'), (inst_id, 5, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Felipe G.', 4, 'Boa instrutora, recomendo.');

-- 9. PORTO ALEGRE - RS
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Ricardo Nascimento Borges', 'ricardo-nascimento-borges-rs', '', ARRAY['A','B','C'], 14, 650, 'Instrutor em Porto Alegre. Categorias A, B e C. Experiencia com caminhoes e motos tambem.', 90, true, 'masculino', 'aprovado', 'profissional');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '99900011122', 'ricardo.rs@email.com', '51999009009', 'SEN-2024-RS001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '90010-000', 'Porto Alegre', 'RS', 'Centro Historico', -30.0346, -51.2177, 20);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Fiat', 'Cronos', 2023, 'automatico'), (inst_id, 'Honda', 'CG 160', 2022, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 2, 'tarde'), (inst_id, 3, 'manha'), (inst_id, 4, 'tarde'), (inst_id, 5, 'manha'), (inst_id, 6, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Bruna L.', 5, 'Excelente profissional!'), (inst_id, 'Diego M.', 5, 'Muito seguro e experiente.');

-- 10. GOIANIA - GO
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Joao Victor Mendes', 'joao-victor-mendes-go', '', ARRAY['B'], 4, 95, 'Instrutor em Goiania. Atendo Setor Bueno, Marista e Jardim Goias. Carro confortavel com ar.', 70, false, 'masculino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '10011122233', 'joao.go@email.com', '62999010010', 'SEN-2024-GO001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '74015-010', 'Goiania', 'GO', 'Setor Bueno', -16.6869, -49.2648, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Hyundai', 'HB20', 2023, 'automatico');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 3, 'tarde'), (inst_id, 5, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Leticia P.', 4, 'Bom instrutor.');

-- 11. MANAUS - AM
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Thiago Ribeiro Souza', 'thiago-ribeiro-souza-am', '', ARRAY['B'], 6, 170, 'Instrutor em Manaus. Atendo Centro, Adrianopolis e Aleixo. Paciencia e dedicacao.', 65, true, 'masculino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '11122233355', 'thiago.am@email.com', '92999011011', 'SEN-2024-AM001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '69005-000', 'Manaus', 'AM', 'Centro', -3.1190, -60.0217, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Fiat', 'Uno', 2021, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 2, 'tarde'), (inst_id, 4, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Priscila A.', 5, 'Otimo!');

-- 12. BELEM - PA
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Carla Monteiro Silva', 'carla-monteiro-silva-pa', '', ARRAY['B'], 5, 130, 'Instrutora em Belem. Atendo Nazare, Umarizal e Batista Campos.', 60, false, 'feminino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '22233344466', 'carla.pa@email.com', '91999012012', 'SEN-2024-PA001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '66017-000', 'Belem', 'PA', 'Nazare', -1.4558, -48.5024, 12);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Chevrolet', 'Joy', 2022, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 2, 'manha'), (inst_id, 4, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Eduardo S.', 4, 'Boa instrutora.');

-- 13. GUARULHOS - SP
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Leonardo Martins Dias', 'leonardo-martins-dias-guarulhos', '', ARRAY['B'], 7, 230, 'Instrutor em Guarulhos. Centro e Ponte Grande. Carro com duplo comando.', 75, true, 'masculino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '33344455577', 'leonardo.gru@email.com', '11999013013', 'SEN-2024-SP002');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '07010-000', 'Guarulhos', 'SP', 'Centro', -23.4628, -46.5333, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Volkswagen', 'Voyage', 2022, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'tarde'), (inst_id, 3, 'manha'), (inst_id, 5, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Vanessa K.', 5, 'Super recomendo!');

-- 14. CAMPINAS - SP
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Daniela Prado Santos', 'daniela-prado-santos-campinas', '', ARRAY['A','B'], 8, 260, 'Instrutora em Campinas. Moto e carro. Cambui e Barao Geraldo.', 85, false, 'feminino', 'aprovado', 'profissional');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '44455566688', 'daniela.camp@email.com', '19999014014', 'SEN-2024-SP003');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '13010-000', 'Campinas', 'SP', 'Cambui', -22.9099, -47.0626, 18);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Nissan', 'Kicks', 2023, 'automatico');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 2, 'tarde'), (inst_id, 4, 'manha'), (inst_id, 5, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Rodrigo C.', 5, 'Perfeita!'), (inst_id, 'Marina B.', 4, 'Muito boa.');

-- 15. SAO LUIS - MA
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Paulo Henrique Araujo', 'paulo-henrique-araujo-ma', '', ARRAY['B'], 6, 160, 'Instrutor em Sao Luis. Renascenca e Calhau. Atendo com carro proprio.', 60, false, 'masculino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '55566677799', 'paulo.ma@email.com', '98999015015', 'SEN-2024-MA001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '65020-000', 'Sao Luis', 'MA', 'Renascenca', -2.5297, -44.2825, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Fiat', 'Argo', 2022, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 3, 'tarde'), (inst_id, 5, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Fernanda T.', 4, 'Bom instrutor.');

-- 16. MACEIO - AL
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Juliana Costa Melo', 'juliana-costa-melo-al', '', ARRAY['B'], 4, 100, 'Instrutora em Maceio. Pajucara, Ponta Verde e Jatiuca. Aulas com calma e seguranca.', 60, true, 'feminino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '66677788800', 'juliana.al@email.com', '82999016016', 'SEN-2024-AL001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '57030-000', 'Maceio', 'AL', 'Pajucara', -9.6658, -35.7353, 12);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Chevrolet', 'Onix', 2022, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 2, 'manha'), (inst_id, 4, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Bruno S.', 5, 'Otima!');

-- 17. NATAL - RN
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Henrique Gomes Santos', 'henrique-gomes-santos-rn', '', ARRAY['B'], 5, 120, 'Instrutor em Natal. Ponta Negra, Tirol e Petropolis. Aulas flexiveis.', 65, false, 'masculino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '77788899911', 'henrique.rn@email.com', '84999017017', 'SEN-2024-RN001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '59020-000', 'Natal', 'RN', 'Ponta Negra', -5.7945, -35.2110, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Renault', 'Logan', 2022, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'tarde'), (inst_id, 3, 'manha'), (inst_id, 5, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Camila R.', 4, 'Bom instrutor.');

-- 18. CAMPO GRANDE - MS
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Renata Ferreira Lima', 'renata-ferreira-lima-ms', '', ARRAY['B'], 6, 180, 'Instrutora em Campo Grande. Centro e Monte Castelo. Carro automatico disponivel.', 70, true, 'feminino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '88899900022', 'renata.ms@email.com', '67999018018', 'SEN-2024-MS001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '79002-000', 'Campo Grande', 'MS', 'Centro', -20.4697, -54.6201, 18);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Toyota', 'Etios', 2022, 'automatico');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 2, 'tarde'), (inst_id, 4, 'manha'), (inst_id, 5, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Gustavo N.', 5, 'Excelente instrutora!');

-- 19. TERESINA - PI
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Diego Oliveira Nascimento', 'diego-oliveira-nascimento-pi', '', ARRAY['B'], 3, 70, 'Instrutor em Teresina. Centro e Zona Leste. Primeira habilitacao com paciencia.', 55, false, 'masculino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '99900011133', 'diego.pi@email.com', '86999019019', 'SEN-2024-PI001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '64000-000', 'Teresina', 'PI', 'Centro', -5.0892, -42.8019, 15);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Fiat', 'Mobi', 2021, 'manual');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'manha'), (inst_id, 3, 'tarde');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Larissa M.', 4, 'Bom instrutor, atencioso.');

-- 20. JOAO PESSOA - PB
inst_id := gen_random_uuid();
INSERT INTO instrutores (id, nome, slug, foto_url, categorias, anos_experiencia, alunos_formados, descricao, preco_hora, aceita_veiculo_candidato, genero, status, plano)
VALUES (inst_id, 'Amanda Freitas Costa', 'amanda-freitas-costa-pb', '', ARRAY['B'], 4, 110, 'Instrutora em Joao Pessoa. Manaira, Tambau e Bessa. Carro com duplo comando e ar.', 65, true, 'feminino', 'aprovado', 'basico');
INSERT INTO instrutores_dados_privados (instrutor_id, cpf, email, telefone, registro_senatran) VALUES (inst_id, '10011122244', 'amanda.pb@email.com', '83999020020', 'SEN-2024-PB001');
INSERT INTO localizacoes (instrutor_id, cep, cidade, estado, bairro, lat, lng, raio_km) VALUES (inst_id, '58013-000', 'Joao Pessoa', 'PB', 'Manaira', -7.1195, -34.8450, 12);
INSERT INTO veiculos (instrutor_id, marca, modelo, ano, cambio) VALUES (inst_id, 'Volkswagen', 'Polo', 2022, 'automatico');
INSERT INTO documentos (instrutor_id, tipo, nome_arquivo, url, status) VALUES (inst_id, 'certificado_senatran', 'cert.pdf', 'https://placeholder.co/cert', 'aprovado'), (inst_id, 'cnh', 'cnh.pdf', 'https://placeholder.co/cnh', 'aprovado'), (inst_id, 'comprovante_residencia', 'comp.pdf', 'https://placeholder.co/comp', 'aprovado');
INSERT INTO disponibilidades (instrutor_id, dia_semana, turno) VALUES (inst_id, 1, 'tarde'), (inst_id, 2, 'manha'), (inst_id, 4, 'tarde'), (inst_id, 5, 'manha');
INSERT INTO avaliacoes (instrutor_id, nome_aluno, nota, comentario) VALUES (inst_id, 'Victor H.', 5, 'Melhor instrutora da cidade!'), (inst_id, 'Paula G.', 5, 'Muito paciente e profissional.');

END $$;
```

---

## SQL: Apagar todos os instrutores de teste

```sql
-- ==========================================
-- APAGAR TODOS OS INSTRUTORES DE TESTE
-- Isso remove TUDO (instrutores + dados relacionados via CASCADE)
-- CUIDADO: tambem apaga instrutores reais!
-- ==========================================

-- Apagar apenas os de teste (sem user_id, pois foram inseridos direto no SQL)
DELETE FROM instrutores WHERE user_id IS NULL;

-- OU se quiser apagar ABSOLUTAMENTE TUDO:
-- DELETE FROM instrutores;
```

**Nota:** Como as tabelas relacionadas tem `ON DELETE CASCADE`, ao deletar um instrutor, todos os seus dados (localizacao, veiculos, documentos, avaliacoes, disponibilidades, contatos, dados privados) sao removidos automaticamente.
