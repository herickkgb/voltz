-- ====================================================================================
-- SCRIPT DE ATUALIZAÇÃO: SISTEMA DE ASSINATURAS E CÓDIGOS DE ATIVAÇÃO
-- ====================================================================================
-- RODE ESTE SCRIPT NO SQL EDITOR DO SUPABASE PARA PREPARAR O BANCO DE DADOS
-- ====================================================================================

-- 1. ADICIONAR COLUNA EM INSTRUTORES
-- Adiciona a coluna que vai controlar até que dia o perfil do instrutor está ativo nas buscas públicas.
ALTER TABLE public.instrutores 
ADD COLUMN IF NOT EXISTS plano_expira_em TIMESTAMPTZ;

-- ====================================================================================

-- 2. CRIAR TABELA DE CÓDIGOS DE ATIVAÇÃO (VOUCHERS)
-- Essa tabela armazena os códigos gerados pelo admin (ex: VOLTZ-30D-XYZ)
CREATE TABLE IF NOT EXISTS public.codigos_ativacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    dias_validade INTEGER NOT NULL DEFAULT 30,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    usado_em TIMESTAMPTZ,
    instrutor_id UUID REFERENCES public.instrutores(id) ON DELETE SET NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    criado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ====================================================================================

-- 3. POLÍTICAS DE SEGURANÇA (RLS) PARA A TABELA DE CÓDIGOS
ALTER TABLE public.codigos_ativacao ENABLE ROW LEVEL SECURITY;

-- ADMIN pode ver, criar, alterar e deletar todos os códigos
CREATE POLICY "Admins_tem_acesso_total_codigos" ON public.codigos_ativacao
    FOR ALL
    USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR auth.jwt() ->> 'email' = 'admin@buscarinstrutor.com.br' )
    WITH CHECK ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR auth.jwt() ->> 'email' = 'admin@buscarinstrutor.com.br' );

-- INSTRUTOR (qualquer usuário logado) pode VER o código para tentar resgatar.
CREATE POLICY "Usuarios_podem_consultar_codigos" ON public.codigos_ativacao
    FOR SELECT
    USING ( auth.uid() IS NOT NULL );

-- INSTRUTOR pode atualizar o código (apenas marcando como usado)
-- (A lógica de segurança de uso duplo está no backend DB.ts, mas deixamos o update liberado para donos de sessão validos)
CREATE POLICY "Instrutores_podem_atualizar_codigo" ON public.codigos_ativacao
    FOR UPDATE
    USING ( auth.uid() IS NOT NULL )
    WITH CHECK ( auth.uid() IS NOT NULL );

-- ====================================================================================

-- 4. ATUALIZAR INSTRUTORES EXISTENTES (MIGRATION DE EMERGÊNCIA)
-- Como a implementação é nova, todos os instrutores atualmente já aprovados
-- na plataforma devem ganhar 30 dias de bônus automático para não sumirem hoje!
UPDATE public.instrutores
SET plano_expira_em = NOW() + INTERVAL '30 days'
WHERE status = 'aprovado' AND plano_expira_em IS NULL;
