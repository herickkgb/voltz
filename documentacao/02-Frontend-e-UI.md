# 2. Frontend e Engajamento de UI (Next.js)

O Front-End do projeto não deve ser encarado apenas como o "display" do site. Por rodarmos numa arquitetura sem Node Intermediário (BaaS), nosso Front-End carrega imensas regras de negócios seguras e micro-orquestrações. 
Ele foi totalmente escrito com o "Padrão Ouro": **React Hooks**, **App Router (Next.js 14+)**, **TypeScript Strict** e **Tailwind CSS**.

## 🎨 Design System e Identidade Visual (Tailwind)
Na documentação visual da Voltz, apostamos pesado num feeling "Premium/Avançado".
- **Color Tokens**: Amarelo Dinâmico (`#FACC15`) predominante operando ativamente com Preto/Cinza Neutralidade (`bg-neutral-50` até `text-neutral-900`) simulando a paleta tradicional das sinalizações automotivas mescladas ao Minimalismo.
- **Components Patterns**: Bordas polidas suaves `rounded-xl` / `rounded-2xl`, glassmorphisms, shadows de alta densidade via `shadow-xl shadow-yellow-400/10` focando em dar textura viva e um visual "WOW" na Landing Page.

## 🏎️ Gerenciamento de Animações Vivas (Framer Motion)
Ao transitar na `HomePage.tsx`, não há pulos espasmódicos do HTML ao renderizar. Adotou-se o pacote `framer-motion`:
- **Viewport Triggers**: Funções como `whileInView="visible"` combinadas às constantes estáticas pré-declaradas `fadeUp`. Tudo é servido para rolar na tela e surgir devagar, captando o engajamento visual de quem navega.
```tsx
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 }
  })
}
```

## 🔍 Regra de Busca com Debounce (Proteção de Banco)
**Explicação para Novos Desenvolvedores**:
O maior gargalo de um BaaS (Backend as a Service) são as faturas bancárias por excesso abusivo de leituras à Database (I/O). Se cada vez que o sujeito digitasse a palavra "São Paulo", o state fosse disparado chamando o Supabase para cada letra (S, a, o...), um usuário esgotaria as cotas operacionais.

No arquivo `/src/hooks/useInstrutores.ts`, nós isolamos o tráfego violento gerando um "Freio a Disco" ou Debounce via timer assíncrono.
```typescript
// useInstrutores.ts - Controle da Busca
useEffect(() => {
  // Apenas invoca buscar() do DB após o usuário parar de pulsar a tecla por 400ms!
  const handler = setTimeout(() => {
    buscar()
  }, 400) 
  return () => clearTimeout(handler)
}, [filtros]) 
```

## 📲 Micro-Iterações do "Dashboard do Profissional"
No `PainelInstrutorPage.tsx`, não oferecemos apenas `inputs` e um `botão de Salvar`. Desenvolvemos caixas amarelas condicionalmente ativadas que simulam a "voz administrativa" dando dicas pontuais e instrucionais *(ex: "Explique se houveram carros automáticos na garagem, seu aluno pesquisa por isso!").* Isso fomenta descrições ricas, consequentemente, injetando bom volume textual que é vital para nosso SEO On-Page.
