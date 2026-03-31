# 4. Autenticacao, Fluxos e Gerenciamento de Estado

## AuthContext — Provider Global

**Arquivo:** `src/contexts/AuthContext.tsx`

O `AuthProvider` envolve toda a aplicacao (definido em `layout.tsx`) e gerencia:
- Estado do usuario logado (`user: AuthUser | null`)
- Login/registro via Supabase Auth
- Restauracao de sessao ao recarregar pagina
- Recarga de dados do instrutor apos edicoes
- Flags de role: `isAdmin`, `isInstrutor`

### Interface AuthUser

```typescript
interface AuthUser {
  id: string       // UUID do Supabase Auth
  nome: string
  email: string
  role: 'instrutor' | 'admin'
  instrutor?: Instrutor  // Dados completos (se role = instrutor)
}
```

### Fluxo de Login

```
1. Usuario digita email + senha
2. supabase.auth.signInWithPassword()
3. Supabase retorna JWT + user metadata
4. AuthContext verifica role:
   - email === 'admin@voltz.com.br' → admin
   - metadata.role === 'admin' → admin
   - senao → instrutor
5. Se instrutor: busca getInstrutorPorUserId(userId)
6. Seta user no state → toda a app reage
7. Redireciona para /painel ou /admin
```

### Fluxo de Logout

```
1. await supabase.auth.signOut()   ← ASYNC! Deve esperar terminar
2. setUser(null)
3. Limpa localStorage
4. router.push('/')
```

**IMPORTANTE:** O `handleLogout` em todos os componentes (Navbar, PainelInstrutor, Admin) usa `await logout()` para garantir que o signOut termine antes do redirect. Sem o `await`, a sessao pode ser restaurada ao navegar.

### Restauracao de Sessao

Ao montar o app:
1. `supabase.auth.getSession()` verifica se ha sessao ativa
2. Se sim: reconstroi o AuthUser completo
3. Escuta `onAuthStateChange` para reagir a login/logout em outras abas

### Hook `useAuth()`

Retorna:

```typescript
{
  user: AuthUser | null,
  isLoading: boolean,     // true durante login/registro
  isReady: boolean,       // true apos restaurar sessao
  login: (email, senha) => Promise<{ success, error? }>,
  registrar: (email, senha, nome) => Promise<{ success, error?, userId? }>,
  logout: () => Promise<void>,
  recarregarInstrutor: () => Promise<void>,  // Recarrega dados apos edicao
  isAdmin: boolean,
  isInstrutor: boolean,
}
```

---

## Fluxo de Cadastro do Instrutor

```
SejaInstrutorPage (6 etapas)
         |
    [Submit]
         |
    1. registrar(email, senha, nome)  → Supabase Auth signUp
         |
    2. criarInstrutor(userId, dados)  → INSERT instrutores (status: em_analise)
         |
    3. criarLocalizacao(instrutorId, dados)  → INSERT localizacoes
         |
    4. Para cada veiculo: criarVeiculo(instrutorId, dados)  → INSERT veiculos
         |
    5. Para cada documento:
       a. uploadDocumento(userId, arquivo, tipo)  → Storage upload
       b. criarDocumento(instrutorId, { tipo, nome, url })  → INSERT documentos (status: pendente)
         |
    6. Tela de sucesso: "Cadastro Enviado! Perfil em Analise"
```

---

## Fluxo de Documentos

### Envio inicial (cadastro)

```
Instrutor faz upload → uploadDocumento() → Storage → criarDocumento(status: pendente)
```

### Troca de documento (painel)

```
Instrutor clica "Trocar" → uploadDocumento() → Storage → atualizarDocumento(status: pendente)
                                                        → solicitarNovaAnalise() (status instrutor: em_analise)
```

### Envio de documento faltante (painel)

```
Instrutor clica "Enviar" → uploadDocumento() → Storage → criarDocumento(status: pendente)
                                                        → solicitarNovaAnalise() (status instrutor: em_analise)
```

### Validacao pelo admin

```
Admin clica Aprovar doc → atualizarStatusDocumento(id, 'aprovado')
Admin clica Recusar doc → prompt motivo → atualizarStatusDocumento(id, 'recusado', motivo)
```

### Status dos documentos

| Status | Badge | Descricao |
|--------|-------|-----------|
| `pendente` | Amarelo "Em analise" | Aguardando validacao do suporte |
| `aprovado` | Verde "Aprovado" | Documento aceito |
| `recusado` | Vermelho "Recusado: motivo" | Documento rejeitado, instrutor pode reenviar |

---

## Fluxo de Busca (Autocomplete + Filtros)

### Homepage — Autocomplete de Cidades

```
1. getEstatisticasGlobais() carrega todas as cidades com instrutores aprovados
2. Retorna array CidadeComContagem[] = { cidade, estado, label, instrutores }
3. Usuario digita 2+ chars → filtra localmente → mostra dropdown
4. Cada item: "Cidade - UF" + "X instrutores" (verde)
5. Se nenhum resultado: "Nenhum instrutor encontrado em '...'"
6. Ao clicar: preenche campo → botao Buscar redireciona para /buscar?cidade=X
```

### Pagina de Busca — Filtros

```
1. useInstrutores hook com debounce de 400ms
2. Monta query Supabase com filtros:
   - .ilike('localizacoes.cidade', '%{cidade}%')
   - .contains('categorias', [cat])
   - .gte('preco_hora', min) / .lte('preco_hora', max)
   - etc
3. Resultado renderizado em cards com link para /instrutor/[slug]
```

---

## Fluxo de Avaliacao

```
1. Aluno recebe link /avaliar/[token]
2. Preenche: nome, nota (1-5 estrelas), comentario
3. Submit → INSERT avaliacoes (instrutor_id via token)
4. No PainelInstrutorPage:
   - Instrutor ve avaliacoes na aba Stats
   - Pode clicar "Responder" → textarea inline → salva resposta_instrutor
5. No InstrutorPage (perfil publico):
   - Avaliacoes aparecem com respostas do instrutor
```

---

## Hooks Customizados

### `useInstrutores(filtros)`

- Busca instrutores com debounce (400ms)
- Evita queries excessivas ao digitar
- Retorna: `{ instrutores, loading, error }`

### `useViaCep()`

- Busca endereco a partir do CEP (API ViaCEP)
- Retorna: `{ buscarCep, loading }`
- Auto-preenche cidade, estado, bairro

### `useGeolocation()`

- Wrapper do `navigator.geolocation`
- Usado na home para detectar cidade do usuario

---

## SEO

### robots.ts

```typescript
// Permite todos os crawlers, aponta para sitemap
export default function robots() {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: 'https://voltz.com.br/sitemap.xml' }
}
```

### sitemap.ts

Gera sitemap XML com todas as rotas estaticas + slugs de instrutores aprovados (dinamico).

### JsonLd.tsx

Componente que injeta Schema.org structured data para SEO.
