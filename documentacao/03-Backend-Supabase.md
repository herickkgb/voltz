# 3. Backend — Supabase, Banco de Dados e Storage

## Visao Geral

O backend inteiro roda no **Supabase** (PostgreSQL gerenciado). Nao existe servidor Node.js/Express. O frontend acessa o banco diretamente via `@supabase/supabase-js` e a seguranca e feita por **RLS (Row Level Security)**.

**Configuracao:** `src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Schema do Banco de Dados

### Tabela: `instrutores` (principal)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | uuid (PK) | ID unico |
| `user_id` | uuid (FK → auth.users) | Vinculo com conta Supabase Auth |
| `nome` | text | Nome completo |
| `slug` | text (unique) | URL amigavel (ex: joao-silva-abc123) |
| `foto_url` | text | URL publica da foto de perfil |
| `categorias` | text[] | Array de categorias (A, B, C, D, E) |
| `anos_experiencia` | integer | Anos de experiencia |
| `alunos_formados` | integer | Numero de alunos formados |
| `descricao` | text | Descricao do perfil |
| `preco_hora` | decimal | Valor por hora/aula |
| `aceita_veiculo_candidato` | boolean | Se aceita carro do aluno |
| `genero` | text | masculino / feminino |
| `status` | text | em_analise / aprovado / recusado / suspenso |
| `motivo_recusa` | text (nullable) | Motivo se recusado |
| `plano` | text | basico / profissional / premium |
| `visualizacoes` | integer | Contador de views do perfil |
| `criado_em` | timestamptz | Data de criacao |

### Tabela: `instrutores_dados_privados` (LGPD)

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | uuid (PK) | |
| `instrutor_id` | uuid (FK) | |
| `cpf` | text | CPF (apenas numeros) |
| `cnpj` | text (nullable) | CNPJ se pessoa juridica |
| `data_nascimento` | date | |
| `email` | text | |
| `telefone` | text | |
| `registro_senatran` | text | Numero de registro SENATRAN |

**RLS:** Somente o proprio instrutor (via `auth.uid()`) e admins podem ler esta tabela.

### Tabela: `localizacoes`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | uuid (PK) | |
| `instrutor_id` | uuid (FK) | |
| `cep` | text | |
| `cidade` | text | |
| `estado` | text | UF (2 letras) |
| `bairro` | text | |
| `lat` | decimal | Latitude |
| `lng` | decimal | Longitude |
| `raio_km` | integer | Raio de atendimento em km |

### Tabela: `veiculos`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | uuid (PK) | |
| `instrutor_id` | uuid (FK) | |
| `marca` | text | Ex: Volkswagen |
| `modelo` | text | Ex: Gol |
| `ano` | integer | |
| `cambio` | text | manual / automatico |
| `foto_url` | text (nullable) | |

### Tabela: `disponibilidades`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | uuid (PK) | |
| `instrutor_id` | uuid (FK) | |
| `dia_semana` | integer | 0=Domingo, 1=Segunda, ..., 6=Sabado |
| `turno` | text | manha / tarde / noite |

### Tabela: `documentos`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | uuid (PK) | |
| `instrutor_id` | uuid (FK) | |
| `tipo` | text | certificado_senatran / comprovante_residencia / cnh / foto_veiculo |
| `nome_arquivo` | text | Nome original do arquivo |
| `url` | text | URL assinada do Supabase Storage |
| `status` | text | pendente / aprovado / recusado |
| `motivo_recusa` | text (nullable) | Motivo se recusado |
| `enviado_em` | timestamptz | Data de upload |

### Tabela: `avaliacoes`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | uuid (PK) | |
| `instrutor_id` | uuid (FK) | |
| `nome_aluno` | text | Nome de quem avaliou |
| `nota` | integer | 1 a 5 |
| `comentario` | text | |
| `resposta_instrutor` | text (nullable) | Resposta do instrutor |
| `criado_em` | timestamptz | |

### Tabela: `contatos`

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `id` | uuid (PK) | |
| `instrutor_id` | uuid (FK) | |
| `nome` | text | Nome do contato |
| `telefone` | text | |
| `email` | text (nullable) | |
| `mensagem` | text | |
| `lido` | boolean | Se o instrutor leu |
| `criado_em` | timestamptz | |

---

## Diagrama de Relacionamentos

```
instrutores (1) ──── (1) instrutores_dados_privados
     |
     ├── (1:N) localizacoes
     ├── (1:N) veiculos
     ├── (1:N) disponibilidades
     ├── (1:N) documentos
     ├── (1:N) avaliacoes
     └── (1:N) contatos
```

---

## Query Principal: `INSTRUTOR_SELECT`

Toda consulta de instrutor usa essa string de select para trazer tudo junto (evitar N+1):

```sql
SELECT *,
  instrutores_dados_privados(*),
  localizacoes(*),
  veiculos(*),
  disponibilidades(*),
  avaliacoes(*),
  documentos(*),
  contatos(*)
FROM instrutores
```

O mapeamento dos dados e feito por `mapInstrutorFromDB()` em `src/lib/db.ts`.

---

## Funcoes do `db.ts`

### Consultas Publicas

| Funcao | Descricao |
|--------|-----------|
| `getInstrutoresAprovados()` | Todos instrutores com status=aprovado |
| `getInstrutorPorSlug(slug)` | Instrutor por slug (perfil publico) |
| `buscarInstrutores(filtros)` | Busca com filtros (cidade, categoria, preco, etc) |
| `getEstatisticasGlobais()` | Contadores: total instrutores, alunos, media, cidades com contagem |

### Consultas do Instrutor

| Funcao | Descricao |
|--------|-----------|
| `getInstrutorPorUserId(userId)` | Perfil do instrutor logado |
| `atualizarPerfilInstrutor(id, dados)` | Editar perfil |
| `atualizarLocalizacao(instrutorId, dados)` | Editar localizacao |
| `atualizarFotoPerfil(id, url)` | Atualizar foto |
| `atualizarDisponibilidades(id, disps)` | Substituir disponibilidades |
| `criarDocumento(instrutorId, dados)` | Upload novo documento (status: pendente) |
| `atualizarDocumento(docId, dados)` | Trocar documento (status volta: pendente) |
| `solicitarNovaAnalise(id)` | Voltar status para em_analise |

### Consultas do Admin

| Funcao | Descricao |
|--------|-----------|
| `getTodosInstrutores()` | Todos instrutores (qualquer status) |
| `atualizarStatusInstrutor(id, status, motivo?)` | Aprovar/recusar instrutor |
| `atualizarStatusDocumento(docId, status, motivo?)` | Aprovar/recusar documento individual |

### Cadastro

| Funcao | Descricao |
|--------|-----------|
| `criarInstrutor(userId, dados)` | Inserir novo instrutor |
| `criarLocalizacao(instrutorId, dados)` | Inserir localizacao |
| `criarVeiculo(instrutorId, dados)` | Inserir veiculo |
| `criarDocumento(instrutorId, dados)` | Inserir documento |

---

## Storage (Buckets)

### Bucket `fotos` (PUBLICO)

- Fotos de perfil dos instrutores
- Acesso: publico via URL direta
- Upload: `uploadFoto(userId, arquivo)` → retorna URL publica
- Path: `{userId}/perfil_{timestamp}.{ext}`

### Bucket `documentos` (PRIVADO)

- CNH, certificados SENATRAN, comprovantes
- Acesso: via URL assinada (signed URL, expira em 1 ano para o instrutor, 1 hora para admin)
- Upload: `uploadDocumento(userId, arquivo, tipo)` → retorna URL assinada + nome
- Path: `{userId}/{tipo}_{timestamp}.{ext}`

---

## RLS (Row Level Security) — Policies Necessarias

### Leitura publica (visitantes)

```sql
-- Instrutores aprovados sao publicos
CREATE POLICY "instrutores_publicos" ON instrutores
  FOR SELECT USING (status = 'aprovado');

-- Tabelas relacionadas de instrutores aprovados
CREATE POLICY "loc_publicas" ON localizacoes
  FOR SELECT USING (instrutor_id IN (SELECT id FROM instrutores WHERE status = 'aprovado'));

-- Repetir para: veiculos, avaliacoes, disponibilidades
```

### Leitura propria (instrutor logado)

```sql
-- Instrutor pode ver seu proprio perfil (qualquer status)
CREATE POLICY "instrutor_proprio" ON instrutores
  FOR SELECT USING (user_id = auth.uid());

-- Dados privados so acessiveis pelo dono
CREATE POLICY "dados_privados_dono" ON instrutores_dados_privados
  FOR SELECT USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

-- Documentos so visiveis pelo dono
CREATE POLICY "docs_dono" ON documentos
  FOR SELECT USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));
```

### Escrita (instrutor)

```sql
-- Instrutor pode editar seu perfil
CREATE POLICY "instrutor_update" ON instrutores
  FOR UPDATE USING (user_id = auth.uid());

-- Instrutor pode inserir/atualizar seus documentos
CREATE POLICY "docs_insert" ON documentos
  FOR INSERT WITH CHECK (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));

CREATE POLICY "docs_update" ON documentos
  FOR UPDATE USING (instrutor_id IN (SELECT id FROM instrutores WHERE user_id = auth.uid()));
```

### Admin

O admin deve ter uma policy separada ou usar a `service_role` key no backend (Edge Functions).

---

## Variaveis de Ambiente

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**IMPORTANTE:** Nunca use a `service_role` key no frontend. Ela da acesso total ao banco sem RLS.
