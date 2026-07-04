# Notas do projeto jsfeletrico (estado + decisões)

## Estado atual (após upgrade web-db-user)
- Projeto: /home/ubuntu/jsfeletrico — antes web-static, agora tRPC + DB (MySQL/Drizzle) + Manus OAuth.
- IMPORTANTE: o upgrade sobrescreveu client/src/pages/Home.tsx com o template! A versão
  original completa da landing page está no diff acima E preservada no checkpoint 5729cf14
  (posso recuperar com git show do commit do checkpoint). Backup local: procurar Home.tsx.bak.
- Site já publicado com domínios: jsfeletrico.com, www.jsfeletrico.com, jsfeltrico-kxktzfwz.manus.space.
- Checkpoints: 24dfd583 (init), 5729cf14 (landing completa).

## Requisitos da nova fase (do usuário + conhecimento)
1. Integrar o simulador HTML (arquivo /home/ubuntu/upload/jsfeletrico.html, ~9954 linhas) ao site.
2. Login por e-mail/senha CRIADOS PELO ADMIN (não OAuth manus para usuários finais):
   admin cadastra e-mail + senha depois que a pessoa entra em contato.
3. Painel administrativo para criar/gerenciar usuários + auditoria de acessos.
4. Preferências (conhecimento): tudo num único endereço/página (evitar múltiplas URLs);
   login obrigatório p/ simulador (auditoria); botão para voltar à tela inicial do site;
   mensagem para novos usuários: contatar administrador para serem adicionados;
   NUNCA usar termo "Manus"; simulador p/ hobbyistas/aprendizes.
5. Skill circuit-screenshot-integration: aviso de contato com wa.me/mailto pré-preenchidos.
   E-mail: jsfeletrico@gmail.com.

## Decisões de implementação
- Autenticação própria (não OAuth): tabela simUsers (email, passwordHash scrypt, ativo, role),
  sessão via cookie JWT próprio (jose, JWT_SECRET). Não mexer no auth Manus do template (_core).
- Tabela simAuditLog: userId, email, evento (login_ok, login_fail, simulador_acesso, logout,
  admin_create_user, admin_toggle_user, admin_reset_password, admin_delete_user), ip, userAgent, createdAt.
- Rota única /simulador: mostra login OU simulador OU painel admin (abas para admin).
- Simulador HTML: servir via endpoint protegido /api/simulador (verifica cookie de sessão)
  que lê o HTML (armazenado em S3 storage ou servido do servidor) e retorna; iframe na página.
  OBS: HTML referencia icone.png -> substituir por URL do storage; título contém www.jsfeletrico.com ok.
- Admin: seed do admin via script com email jsfeletrico@gmail.com e senha inicial gerada;
  entregar credenciais ao usuário no final.
- Botão "Voltar ao site" no topo da página do simulador/painel.

## Paleta/estilo (do simulador)
- #166184 (marca), #0e3f59/#1f789c (toolbar gradient), #0f172a/#1e293b (painéis), #334155 (bordas),
  #38bdf8 (ciano), #ffc107 (amarelo avisos), #28a745 (verde), fios: vermelho/azul/verde.
- Classes CSS já criadas em index.css: circuit-grid, jsf-splash-gradient, jsf-toolbar-gradient,
  jsf-panel, jsf-panel-teal, fio/fio-fase/fio-neutro/fio-terra, terminal-dot, glow-pulse, current-flow, font-display.

## Assets (URLs /manus-storage já enviados)
Ver client/src/lib/assets.ts (completo, não sobrescrito). PLAY_STORE_URL, EMAIL_SUPORTE,
POLITICA_PRIVACIDADE_URL definidos lá.

## Info oficial Play Store
JSF elétrico, dev Joelson da Silva Francisco, v115.3, https://play.google.com/store/apps/details?id=com.jsfeletrico.app

## PROGRESSO (fase login/admin) — atualizado
- Home.tsx original RESTAURADO ok (checkout do git funcionou; conteúdo atual é a landing completa).
- Schema: simUsers (id,email,nome,passwordHash,ativo,role,createdAt,updatedAt,lastLoginAt,expiraEm)
  e simAuditLog — migrados com pnpm db:push (2 migrações ok).
- server/simAuth.ts: scrypt hash, JWT cookie jsf_sim_session (7d), helpers.
- server/simDb.ts: CRUD simUsers (ordenado por lastLoginAt desc, nulls no fim) + logAudit/listAudit.
- server/simRouter.ts: sim.me/login/logout/registrarAcesso + sim.admin.{listarUsuarios(total,ativos,usuarios[expiraEm,expirado]),criarUsuario(expiraEm opc),alternarAtivo,redefinirSenha,excluirUsuario,definirExpiracao,auditoria}. Login bloqueia conta desativada e expirada.
- server/simuladorRoute.ts: GET /api/simulador protegido, serve HTML do storage key simulador_0278dc9f.html (cache em memória), audita "simulador_carregado". Registrado em _core/index.ts.
- client/src/pages/Simulador.tsx: página única /simulador (login | iframe | admin abas Simulador/Usuários/Auditoria), header com "Voltar ao site", contador Total/Ativos, coluna Expira em (clicável p/ alterar), form criar usuário com data expiração opcional.
- App.tsx: rota /simulador registrada, defaultTheme dark.
- Admin seed: jsfeletrico@gmail.com / senha em /home/ubuntu/.jsf_admin_cred (SENHA_ADMIN=JSF-d9c967e2), id=1, role=admin.
- Simulador HTML corrigido (icone.png -> /manus-storage/icone_app_cdd01151.png) e enviado: /manus-storage/simulador_0278dc9f.html.
- PENDENTE: linkar seção "Acesso ao simulador" da Home (linha ~497-530) para /simulador (botão "Entrar no simulador"); testes vitest; screenshots; checkpoint; entrega com credenciais.
- Erro dotenv no devserver.log é antigo (antes do pnpm install), servidor está rodando ok.
