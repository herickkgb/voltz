# 1. Visao Geral e Arquitetura

## O que e a Voltz

A **Voltz** e uma plataforma web que conecta **candidatos a motoristas** (alunos) com **instrutores autonomos de transito** credenciados pelo SENATRAN. A Voltz **NAO e uma autoescola** — e um intermediario digital que facilita o encontro entre aluno e instrutor, seguindo a **Lei 14.723/2024** que permite instrutores atuarem de forma independente.

**URL de producao:** voltz.com.br (hospedado na Vercel)

---

## Atores do Sistema

| Ator | Descricao | Precisa de conta? | Rotas |
|------|-----------|-------------------|-------|
| **Visitante/Aluno** | Busca instrutores, ve perfis, contata via WhatsApp | Nao | `/`, `/buscar`, `/instrutor/[slug]`, `/nova-lei` |
| **Instrutor** | Cadastra-se, gerencia perfil, documentos, responde avaliacoes | Sim | `/seja-instrutor`, `/painel`, `/login` |
| **Admin** | Aprova/recusa instrutores e documentos individuais | Sim (role: admin) | `/admin` |

---

## Stack Tecnologica

| Camada | Tecnologia | Versao | Finalidade |
|--------|-----------|--------|------------|
| Framework | Next.js (App Router) | 14.2.35 | SSR, routing, SEO |
| Linguagem | TypeScript | 5.x | Tipagem estatica |
| UI Library | React | 18.3.x | Componentes |
| Estilizacao | Tailwind CSS | 3.4.x | Utility-first CSS |
| Componentes | shadcn/ui | 4.x | Primitivos UI |
| Animacoes | Framer Motion | 12.x | Transicoes suaves |
| Icones | Lucide React | 1.7.x | Icones SVG |
| Backend | Supabase | — | PostgreSQL + Auth + Storage |
| Validacao | Zod | 4.x | Schema validation |
| Formularios | React Hook Form | 7.x | Controle de forms |
| Toasts | Sonner | 2.x | Notificacoes |
| Deploy | Vercel | — | Hosting + CDN |

---

## Arquitetura Geral

```
[Browser - Visitante/Instrutor/Admin]
              |
         [Vercel CDN]
              |
    [Next.js 14 - App Router]
              |
    [Supabase Client SDK (@supabase/supabase-js)]
              |
    +----------+-----------+-------------+
    |          |           |             |
  [Auth]  [Database]  [Storage]   [RLS Policies]
  (JWT)   (Postgres)  (Buckets)   (Seguranca SQL)
              |           |
    +---------+------+    +--------+--------+
    |   |   |   |   |    |                  |
  instru loca veic aval  bucket:documentos  bucket:fotos
  tores  liza ulos iacoes  (PRIVADO)        (PUBLICO)
         coes
  dispon  contatos  documentos
  ibili
  dades   instrutores_dados_privados (RLS isolada)
```

**Nao existe backend Node.js/Express.** Todo o acesso ao banco e feito diretamente pelo frontend via Supabase Client SDK. A seguranca e garantida por **Row Level Security (RLS)** no PostgreSQL.

---

## Estrutura de Pastas

```
voltz/
├── documentacao/              # Documentacao do projeto (voce esta aqui)
├── public/                    # Assets estaticos (imagens, etc)
├── src/
│   ├── app/                   # Rotas Next.js (App Router)
│   │   ├── (home)/page.tsx    # Pagina inicial (/)
│   │   ├── admin/page.tsx     # Painel admin (/admin)
│   │   ├── avaliar/[token]/   # Avaliacao de instrutor via token
│   │   ├── buscar/page.tsx    # Busca com filtros (/buscar)
│   │   ├── instrutor/[slug]/  # Perfil publico do instrutor
│   │   ├── lgpd/page.tsx      # Pagina LGPD
│   │   ├── login/page.tsx     # Login (/login)
│   │   ├── nova-lei/page.tsx  # Info sobre a Lei 14.723/2024
│   │   ├── painel/page.tsx    # Painel do instrutor logado
│   │   ├── politica-de-privacidade/
│   │   ├── politica-de-utilizacao/
│   │   ├── seja-instrutor/    # Cadastro de instrutor (6 etapas)
│   │   ├── sobre/page.tsx     # Sobre a Voltz
│   │   ├── termos-de-uso/
│   │   ├── layout.tsx         # Layout raiz (AuthProvider, Toaster, fonts)
│   │   ├── globals.css        # Tailwind imports
│   │   ├── robots.ts          # robots.txt dinamico
│   │   └── sitemap.ts         # Sitemap XML dinamico
│   │
│   ├── components/
│   │   ├── layout/            # Navbar.tsx, Footer.tsx
│   │   ├── pages/             # Componentes client de cada pagina
│   │   │   ├── AdminPage.tsx
│   │   │   ├── AvaliarInstrutorPage.tsx
│   │   │   ├── BuscarPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── InstrutorPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── PainelInstrutorPage.tsx
│   │   │   └── SejaInstrutorPage.tsx
│   │   ├── shared/            # Componentes reutilizaveis
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── JsonLd.tsx     # SEO structured data
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── StarRating.tsx
│   │   │   └── WhatsAppButton.tsx  # Botao flutuante (FAB)
│   │   └── ui/                # shadcn/ui primitives (accordion, badge, etc)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx    # Provider global de autenticacao
│   │
│   ├── hooks/
│   │   ├── useGeolocation.ts  # Geolocation API do browser
│   │   ├── useInstrutores.ts  # Busca com debounce (400ms)
│   │   └── useViaCep.ts      # Busca CEP via API ViaCEP
│   │
│   ├── lib/
│   │   ├── db.ts             # TODAS as queries Supabase (CRUD completo)
│   │   ├── storage.ts        # Upload de documentos e fotos
│   │   ├── supabase.ts       # Singleton do client Supabase
│   │   ├── utils.ts          # cn() para classnames
│   │   └── validations.ts    # Mascaras (CPF, CNPJ, CEP, telefone, RENAVAM)
│   │
│   └── types/
│       └── index.ts          # Todas as interfaces TypeScript
│
├── .env.example              # Template de variaveis de ambiente
├── .env.local                # Credenciais reais (NAO commitado)
├── next.config.mjs           # Config Next.js
├── package.json
├── tailwind.config.ts        # Config Tailwind (cores customizadas)
└── tsconfig.json             # Config TypeScript
```

---

## Padrao Pagina ↔ Componente

Toda rota em `src/app/` e um **Server Component** fino que importa o componente `use client` de `src/components/pages/`:

```tsx
// src/app/buscar/page.tsx (SERVER)
import BuscarPage from '@/components/pages/BuscarPage'
export default function Page() { return <BuscarPage /> }

// src/components/pages/BuscarPage.tsx (CLIENT)
'use client'
export default function BuscarPage() { ... }
```

Isso permite que:
- As paginas tenham metadata SEO (export metadata)
- Os componentes usem hooks, state, efeitos
- Paginas estaticas (LGPD, termos, sobre) sejam server components puros
