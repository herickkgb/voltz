# 🧪 Cenários de Teste - Buscar Instrutor (Voltz)

Este documento descreve os cenários de teste essenciais para garantir a manutenibilidade e o bom funcionamento de toda a aplicação **Buscar Instrutor**. Sempre que uma nova grande alteração for feita no código, ou se realizar atualizações de dependências (como migrations no banco de dados ou upgrades no Next.js), você deve executar este roteiro. No futuro, você pode usar este documento como base para implementar testes automatizados com ferramentas como o *Cypress* ou *Playwright*.

---

## 🏎️ 1. Fluxo do Aluno/Candidato (Visitante)
*Objetivo: Garantir que pessoas possam encontrar e contatar instrutores sem impedimentos.*

| ID | Cenário de Teste | Passos a Executar | Resultado Esperado |
|:---|:---|:---|:---|
| **AL-01** | Busca por cidade na Home | Acessar a Home (`/`), digitar uma cidade que possua instrutor aprovado (ex: "Brasília") e clicar em buscar. | O site deve redirecionar para `/buscar` e exibir os cards apenas dos instrutores dessa cidade. |
| **AL-02** | Filtros de Pesquisa Avançada | Na página `/buscar`, aplicar filtros combinados (ex: "Categoria B" + "Aceita veículo" + "Ordenar por Preço"). | A lista deve se reordenar instantaneamente apenas com perfis que obedeçam às regras filtradas. |
| **AL-03** | Visualização de Perfil | Clicar no card de um instrutor para abrir seu perfil completo `/instrutor/[slug]`. | A página deve carregar foto, nome, cidade/estado, notas e categorias. Não deve exibir dados em branco (como ` , - `). |
| **AL-04** | Compartilhar Perfil | No perfil do instrutor, clicar em "Compartilhar perfil". | O botão deve exibir "Link copiado!" e a URL gerada deve estar no formato amigável para SEO (ex: `cidade-estado-nome-xyz`). |
| **AL-05** | Redirecionamento de WhatsApp | No perfil do instrutor, clicar no botão "Chamar no WhatsApp". | Uma nova aba do WhatsApp (API) deve abrir com a mensagem preenchida. A contagem de clicks na base de dados do Supabase sobe em 1. |

---

## 👩‍🏫 2. Fluxo do Instrutor (Autenticação e Painel)
*Objetivo: Garantir que profissionais possam entrar, gerenciar seus perfis e recuperar senhas.*

| ID | Cenário de Teste | Passos a Executar | Resultado Esperado |
|:---|:---|:---|:---|
| **IN-01** | Cadastro (Multi-step) | Acessar `/seja-instrutor`, preencher as 6 etapas (CPF/CNPJ, Docs, Localização, etc) e enviar. | O painel "Perfil em Análise" deve aparecer, o Supabase Auth deve criar o usuário, e a submissão de arquivos `.pdf`/`.jpg` ir ao storage. |
| **IN-02** | Login | Acessar `/login`, inserir e-mail e senha de um Instrutor recém-cadastrado. | O sistema deve redirecionar automaticamente para o Dashboard (`/painel`). |
| **IN-03** | **Recuperação de Senha** | Acessar `/login`, clicar em "Esqueci a senha", informar e-mail válido. | O campo de senha some, exibindo "Enviado!". O usuário recebe o e-mail de "Reset Password" enviado pelo Supabase. |
| **IN-04** | **Redefinição de Senha** | Abrir o link recebido no e-mail (que leva para `/redefinir-senha`). | O usuário deve preencher a nova senha e a confirmação com sucesso. Após redefinir, a sessão é encerrada e ele retorna ao login. |
| **IN-05** | Edição de Perfil no Painel | Logado em `/painel`, alterar a descrição e o preço por hora. | Os dados salvam no Supabase e o status do instrutor muda para `em_analise` até aprovação do Administrador. |

---

## 👑 3. Fluxo do Administrador
*Objetivo: Assegurar a aprovação de contas reais e moderação de perfis.*

| ID | Cenário de Teste | Passos a Executar | Resultado Esperado |
|:---|:---|:---|:---|
| **AD-01** | Acesso Restrito | Tentar acessar `/admin` como um visitante normal ou como Instrutor genérico. | O aplicativo deve barrar o acesso e redirecionar pra Home ou para o Painel do Instrutor comum. |
| **AD-02** | Login Admin | Fazer login usando a conta global (ex: `admin@buscarinstrutor.com.br`). | O sistema valida a flag/roles de admin e o redireciona ao portal `/admin`. |
| **AD-03** | Aprovação de Instrutor | No menu "Em Análise", visualizar pendências, ver os documentos enviados e clicar em "Aprovar". | O status muda para `aprovado`, permitindo que o perfil do instrutor apareça imediatamente nas listagens de busca (`/buscar`). |
| **AD-04** | Dashboard de Métricas | Acessar o mural Administrativo. | O total de Instrutores Ativos, alunos formados e a Média Global das avaliações deverão ser calculados e exibidos sem erros de compilação. |

---

## 🛡️ 4. Segurança & Edge Cases (Casos Críticos)
*Objetivo: Evitar brechas de segurança, validações furadas e indisponibilidade de sistema.*

| ID | Cenário de Teste | Passos a Executar | Resultado Esperado |
|:---|:---|:---|:---|
| **EG-01** | Bloqueio de Documento Duplicado | Tentar fazer cadastro em `/seja-instrutor` usando um CPF ou CNPJ de uma conta que já existe. | O formulário interrompe a criação lançando um `toast` de "Documento já registrado". |
| **EG-02** | Sessão Inválida (Proteção JWT) | Desligar a internet ou apagar chaves do navegador e tentar avançar para `/painel`. | O middleware / Supabase checa o RLS, entende a invalidade, expulsa a sessão e redireciona para a página `/login`. |
| **EG-03** | Maioridade Obrigatória | No formulário `/seja-instrutor`, preencher data de nascimento gerando uma idade menor que 18 anos. | O formulário emite alerta em vermelho "Você deve ter pelo menos 18 anos" e trava a continuidade do botão "Próximo". |

---

> **💡 Dica de Manutenibilidade:**  Sempre que for fazer *deploy* de uma nova funcionalidade (ex: novos campos nas tabelas SQL) abra esse roteiro. Se do `AL-01` ao `IN-05` correrem bem, sua plataforma está super segura para ir pro ar! 🚀
