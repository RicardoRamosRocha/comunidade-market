# ?? Guia de Contribuição e Padrões do Git

## ?? Fluxo de Branches (Git Flow Simplificado)
- \main\ / \master\: Código em produção.
- \develop\: Branch principal para integração de código.
- \eature/nome-da-feature\: Nova funcionalidade (ex: \eature/login-usuario\).
- \ix/nome-do-bug\: Correção de bugs.

## ?? Padronização de Commits (Conventional Commits)
- \eat:\ Adiciona uma nova funcionalidade ao projeto.
- \ix:\ Corrige um problema/bug.
- \docs:\ Alterações na documentação.
- \style:\ Formatação ou estilos sem alteração de regra de negócio.
- \efactor:\ Refatoração de código sem mudar funcionalidades.
- \	est:\ Adição ou ajuste de testes.

Exemplo: \git commit -m "feat(auth): adiciona fluxo de login com JWT"\
"@

# 3. Criar o USER_STORIES.md (Backlog da Sprint 1)
Set-Content -Path "docs/USER_STORIES.md" -Value @"
# ?? Histórias de Usuário - Sprint 1 (Planejamento & Setup)

### US01 - Documentação e Setup Inicial
**Como** Desenvolvedor,  
**Quero** configurar a estrutura inicial do repositório no GitHub,  
**Para que** o time tenha um padrão claro de código e arquitetura.
- **Critérios de Aceite:**
  - [x] Arquivo README.md criado com descrição da plataforma.
  - [x] Guia de contribuição (CONTRIBUTING.md) estruturado.
  - [x] Repositório inicializado e sincronizado no GitHub.

---

### US02 - Modelagem de Banco de Dados
**Como** Arquiteto de Software,  
**Quero** definir a estrutura das tabelas do banco de dados,  
**Para que** o sistema suporte usuários, lojas, produtos, transações e carteiras digitais.
- **Critérios de Aceite:**
  - [ ] Diagrama de Entidade e Relacionamento (DER) criado.
  - [ ] Tabelas \users\, \stores\, \products\, \wallets\ e \	ransactions\ especificadas.
  - [ ] Scripts SQL ou Migrations iniciais criados.

---

### US03 - Prototipagem das Telas (UI/UX)
**Como** Designer / PO,  
**Quero** criar os wireframes/protótipos de baixa/alta fidelidade,  
**Para que** possamos validar a usabilidade do aplicativo.
- **Critérios de Aceite:**
  - [ ] Tela de Login / Cadastro.
  - [ ] Tela de Feed / Catálogo de Produtos.
  - [ ] Tela da Carteira Digital (Extrato e Moeda Comunitária).
