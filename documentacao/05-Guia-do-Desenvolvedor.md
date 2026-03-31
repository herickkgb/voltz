# 5. Guia do Desenvolvedor

## Setup Local

### Pre-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase (projeto configurado)

### Instalacao

```bash
# 1. Clonar o repositorio
git clone <repo-url>
cd voltz

# 2. Instalar dependencias
npm install

# 3. Configurar variaveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase:
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 4. Rodar o dev server
npm run dev
# Abrir http://localhost:3000
```

### Comandos

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Dev server com hot reload |
| `npm run build` | Build de producao |
| `npm run start` | Servir build de producao |
| `npm run lint` | ESLint |

---

## Configuracao do Supabase

### 1. Criar as tabelas

Execute o SQL em `documentacao/06-SQL-Supabase.md` no SQL Editor do Supabase.

### 2. Criar os buckets de Storage

| Bucket | Publico? | Descricao |
|--------|----------|-----------|
| `fotos` | Sim | Fotos de perfil |
| `documentos` | Nao | CNH, certificados (acesso via URL assinada) |

### 3. Configurar RLS

As policies estao documentadas em `03-Backend-Supabase.md`. Execute no SQL Editor.

### 4. Criar usuario admin

No Supabase Auth, crie um usuario com email `admin@voltz.com.br`. O sistema reconhece automaticamente como admin.

---

## Contas de Teste

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@voltz.com.br | (sua senha) |
| Instrutor | (cadastre via /seja-instrutor) | (sua senha) |

---

## Padroes de Codigo

### Estrutura de componente pagina

```tsx
// src/components/pages/ExemploPage.tsx
'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function ExemploPage() {
  const { user, isReady } = useAuth()

  if (!isReady) return <Loading />
  if (!user) return <AcessoRestrito />

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar />
      <div className="pt-20 pb-16 md:pt-28 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* conteudo */}
        </div>
      </div>
      <Footer />
    </div>
  )
}
```

### Query Supabase padrao

```typescript
// src/lib/db.ts
export async function getAlgo(): Promise<Algo | null> {
  const { data, error } = await supabase!
    .from('tabela')
    .select('*')
    .eq('campo', valor)
    .single()

  if (error) {
    console.error('Erro ao buscar algo:', error)
    return null
  }

  return data
}
```

### Convencoes

- **Nomes de arquivos:** PascalCase para componentes, camelCase para lib/hooks
- **Imports:** `@/` aponta para `src/`
- **CSS:** Tailwind utility classes, mobile-first
- **Estado:** useState/useEffect para local, AuthContext para global
- **Toasts:** `toast.success()`, `toast.error()`, `toast.loading()` (Sonner)
- **Validacao:** Mascaras em `validations.ts` (CPF, CNPJ, CEP, telefone, RENAVAM)
- **Tipagem:** Todas as interfaces em `types/index.ts`
- **Sem mock data:** Todo dado vem do Supabase real

---

## Deploy (Vercel)

### Pre-deploy checklist

```bash
# 1. Verificar tipos
npx tsc --noEmit

# 2. Build local
npm run build

# 3. Se ambos passarem, pode fazer push
```

### Variaveis na Vercel

Configurar no dashboard da Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Dominio

Configurar dominio customizado `voltz.com.br` na Vercel.

---

## Troubleshooting

### "Nenhum instrutor aparece na busca"

1. Verificar se ha instrutores com `status = 'aprovado'` no banco
2. Verificar RLS: policy de SELECT publico na tabela `instrutores` filtrando `status = 'aprovado'`
3. Verificar RLS nas tabelas relacionadas (localizacoes, veiculos, etc)

### "Nao consigo deslogar"

O `logout()` e async. Todos os `handleLogout` devem usar `await logout()` antes de redirecionar.

### "Documentos nao aparecem no painel"

1. Verificar se a tabela `documentos` tem as colunas `status` e `motivo_recusa`
2. Verificar RLS: policy de SELECT para o proprio instrutor

### "Build falha no Vercel"

1. ESLint strict: variaveis nao usadas, `any` types → corrigir
2. Verificar se `npm run build` passa localmente

### "CSS nao carrega no dev"

Reiniciar o dev server: `Ctrl+C` → `rm -rf .next` → `npm run dev`

---

## Roadmap Futuro

### Monetizacao (Stripe)

- Checkout de planos via Stripe Payment Links
- Webhook para atualizar `plano` do instrutor automaticamente
- Edge Function para processar eventos de pagamento

### Notificacoes (Email)

- Supabase Edge Functions + Resend
- Triggers SQL para disparar emails:
  - Instrutor aprovado/recusado
  - Documento aprovado/recusado
  - Nova avaliacao recebida

### SEO Dinamico

- Sitemap automatico com todos os slugs de instrutores aprovados
- Meta tags dinamicas por cidade
- Paginas de cidade (ex: /instrutores/belo-horizonte)
