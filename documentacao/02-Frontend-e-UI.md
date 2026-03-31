# 2. Frontend, Rotas e Componentes

## Rotas do Aplicativo

### Paginas Publicas (sem login)

| Rota | Arquivo Page | Componente | Descricao |
|------|-------------|-----------|-----------|
| `/` | `app/(home)/page.tsx` | `HomePage.tsx` | Landing page com hero, autocomplete de cidades, instrutores destaque, FAQ |
| `/buscar` | `app/buscar/page.tsx` | `BuscarPage.tsx` | Busca com filtros (cidade, categoria, preco, avaliacao, genero) |
| `/instrutor/[slug]` | `app/instrutor/[slug]/page.tsx` | `InstrutorPage.tsx` | Perfil publico do instrutor |
| `/nova-lei` | `app/nova-lei/page.tsx` | Server Component | Informacoes sobre a Lei 14.723/2024 com link oficial Planalto |
| `/sobre` | `app/sobre/page.tsx` | Server Component | Sobre a Voltz, missao, verificacao |
| `/lgpd` | `app/lgpd/page.tsx` | Server Component | Pagina LGPD completa |
| `/termos-de-uso` | `app/termos-de-uso/page.tsx` | Server Component | Termos de uso |
| `/politica-de-privacidade` | `app/politica-de-privacidade/page.tsx` | Server Component | Politica de privacidade |
| `/politica-de-utilizacao` | `app/politica-de-utilizacao/page.tsx` | Server Component | Politica de utilizacao |
| `/avaliar/[token]` | `app/avaliar/[token]/page.tsx` | `AvaliarInstrutorPage.tsx` | Formulario de avaliacao via link |

### Paginas Protegidas (com login)

| Rota | Componente | Role | Descricao |
|------|-----------|------|-----------|
| `/login` | `LoginPage.tsx` | — | Tela de login |
| `/seja-instrutor` | `SejaInstrutorPage.tsx` | — | Cadastro em 6 etapas |
| `/painel` | `PainelInstrutorPage.tsx` | instrutor | Painel do instrutor |
| `/admin` | `AdminPage.tsx` | admin | Painel administrativo |

---

## Componentes Principais

### Layout

**`Navbar.tsx`**
- Menu responsivo com drawer mobile (hamburger)
- Links condicionais baseados no role do usuario (isAdmin, isInstrutor)
- Botao "Sair" com logout async
- Altura: `h-14` mobile, `h-16` desktop
- Drawer mobile fora do `<nav>` para evitar problemas de z-index com `backdrop-blur`

**`Footer.tsx`**
- 3 colunas: Plataforma (links internos), Legal (termos, LGPD), Contato (email, telefone, FAQ)
- Texto legal: "Voltz nao e uma autoescola"

### Shared

**`WhatsAppButton.tsx`**
- Duas variantes: `desktop` (botao completo no card) e `mobile` (FAB flutuante)
- Mobile: botao circular verde fixo em `bottom-5 right-5 z-50`
- Registra contato no banco ao clicar (rastreamento)
- Abre `wa.me/{telefone}` com mensagem pre-formatada

**`StarRating.tsx`**
- Componente de estrelas reutilizavel
- Props: `rating`, `size`, `showValue`, `count`

**`CategoryBadge.tsx`**
- Badge de categoria (A, B, C, D, E) com cores distintas

**`SkeletonCard.tsx`**
- Placeholder de loading para cards de instrutores

**`JsonLd.tsx`**
- Schema.org structured data para SEO

---

## Paginas Detalhadas

### HomePage (`/`)

**Funcionalidades:**
1. **Hero** com titulo animado (Framer Motion)
2. **Autocomplete de cidades** — dropdown customizado (nao datalist nativo):
   - Aparece ao digitar 2+ caracteres
   - Mostra cidade + estado (ex: "Belo Horizonte - MG")
   - Mostra quantidade de instrutores em verde
   - Se nao encontrar: "Nenhum instrutor encontrado em '...'"
   - Dados vem de `getEstatisticasGlobais()` que conta instrutores aprovados por cidade
3. **Instrutores em Destaque** — top 4 da cidade do usuario (geolocation) ou globais
4. **Como Funciona** — 3 etapas (Busque, Compare, Conecte-se)
5. **Estatisticas** — total instrutores, alunos formados, avaliacao media, cidades
6. **FAQ** — accordion com perguntas frequentes

**Geolocation:** Na montagem, tenta pegar a localizacao do browser via Nominatim (OpenStreetMap) para pre-preencher a cidade.

### BuscarPage (`/buscar`)

**Filtros disponveis:**
- Cidade (texto)
- Categorias (A-E, multipla selecao)
- Faixa de preco (min/max)
- Avaliacao minima
- Aceita veiculo do candidato
- Genero do instrutor
- Ordenacao (avaliacao, preco)

**Debounce:** Hook `useInstrutores` com 400ms de delay para evitar queries excessivas.

### InstrutorPage (`/instrutor/[slug]`)

**Layout mobile-first:**
- **Mobile:** sidebar (preco + WhatsApp + SENATRAN) aparece PRIMEIRO usando `order-first md:order-last`
- **Desktop:** sidebar fica na coluna direita (sticky)
- Secoes: Sobre, Veiculos, Disponibilidade, Avaliacoes
- Botao "Compartilhar perfil" — usa `navigator.share` no mobile, `clipboard` no desktop
- WhatsApp FAB flutuante no mobile

### SejaInstrutorPage (`/seja-instrutor`)

**6 etapas com validacao por step:**
1. **Dados Pessoais** — nome, CPF/CNPJ (com validacao), data nascimento (18+), telefone, email, senha
2. **Credenciais** — registro SENATRAN, categorias, experiencia
3. **Documentos** — 3 obrigatorios (Certificado SENATRAN, Comprovante Residencia, CNH) — todos devem ser anexados para avancar
4. **Localizacao** — CEP com busca automatica (ViaCEP), raio de atendimento (5-50km)
5. **Veiculos** — marca, modelo, ano, cambio (adicionar/remover multiplos)
6. **Perfil** — preco/hora (minimo R$30), descricao (minimo 20 chars)

**Apos submit:** status `em_analise`, mensagem de confirmacao.

### PainelInstrutorPage (`/painel`)

**Tabs:** Perfil | Planos | Stats

**Perfil:**
- Foto de perfil editavel (upload)
- Informacoes editaveis: telefone, preco, descricao, CEP, categorias, veiculos, disponibilidades
- **Documentos** — secao sempre visivel com 3 slots obrigatorios:
  - Se enviado: mostra nome do arquivo + status (Aprovado/Em analise/Recusado) + botao "Trocar"
  - Se nao enviado: mostra "Obrigatorio — nao enviado" + botao "Enviar"
  - Ao trocar/enviar: perfil volta para `em_analise`, toast de aviso
  - Documento recusado mostra motivo da recusa
- **Avaliacoes** — lista com opcao de responder (textarea inline)

### AdminPage (`/admin`)

- Lista de todos os instrutores com filtro por status e busca
- Cards com estatisticas (total, aprovados, em analise, recusados)
- Modal de detalhes do instrutor:
  - Informacoes pessoais, localizacao, veiculos
  - **Documentos individuais** com botoes Aprovar/Recusar (cada documento separado)
  - Aprovar documento → badge verde "Aprovado"
  - Recusar documento → prompt para motivo → badge vermelho "Recusado: motivo"
  - Avaliacoes recentes
- Botoes globais: Aprovar Instrutor, Recusar Instrutor (com motivo)

---

## Design System

### Cores

| Token | Valor | Uso |
|-------|-------|-----|
| Primary | `#FACC15` (amber-400) | Botoes, badges, destaques |
| Primary Hover | `#EAB308` (amber-500) | Hover states |
| Background | `bg-white` / `bg-neutral-50` | Paginas |
| Text | `text-neutral-900` | Texto principal |
| Text Secondary | `text-neutral-500` | Texto secundario |
| Success | `text-green-600` | Aprovado, verificado |
| Warning | `text-amber-600` | Em analise, pendente |
| Error | `text-red-600` | Recusado, erro |

### Responsive Breakpoints

| Breakpoint | Largura | Uso |
|-----------|---------|-----|
| Default | < 768px | Mobile (design principal) |
| `md:` | >= 768px | Tablet |
| `lg:` | >= 1024px | Desktop |

Padrao mobile-first: `text-sm md:text-base`, `p-4 md:p-6`, `rounded-xl md:rounded-2xl`

### Componentes de UI

- Bordas: `rounded-xl` / `rounded-2xl`
- Sombras: `shadow-sm`, `shadow-lg shadow-yellow-400/20`
- Cards: `bg-white border border-neutral-200 rounded-xl p-4`
- Inputs: borda neutral, focus amarelo `focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20`
- Botoes primarios: `bg-[#FACC15] text-neutral-900 rounded-xl font-bold`

### Animacoes (Framer Motion)

```tsx
// Padrao fade-up usado em secoes da home
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
}

// Uso:
<motion.div initial="hidden" whileInView="visible" variants={fadeUp} custom={0}>
```
