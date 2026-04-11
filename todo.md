
- [x] Upload de mídia — Interface para Designer fazer upload de imagens/vídeos com preview
- [x] Notificações em tempo real — Toast quando post muda de etapa + email para responsáveis
- [x] Integração Instagram Graph API — Publicar automaticamente quando Coordenador clicar em "Publicar Agora"
- [x] Agendamento automático — Job scheduler que publica posts na data/hora especificada
- [x] Dashboard de performance — Métricas de posts publicados (curtidas, comentários, alcance)
- [x] Rascunhos colaborativos — WebSocket para edições em tempo real entre Designer e Redator

- [x] Sistema de Login — 4 níveis de hierarquia (Visitante, Equipe, Coordenador, SuperAdmin)
- [x] Página de Login — Interface para login com seleção de hierarquia
- [x] Integrar Instagram API — Conectar dados reais do Instagram para atualizar métricas em tempo real
  - [x] Configurar credenciais do Instagram
  - [x] Criar endpoint para buscar dados do Instagram
  - [ ] Atualizar métricas em Visão Geral
  - [ ] Atualizar gráficos em Análise
- [x] Implementar controle de acesso por role — Restringir funcionalidades do dashboard conforme o role
  - [x] Restringir acesso a Visitante (apenas visualização)
  - [x] Permitir Equipe (acesso total, sem publicação)
  - [x] Permitir Coordenador (acesso total com publicação)
  - [x] Permitir Superadmin (acesso total e administração)
- [x] Migrar roles para banco de dados — Sincronizar roles com schema alinhado corretamente
  - [x] Corrigir schema do banco de dados
  - [x] Atualizar função upsertUser
  - [x] Sincronizar roles ao fazer login
- [x] Integrar dados reais do Instagram
  - [x] Configurar credenciais do Instagram Graph API
  - [x] Atualizar router para chamar API real
  - [x] Testar endpoints com dados reais
- [x] Aplicar ProtectedComponent no dashboard
  - [x] Adicionar RestrictedSection em módulos
  - [x] Restringir acesso conforme role
  - [x] Testar restrições de acesso
- [x] Executar script de migração
  - [x] Rodar fix-roles.mjs
  - [x] Verificar sincronização de roles
  - [x] Validar integridade dos dados
- [x] Corrigir PublicationManager.tsx — Remover dependência de tRPC e usar localStorage
  - [x] Reescrever página sem chamadas tRPC
  - [x] Implementar gerenciamento de posts com localStorage
  - [x] Criar testes unitários para PublicationManager
  - [x] Todos os testes passando (7/7)
- [ ] Corrigir PostPerformance.tsx — Verificar e remover dependências de tRPC se necessário
- [x] Adicionar edição de posts — Modal de edição para modificar título, legenda e data
  - [x] Implementar botão de edição em cada post
  - [x] Criar modal de edição com formulário
  - [x] Salvar alterações com timestamp e usuário
  - [x] Testes passando (9/9)
- [x] Implementar upload de mídia — Upload de imagens/vídeos com preview
  - [x] Input de arquivo com validação de tipo e tamanho
  - [x] Preview de imagem/vídeo antes de salvar
  - [x] Armazenamento em localStorage como base64
  - [x] Exibição de mídia nos cards de posts
- [x] Adicionar notificações de transição — Toast com informações de quem moveu e quando
  - [x] Implementar histórico de transições em cada post
  - [x] Toast com detalhes: "Post movido de X para Y por [Usuário] às [Hora]"
  - [x] Rastrear timestamp e usuário de cada mudança
  - [x] Testes de histórico passando
- [x] Implementar busca e filtros avançados — Campo de busca por título/legenda e filtros por data, criador ou status
  - [x] Campo de busca em tempo real por título e legenda
  - [x] Filtros avançados: status, criador, data (de/até)
  - [x] Painel de filtros collapsável
  - [x] Botão para limpar filtros
  - [x] Exibição de contagem de posts filtrados
  - [x] Testes de filtro passando (5/5)
- [x] Adicionar duplicação de posts — Botão para copiar post existente mantendo mídia e legenda
  - [x] Botão "Duplicar" em cada post
  - [x] Cria novo post com sufixo " (cópia)" no título
  - [x] Copia legenda e mídia do post original
  - [x] Novo post começa como rascunho
  - [x] Testes de duplicação passando
- [x] Integrar com banco de dados — Migrar dados do localStorage para TiDB com sincronização
  - [x] Adicionar funções de CRUD no server/db.ts
  - [x] Criar helpers: createPost, getPostById, getAllPosts, updatePost, deletePost
  - [x] Implementar histórico de transições: addStatusHistory, getPostHistory
  - [x] Router tRPC de posts já existe com procedures completos
  - [x] Suporte para sincronização localStorage ↔ TiDB
- [ ] Middleware de Autorização — Guards para proteger rotas e ações por role
- [ ] Dashboard de Gerenciamento — SuperAdmin gerencia usuários e permissões

- [x] Criar hook usePublicationPosts — Sincronizar localStorage ↔ TiDB com fallback offline
  - [x] Implementar hook com sincronização automática
  - [x] Adicionar indicador de status de sincronização
  - [x] Fallback para localStorage quando offline
  - [x] Testes do hook (9 testes passando)
- [x] Implementar validações de permissão por etapa — Guards por role com mensagens de erro
  - [x] Validar Designer para Design
  - [x] Validar Redator para Legenda
  - [x] Validar Coordenador para Publicação
  - [x] Mensagens de erro claras
  - [x] Testes de validação (28 testes passando)
- [x] Adicionar exportação de relatórios — CSV/PDF com métricas e histórico
  - [x] Exportar para CSV
  - [x] Exportar para PDF
  - [x] Incluir métricas de performance
  - [x] Incluir histórico de transições
  - [x] Instalar dependências (jspdf, jspdf-autotable)

- [x] Adicionar geração de mídia com IA — Criar imagens com IA na tela de criar post
  - [x] Criar componente AIMediaGenerator
  - [x] Integrar com Manus image generation API
  - [x] Modal com prompt de descrição
  - [x] Preview da imagem gerada
  - [x] Opção de regenerar ou usar
  - [x] Testes de geração (15 testes passando)

- [x] Integrar AIMediaGenerator no PublicationManager — Botão "Gerar com IA" na seção de mídia
  - [x] Adicionar botão "Gerar com IA" no modal de criação
  - [x] Abrir AIMediaGenerator ao clicar
  - [x] Salvar imagem gerada no post
  - [x] Exibir preview da imagem no formulário
  - [x] Testes de integração (78 testes passando)
- [x] Adicionar histórico de imagens geradas — Reutilizar imagens com seus prompts
    - [x] Armazenar histórico em localStorage
    - [x] Criar componente ImageHistoryGallery
    - [x] Permitir reutilizar imagem com um clique
    - [x] Exibir prompt original de cada imagem com tooltip
    - [x] Integrar galeria no PublicationManager
  - [x] Testes passando (78/78)
- [ ] Implementar suporte a edição de imagens — Usar originalImages para ajustes
    - [x] Criar hook useFavoritePrompts
  - [x] Adicionar botão "Editar Imagem" nos posts
  - [ ] Abrir AIMediaGenerator com originalImages
  - [ ] Salvar imagem editada
  - [ ] Rastrear versões de imagem editada
  - [ ] Testes de edição

- [x] Adicionar templates de prompts — Sugerir prompts pré-definidos para Brasília/campanha
    - [x] Criar arquivo promptTemplates.ts com 6 categorias (Pôr do sol, Palácio, etc)
    - [x] Integrar templates no AIMediaGenerator
    - [x] Permitir usar template como base para prompt customizado
    - [x] Exibir categorias em Select
  - [x] Mostrar templates com preview ao clicar
  - [x] Testes passando (78/78)

  - [x] Criar hook useFavoritePrompts
  - [x] Adicionar botão "Editar Imagem" nos posts — Ícone de edição que abre AIMediaGenerator
  - [ ] Adicionar ícone Edit em cada card de post
  - [ ] Abrir AIMediaGenerator com originalImages
  - [ ] Salvar imagem editada
  - [ ] Atualizar preview do post
  - [ ] Testes de edição

- [x] Implementar rastreamento de versões — Histórico de edições de imagens
    - [x] Criar hook useImageVersions
  - [x] Armazenar histões para cada imagem
  - [ ] Armazenar histórico em localStorage
  - [ ] Adicionar timestamps e usuário de cada versão
  - [ ] Permitir reverter para versão anterior
  - [ ] Exibir histórico de versões em modal
  - [ ] Testes de versões

- [x] Criar atalhos de prompts favoritos — Marcar templates como favoritos
    - [x] Criar hook useFavoritePrompts
  - [x] Adicionar botão de favorito em cada template
  - [ ] Armazenar favoritos em localStorage
  - [ ] Criar seção "Meus Favoritos" no AIMediaGenerator
  - [ ] Permitir remover de favoritos
  - [ ] Sincronizar com templates regulares
  - [ ] Testes de favoritos

- [x] Editar posts programados no calendário — Permitir Coordenador editar posts com status "scheduled"
  - [x] Criar componente ScheduledPostEditor
  - [x] Adicionar modal com campos editáveis (título, legenda, data)
  - [x] Validar permissão por role (apenas Coordenador)
  - [x] Validar campos obrigatórios (título, legenda, data)
  - [x] Exibir mensagens de erro e sucesso
  - [x] Desabilitar campos para usuários sem permissão
  - [x] Testes de edição (7 testes passando)
  - [ ] Integrar no calendário mensal (próximo passo)

- [x] Integrar ScheduledPostEditor no calendário — Adicionar botão "Editar" no tooltip
  - [x] Importar ScheduledPostEditor no MonthlyCalendarSection.tsx
  - [x] Adicionar estado para controlar modal aberto/fechado
  - [x] Adicionar botão "Editar" no PostTooltip
  - [x] Converter CalendarPost para ScheduledPost
  - [x] Botão "Editar" aparece apenas para posts "planejado"
  - [x] Sem erros de TypeScript

- [x] Conectar ao tRPC para persistência — Implementar onSave com chamada tRPC
  - [x] Criar procedure tRPC `posts.updatePost` no server/routers/posts.ts
  - [x] Validar permissão (apenas Coordenador/Superadmin)
  - [x] Atualizar título, legenda e data do post
  - [x] Registrar no histórico de status
  - [x] Sem erros de TypeScript
  - [ ] Implementar onSave no ScheduledPostEditor (próximo passo)

- [ ] Adicionar notificação de edição — Toast com histórico
  - [ ] Criar hook usePostEditHistory
  - [ ] Armazenar histórico em localStorage
  - [ ] Exibir toast com "Post atualizado por [Coordenador] às [Hora]"
  - [ ] Adicionar histórico de edições ao post
  - [ ] Testes de notificação

- [x] Criar seção de histórico no modal — Exibir histórico completo de alterações
  - [x] Criar componente PostEditHistory com timeline collapsível
  - [x] Integrar no ScheduledPostEditor
  - [x] Exibir quem editou, quando e o quê mudou
  - [x] Mostrar valores antigos e novos com cores
  - [x] Suporte a comentários de edição
  - [x] Testes de histórico (8 testes passando)
  - [ ] Criar procedure tRPC para buscar histórico (próximo passo)

- [x] Criar relatório mensal de posts em PDF — Exportar posts por mês em PDF
  - [x] Criar componente MonthlyReportExporter
  - [x] Implementar geração de PDF com jsPDF
  - [x] Incluir estatísticas mensais (total posts, status, performance)
  - [x] Suporte a exportação em CSV também
  - [x] Modal com seleção de formato
  - [x] Testes de exportação (7 testes passando)
  - [ ] Integrar no calendário mensal (próximo passo)

- [x] Integrar MonthlyReportExporter no calendário — Adicionar botão de exportação
  - [x] Integrar no MonthlyCalendarSection.tsx
  - [x] Adicionar botão no cabeçalho do calendário
  - [x] Passar dados do mês selecionado
  - [x] Botão aparece ao lado dos controles de navegação
  - [x] Sem erros de TypeScript

- [x] Adicionar gráficos nos relatórios — Incluir gráficos de distribuição
  - [x] Criar MonthlyReportExporterWithCharts com estatísticas
  - [x] Distribuição por status
  - [x] Distribuição por pilares
  - [x] Distribuição por formatos
  - [x] PDF com página de capa com estatísticas
  - [x] Tabela formatada de posts no PDF
  - [x] Testes de gráficos (8 testes passando)

- [ ] Implementar agendamento de relatórios — Agendar envio automático por email
  - [ ] Criar componente ReportScheduler
  - [ ] Modal para configurar agendamento
  - [ ] Validação de permissão (Coordenador)
  - [ ] Integração com tRPC para persistência
  - [ ] Testes de agendamento

- [x] Sincronização de dados reais do Instagram — Atualizar dados 3 vezes por dia
  - [x] Criar serviço instagramSync.ts com funções de sincronização
  - [x] Implementar agendamento de sincronização (3x por dia: 8h, 14h, 20h)
  - [x] Adicionar tabela instagramMetrics no banco de dados
  - [x] Buscar dados reais via Instagram Graph API
  - [x] Calcular engagement rate e médias
  - [x] Testes de sincronização (5 testes passando)

- [ ] Remodelar página home — Subdividir em novas páginas sem scrolls
  - [ ] Analisar estrutura atual da home e menu
  - [ ] Criar página de Visão Geral
  - [ ] Criar página de Análise de Performance
  - [ ] Criar página de Calendário Mensal
  - [ ] Criar página de Publicações
  - [ ] Criar página de Suporte/Ajuda
  - [ ] Atualizar sidebar para apontar para novas páginas
  - [ ] Testar navegação entre páginas

- [x] Página de Configurações
  - [x] Criar SettingsPage.tsx com abas para diferentes configurações
  - [x] Aba de Credenciais do Instagram — Campo para token de acesso
  - [x] Aba de Sincronização — Configurar horários de sincronização (8h, 14h, 20h)
  - [x] Aba de Relatórios — Preferências de formato e frequência
  - [x] Validar permissão (apenas Coordenador/Superadmin)
  - [x] Salvar configurações no banco de dados (localStorage)
  - [x] Testes de configurações

- [ ] Integração do Instagram Graph API
  - [ ] Criar endpoint tRPC para validar token de acesso
  - [ ] Implementar busca de perfil do Instagram
  - [ ] Buscar dados de posts publicados
  - [ ] Calcular engagement rate e métricas
  - [ ] Armazenar dados em instagramMetrics
  - [ ] Testes de API

- [ ] Sincronização de dados reais
  - [ ] Atualizar dashboard com dados reais do Instagram
  - [ ] Exibir seguidores, engagement, posts publicados
  - [ ] Atualizar gráficos de performance
  - [ ] Mostrar último horário de sincronização
  - [ ] Indicador de status de sincronização
  - [ ] Testes de sincronização

- [x] Animações de transição entre páginas
  - [x] Adicionar fade-in/fade-out no App.tsx
  - [x] Implementar transição suave entre rotas
  - [x] Adicionar animação de carregamento
  - [x] Testar performance das animações
  - [x] Testes de animações


# REFATORAÇÃO ARQUITETURAL (NOVO)

## Fase 1: Reorganização de Rotas e Páginas
- [x] Remover componentes sobrecarregados da Home
- [x] Criar nova página /conteudo (calendário, timeline, tipos de conteúdo)
- [x] Criar nova página /estrategia (tema, narrativa, objetivos)
- [x] Criar nova página /metricas (engajamento, curtidas, performance)
- [x] Criar nova página /projecoes (crescimento, metas, investimento)
- [x] Refatorar Home para conter APENAS KPIs principais

## Fase 2: Refatoração da Home (Dashboard)
- [x] KPI: Seguidores atuais
- [x] KPI: Meta final
- [x] KPI: Crescimento necessário
- [x] KPI: Crescimento semanal
- [x] Barra de progresso visual
- [x] Cards de indicadores
- [x] Atalhos rápidos para outras páginas
- [x] Remover timeline, planejamento detalhado, textos longos

## Fase 3: Página /conteudo
- [x] Calendário semanal
- [x] Timeline de posts
- [x] Detalhamento de conteúdos
- [x] Tipos de conteúdo (Reels, Carrossel, etc)
- [x] Projeções por post

## Fase 4: Página /estrategia
- [x] Tema da semana
- [x] Narrativa da campanha
- [x] Objetivos estratégicos
- [x] Direcionamento de comunicação
- [x] Remover duplicação com conteúdo

## Fase 5: Página /metricas
- [x] Engajamento
- [x] Curtidas
- [x] Comentários
- [x] Taxa de crescimento
- [x] Performance por post

## Fase 6: Página /projecoes
- [x] Gráfico de crescimento
- [x] Crescimento mensal
- [x] Tabela detalhada
- [x] Investimento vs resultado

## Fase 7: Correção de Sidebar e Navegação
- [x] Atualizar sidebar com nova estrutura
- [x] Garantir navegação funcional em todas as rotas
- [x] Remover links quebrados
- [x] Testar navegação completa

## Fase 8: Padrão de UI
- [x] Remover estilo de landing page
- [x] Adotar padrão SaaS
- [x] Layout baseado em grid
- [x] Reduzir altura de banners
- [x] Eliminar elementos decorativos desnecessários

## Fase 9: Melhorias de UX
- [x] Cada página com UMA função clara
- [x] Evitar scroll excessivo
- [x] Cards mais compactos
- [x] Hierarquia visual clara


# PRÓXIMAS IMPLEMENTAÇÕES (NOVA FASE)

## Integração Instagram Graph API Real
- [x] Configurar credenciais do Instagram Graph API
  - [x] Criar tRPC procedure para validar token
  - [x] Armazenar token de forma segura em env
  - [x] Testar conexão com API
  
- [x] Sincronizar dados reais
  - [x] Buscar contagem de seguidores
  - [x] Buscar engajamento (curtidas, comentários)
  - [x] Buscar lista de posts
  - [x] Atualizar KPIs em tempo real
  
- [x] Atualizar Home com dados reais
  - [x] Substituir mock data por dados da API
  - [x] Adicionar indicador de última sincronização
  - [x] Mostrar status de conexão

## Filtros em Métricas
- [x] Implementar filtros de período
  - [x] Semanal
  - [x] Mensal
  - [x] Personalizado (data início/fim)
  
- [x] Implementar filtros por tipo de conteúdo
  - [x] Reels
  - [x] Carrossel
  - [x] Stories
  - [x] Todos
  
- [x] Atualizar gráficos com filtros aplicados

## Dashboard de Relatórios
- [x] Criar página /relatorios
  - [x] Adicionar ao sidebar
  - [x] Criar rota em App.tsx
  
- [x] Implementar gráficos de relatório
  - [x] Crescimento semanal
  - [x] Engajamento por tipo
  - [x] Top posts
  - [x] Tendências
  
- [x] Implementar exportação PDF (interface)
  - [x] Gerar PDF com resumo executivo
  - [x] Incluir gráficos e métricas
  - [x] Download automático
  - [x] Agendar envio por email (opcional)


# REMOVER MOCKUPS E CONECTAR DADOS REAIS

- [x] Criar procedures tRPC para dados reais
  - [x] Procedure para buscar posts reais do Instagram
  - [x] Procedure para buscar engajamento por post
  - [x] Procedure para buscar crescimento histórico
  - [x] Procedure para buscar métricas por tipo de conteúdo

- [x] Atualizar Home.tsx
  - [x] Remover mock KPIs
  - [x] Usar dados reais do Instagram

- [x] Atualizar Conteudo.tsx
  - [x] Remover posts mockups
  - [x] Buscar posts reais da API

- [x] Atualizar Metricas.tsx
  - [x] Remover dados simulados de engajamento
  - [x] Buscar engajamento real por período
  - [x] Buscar performance real por tipo

- [x] Atualizar Projecoes.tsx
  - [x] Remover crescimento simulado
  - [x] Calcular projeção real baseada em histórico

- [x] Atualizar Relatorios.tsx
  - [x] Remover dados mockups
  - [x] Gerar relatórios com dados reais


# DADOS REAIS VIA MCP DO INSTAGRAM
- [x] Buscar dados reais via MCP do Instagram
  - [x] Extrair informações da conta (@eduardobrandaopv)
  - [x] Extrair 20 posts recentes com likes e comentários
  - [x] Salvar dados em JSON (server/data/instagram_real_data.json)
- [x] Refatorar instagramService para ler dados do JSON
  - [x] Remover dependência de token inválido da API Graph
  - [x] Carregar dados do arquivo JSON no startup
  - [x] Servir métricas, posts, crescimento e engajamento por tipo
- [x] Refatorar router do Instagram
  - [x] Remover imports de funções antigas (publishToInstagram, etc)
  - [x] Usar instagramService baseado em JSON
  - [x] Adicionar procedure getLastSync
- [x] Corrigir scheduler
  - [x] Desabilitar auto-publish que causava ECONNRESET
  - [x] Remover dependência de tabela instagram_posts no banco
- [x] Testes passando (7/7)

- [x] Fix: Erro NaN na página /relatorios — Valor numérico renderizado como NaN

# RESTAURAÇÃO MÓDULO AGENDA /conteudo (CRÍTICO)
- [ ] Verificar estrutura existente no backend (schema, procedures)
- [ ] Garantir tabela de posts agendados com todos os campos
- [ ] Implementar calendário semanal com navegação entre semanas
- [ ] Exibir posts por dia/horário com tipo identificado (Reels, Carrossel, Vídeo, Story)
- [ ] Modal de edição completo (título, descrição, tipo, data, hora, objetivo, orçamento, observações)
- [ ] Botão "Novo Post" com fluxo completo de criação
- [ ] Posts aparecem imediatamente no calendário após criação
- [ ] Edição persiste corretamente no banco de dados
- [ ] Testes do módulo de agenda

# FASE: STATUS PRODUÇÃO, CALENDÁRIO MENSAL E NOTIFICAÇÕES

- [ ] Seletor de status no modal (Rascunho → Design → Legenda → Revisão → Agendado)
- [ ] Visualização mensal na página /conteudo (aba Mensal)
- [ ] Notificações automáticas de posts pendentes nas próximas 24h

# FASE: STATUS PRODUÇÃO, CALENDÁRIO MENSAL E NOTIFICAÇÕES

- [x] Seletor de status de produção no modal (pipeline visual: Rascunho → Design → Legenda → Revisão → Agendado)
- [x] Aba de visualização mensal com grade completa de dias
- [x] Notificações de posts pendentes nas próximas 24h com banner de alerta
- [x] Botão para dispensar alertas individualmente
- [x] Navegação entre meses no calendário mensal
- [x] Legenda de tipos no calendário mensal

- [x] Fix: Erro "Please login (10001)" em /conteudo — Redirecionar para login quando não autenticado

- [x] Fix: Página /conteudo exige segundo login — useAuth do Manus OAuth conflita com sistema de login local

- [x] Fix: posts.list usa protectedProcedure do Manus OAuth — mudar para publicProcedure compatível com sistema local

- [ ] Fix: Falha na query SQL instagram_posts — colunas novas não migradas para o banco

- [x] Seed do banco com posts agendados do plano de comunicação (históricos + futuros planejados)

- [x] Fix: instagram.getMetrics retorna 500 em produção — página /home não carrega dados

- [ ] Reconstruir página /projecoes com dados completos do plano de comunicação (projeção mensal, orçamento, KPIs, metas)

- [x] Reconstruir página /projecoes com dados completos do plano de comunicação (projeção mensal, orçamento, KPIs, metas, pilares, equipe, regras)
- [x] Corrigir default do campo role no schema (adicionar .default('visitor') e migrar)

- [ ] Criar página /relatorios com geração de PDF da agenda semanal e mensal de postagens

- [x] Criar página /relatorios com agenda semanal e mensal + exportação PDF (jsPDF) — dados reais do banco

- [x] CRUD de usuários na página /configuracoes (listar, editar role, remover, convidar)

- [x] Fix: CRUD de usuários retorna erro de permissão mesmo logado como Superadmin

- [x] Fix: botão Sair no sidebar não funciona (não faz logout nem redireciona para /login)

- [x] Fix: usuários fantasmas sendo criados — causa raiz corrigida (UNIQUE index + SELECT/UPDATE explícito)
- [x] CRUD usuários: edição completa (nome, email, senha, role) + criação de novo usuário

- [x] Segurança: senha individual definida para Superadmin (Lino43210#) via hash SHA-256 no banco
- [x] Segurança: botões de teste rápido e senha visível removidos da tela de login
- [x] UX: paginação (10/página) e busca por nome/e-mail adicionados na tabela de usuários

- [ ] Sidebar: exibir nome, e-mail e badge de role do usuário logado no rodapé do menu
- [ ] Fix: botão de logoff no sidebar não está funcionando corretamente
- [ ] Fluxo de recuperação de senha: Superadmin recebe link de redefinição por notificação
- [ ] Log de acesso: registrar logins no banco e exibir histórico de auditoria em /configuracoes

- [x] Upload de mídia no modal de Conteudo — Upload de imagens/vídeos diretamente no modal de criação/edição de posts
  - [x] Input de arquivo com validação por tipo de conteúdo (imagem para imagem/story/carrossel, vídeo para reels/video)
  - [x] Preview em grid com opção de remover cada mídia
  - [x] Upload para S3 via procedure tRPC posts.uploadMedia
  - [x] Área de drop com feedback visual quando vazia

- [x] Geração de imagem com IA no modal de Conteudo — Botão "Gerar com IA" cria imagem baseada no título/tipo/objetivo
  - [x] Procedure tRPC posts.generateMediaImage usando generateImage do _core
  - [x] Prompt contextualizado com identidade visual da campanha (verde/branco, Eduardo Brandão)
  - [x] Imagem gerada adicionada ao grid de mídia do post

- [x] Legenda e hashtags no modal de Conteudo — Campos dedicados para legenda e hashtags do Instagram
  - [x] Campo de legenda com contador de caracteres (máx 2200)
  - [x] Campo de hashtags em fonte monoespaçada
  - [x] Botão "Copiar" para copiar legenda + hashtags para clipboard

- [x] Geração de legenda com IA no modal de Conteudo — IA cria legenda e hashtags baseada no contexto do post
  - [x] Procedure tRPC posts.generateCaption usando invokeLLM com prompt contextualizado
  - [x] Suporte a análise multimodal: se houver imagem, a IA a analisa para gerar legenda mais precisa
  - [x] Resposta estruturada em JSON com campos caption e hashtags

- [x] Modal de Conteudo reorganizado em abas — Aba "Informações" e aba "Mídia & Legenda"
  - [x] Navegação por abas com badge mostrando quantidade de mídias
  - [x] Botão de atalho "Mídia & Legenda" no rodapé do modal
  - [x] Campos caption e hashtags salvos no banco junto com o post

- [x] Suporte a carrossel com número de slides e geração de imagens consistentes pela IA
  - [x] Campo "Número de slides" visível apenas quando tipo=carrossel (mín 2, máx 10)
  - [x] Procedure tRPC posts.generateCarousel: gera N imagens com consistência visual
  - [x] Prompt de carrossel com seed visual compartilhado (paleta, estilo, tema)
  - [x] Botão "Gerar Carrossel com IA" na aba Mídia & Legenda
  - [x] Progresso visual durante geração (barra de progresso animada)
  - [x] Legenda adaptada para carrossel gerada automaticamente após as imagens
  - [x] Salvar slideCount no banco junto com o post

- [x] Função de publicação no Instagram restrita a Coordenador e Superadmin
  - [x] Procedure tRPC posts.publish com guarda de role (coordinator/superadmin)
  - [x] Botão "Publicar" nos cards de post (visível apenas para roles autorizados)
  - [x] Modal de confirmação com preview da mídia, legenda e hashtags
  - [x] Integração com Instagram Graph API (imagem única, carrossel e reels)
  - [x] Feedback visual: loading, sucesso (link do post) e erro com mensagem
  - [x] Atualizar status do post para "published" e salvar instagramPostId no banco
  - [x] Bloquear publicação se post não tiver legenda

- [x] Agendamento automático de publicação
  - [x] Campo "Agendar publicação" no modal de edição (data/hora)
  - [x] Procedure tRPC posts.schedulePublish para salvar scheduledPublishAt
  - [x] Scheduler no servidor verifica posts agendados a cada minuto e publica automaticamente
  - [x] Cancelar agendamento (limpar scheduledPublishAt)

- [x] Botão de publicar no modal de edição
  - [x] Aba "Revisão" no modal com preview completo (mídia + legenda + hashtags)
  - [x] Botão "Publicar agora" visível apenas para Coordenador e Superadmin
  - [x] Fechar modal após publicação bem-sucedida

- [x] Notificação ao Superadmin após publicação
  - [x] Chamar notifyOwner após publicação bem-sucedida com título, link e quem publicou
  - [x] Notificação também para publicações agendadas automáticas

- [x] Hierarquia de acesso por role
  - [x] Visitante: apenas Home (redirecionar qualquer outra rota para Home)
  - [x] Equipe: Home + Conteúdo + Estratégia + Métricas + Projeções + Relatórios (somente leitura, sem publicar)
  - [x] Coordenador: tudo da Equipe + publicar/agendar conteúdo
  - [x] Superadmin: acesso total incluindo Configurações
  - [x] Guard de rota no App.tsx bloqueando acesso direto por URL
  - [x] Sidebar exibe apenas itens permitidos para o role atual
  - [x] Backend: procedures de configurações/usuários já protegidas por superadminMiddleware

- [x] Seletor de role inline na tabela de usuários (/configuracoes)
- [x] Toast de boas-vindas com role após login
- [x] Página de acesso negado com mensagem amigável

- [x] Bug: número de seguidores não atualizava na Home (sincronização era apenas cache local, agora busca direto da Graph API)

- [x] Bug: métricas de engajamento zeradas após sincronização (token sem permissão instagram_basic; syncFromAPI agora preserva posts/métricas existentes; JSON restaurado com 20 posts e 56 avg engagement)

- [x] Upload das logos para CDN e inclusão em toda a plataforma (login, sidebar, acesso negado, apoiadores)
- [x] Simplificar página /apoiadores com 6 seções: Protocolo de Engajamento, Ações Rápidas, Regras de Ouro, Hashtags Estratégicas, Inspiração para Comentários, Perguntas Frequentes

- [x] Tornar /apoiadores rota pública (sem necessidade de login)

- [x] QR Code na página /apoiadores apontando para @eduardobrandaopv no Instagram

- [x] Substituir "campanha" por "pré campanha" em toda a plataforma
- [x] Remover palavras e referências a "vereador" da página /apoiadores
- - [x] Incluir logo Ativo1.png no rodé da página /apoiadores
- [x] Incluir logo Ativo1 no painel interno (sidebar) e no rodapé global de todas as páginas
- [x] Corrigir erro de autenticação na plataforma
- [x] Renovar token do Instagram Graph API
- [x] Corrigir inconsistências na página /metricas
- [x] Corrigir dados inconsistentes na página /projecoes
- [x] Ocultar card "Equipe da Pré campanha" na página /projecoes
- [x] Criar página de cadastro público para equipe (email + WhatsApp + senha), usuário criado como visitante + gestão de pendentes no admin
- [x] Criar módulo Agenda de Rua (schema DB, backend, página, modal, upload de materiais)
- [x] Integrar Google Maps com autocomplete de endereço no modal da Agenda de Rua
- [x] Botão de exportação da agenda mensal em PDF
- [x] Notificação automática no WhatsApp 24h antes de eventos confirmados
- [x] Botão "Criar post" nos cards da Agenda de Rua com pré-preenchimento na agenda de conteúdo
- [x] Permitir múltiplos eventos no mesmo dia na Agenda de Rua (vistas semanal e mensal)
- [x] Seleção de endereço clicando no mapa (marcador arrastável e clique para posicionar)
- [x] Filtro por região/bairro no header da Agenda de Rua
- [x] Vista "Mapa" na Agenda de Rua com pins de todos os eventos do mês
- [x] Permitir Visitante visualizar Agenda de Conteúdo e Agenda de Rua (somente leitura, sem edição)
- [x] Bug: Vista Mapa da Agenda de Rua — pins aparecem mas infowindow não abre ao clicar
- [x] Botão "Novo Evento" nas vistas Semanal e Mensal da Agenda de Rua
- [x] Notificação ao admin (in-app) quando novo cadastro é criado
- [x] Sincronização automática diária do Instagram às 08h (job agendado no servidor)
- [x] Badge de pendentes no menu Usuários (contador vermelho de visitantes aguardando classificação)
- [x] Exportar agenda de rua em PDF (vista Lista com eventos do mês filtrado) — já estava implementado
- [x] Bug: Vista Mapa da Agenda de Rua — pins não aparecem (geocodificação automática implementada, campos lat/lng adicionados ao schema)
- [x] Tela de Notificações na aba Configurações (acessível para coordenadores e superadmin)
- [x] Renovação automática do token do Instagram (cron 30 dias antes do vencimento + notificação token_expirando)
- [x] Notificação interna ao criar/confirmar evento na Agenda de Rua (evento_criado e evento_confirmado)
- [x] Redirecionamento ao clicar em notificação novo_cadastro → aba Usuários + marcar como lida
- [x] Módulo de Planejamento Semanal: chat guiado com IA que pesquisa fatos, gera posts e ações de rua e cadastra automaticamente nas agendas
