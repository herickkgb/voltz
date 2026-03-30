# 5. Guia para Novos Desenvolvedores (Onboarding & Roadmap)

Acabou de clonar a aplicação e caiu de paraquedas para compilar e ajudar a evoluir a **Voltz**? Siga exatamente o pipeline abaixo para garantir o setup local idêntico a master e logo abaixo você verá o mapa para qual destino a aplicação ruma tecnicamente.

## ⚙️ Setup de Configuração Rápida
Abaixo está o manual para ligar a turbina local da base.
1. **Node**: Verifique se você porta versão 18+ ativa rodando `node -v`
2. **Pacotes Cruciais**: Rodar e baixar as packages. (`npm i`)
3. **Crenciais Sensíveis**: Criar o `.env.local` e colar cravado as portas vitais:
```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
4. **Acendendo a Tocha**: Rodar `npm run dev`. Abra maravilhosamente a porta visual em `http://localhost:3000`.

## 🚢 Regras Máximas para Depoly (Vercel)
A **Prudência Máxima** diz:
Nunca realize commit sem rodar o teste sagrado local de typescript: `npx tsc --noEmit`. Se o Type Script gritar vermelho para qualquer Type/Interface frouxa na modificação que o time mexeu, a **VERCEL vai abortar no ar e travar a release**, atrasando clientes operacionais.

## 🚀 ROADMAP DAS PRÓXIMAS ATUALIZAÇÕES (2.0)
Nossa meta de escala técnica prevê 3 macros atualizações imediatas a curto prazo visando a escalabilidade.

### [Prioridade A] Monetização: Checkouts do Stripe API.
**Ação Técnica:** Onde o instrutor vê planos (Básico vs Premium) ativaremos via botões de redirect nativos passando a carga pro backend gerenciado do "Stripe Payment Links".
Precisaremos escutar os webhooks criptografados do Stripe disparando a alteração global de percussão onde `{ status ='paid' }` manda um update automático rodando pela API Edge em `instrutores` cravando a chave `plano` como `premium`. 

### [Prioridade B] Sistema Unificado de Notificadora Push/Email.
**Ação Técnica:** É tedioso para o admin ligar pro instrutor avisando de recusa de fotos ou homologação positiva.
Vamos integrar no Supabase a plataforma Edge Resend Emails. Na aba de Triggers (SQL), inserimos uma trigger que vigia: Sempre que as chaves `status` do Documento trocarem para Aprovado -> Dispara Webhook c/ body params ao Edge. O Email entra pronto na inbox do sujeito.

### [Prioridade C] Indexamento Total do Google Auto-Generate.
**Ação Técnica:** Nossa função `getSlugsAprovados()` será acoplada no core da pasta raiz dentro do `sitemap.ts` oficial do Next. O site inteiro fará scan em madrugadas frias lendo os novos instrutores autônomos recém cadastrados que a diretoria liberou e produzirá a file xml. Jogando pra cima do google a autoridade do instrutor em todas as cidades do mapa indexado sem marketing pago.
