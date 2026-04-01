# Sistema de Assinaturas e Códigos de Ativação

## Visão Geral

Este documento descreve a regra de negócios e o funcionamento técnico do sistema de monetização da plataforma Buscar Instrutor, com base em controle manual via códigos de ativação (vouchers) e datas de expiração no perfil do instrutor.

Esta estratégia foi adotada para garantir controle financeiro total ao dono da plataforma (sem dependência técnica inicial de gateways de pagamento como pagar.me ou Stripe) e garantir maior alavancagem de renovação ("urgência") sem precisar expulsar o instrutor do painel.

## Regras de Negócio

1. **Expiração (`plano_expira_em`)**: 
   Todo instrutor "Aprovado" possui agora um tempo de acesso. A coluna `plano_expira_em` diz exatamente até que dia e hora o instrutor está apto a aparecer nas buscas.
2. **Preservação de Painel**:
   Mesmo com o plano vencido, um instrutor NUNCA perde o acesso ao painel de administração dele. Ele ainda pode:
   - Fazer login.
   - Ver estatísticas de perfil, views e mensagens de alunos antigos.
   - Entrar em contato com o suporte para assinar o plano novamente.
3. **Punição Pública Oculta**:
   Apesar dele conseguir acessar seu painel local (Dashboard), um instrutor cujo `plano_expira_em` é MENOR que o dia de hoje **não será retornado em NENHUMA busca pública de alunos**. Na prática, para o aluno, o perfil desse instrutor não existe.
4. **Gerenciamento Flexível (Admin)**:
   A renovação pode se dar de duas formas pelo Painel Admin:
   - **Gerar e Usar Código**: O admin gera um código único de XX dias e fornece ao instrutor, ou digita ele no painel do instrutor.
   - **Adição Manual Direta**: O admin entra na tela do instrutor e seleciona "Adicionar +30 dias" diretamente no botão sem precisar de fato gerar um código.
   
## Como Funciona no Banco de Dados

A segurança de exibição só retorna ativos baseia-se puramente em Backend (`Supabase`).
O arquivo `src/lib/db.ts` nas suas funções públicas (`getInstrutoresAprovados` e `buscarInstrutores`) possui obrigatoriamente a regra:

```typescript
  let query = supabase!
    .from('instrutores')
    .select(INSTRUTOR_SELECT)
    .eq('status', 'aprovado')
    .gte('plano_expira_em', new Date().toISOString())
```

### Tabelas Alteradas
- **`instrutores`**: Ganhou a coluna `plano_expira_em (TIMESTAMPTZ)`. O status permanece "aprovado" (para permitir que ele continue acessando o painel de instrutor, ao contrário de "suspenso" ou "recusado").

### Novas Tabelas
- **`codigos_ativacao`**:
  Armazena chaves únicas, expiração garantida do voucher (ex `30`, `90` ou `365` dias), flag de `usado` e um link forte para qual `instrutor_id` resgatou essa chave, além da trava natural de SQL (RLS e Uniquiness) para estorvar fraudes de reutilização.

## Uso do Código (Workflow de Front-end)

1. Instrutor clica no Botão de "WhatsApp" na aba de Planos.
2. Ele envia o comprovante PIX pela conversa no WhatsApp da Plataforma.
3. Equipe recebe e entra no Painel de Admin da Buscar Instrutor.
4. O Admin acessa o perfil do instrutor e pode gerar/aplicar um código ou apenas clicar em "Mudar Vencimento Manualmente / Renovar +30 dias".
5. O Supabase calcula a nova data somando os 30 dias na data de validade que ele JÁ TINHA (caso ele tivesse renovado antes de vencer) ou a partir do HOJE se ele estivesse já vencido.
6. Assim que a data ultrapassar a data atual, do segundo em diante, ele volta a indexar no catálogo aberto público.
