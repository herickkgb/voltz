-- 05-Estatisticas-e-Analytics.sql
-- Este script adiciona as colunas de rastreamento avançado (Data do Último Login e Cliques no Botão de WhatsApp)

-- 1. Cria ou adiciona as colunas na tabela dos instrutores
ALTER TABLE instrutores
ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_clicks INTEGER DEFAULT 0;

-- 2. Cria a função que faz a somatória de cliques funcionar com eficiência lá no frontend
-- O "SECURITY DEFINER" permite que mesmo visitantes sem autenticação consigam registrar que clicaram no botão
CREATE OR REPLACE FUNCTION incrementar_whatsapp(p_instrutor_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE instrutores
  SET whatsapp_clicks = COALESCE(whatsapp_clicks, 0) + 1
  WHERE id = p_instrutor_id;
END;
$$;
