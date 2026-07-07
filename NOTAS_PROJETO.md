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

## PROGRESSO (fase solicitações de acesso — em andamento)
- Fase atual do plano: 2 (formulário + aba admin). Checkpoint anterior estável: acce4479 (publicado em jsfeletrico.com).
- Schema: tabela simAccessRequests (nome, email, mensagem, status pendente/aprovada/dispensada, ip, createdAt) migrada ok.
- simDb.ts: createAccessRequest, listAccessRequests (pendentes primeiro), getAccessRequestById, updateAccessRequestStatus, hasRecentRequestFromIp (anti-spam 10min), hasPendingRequestForEmail.
- simRouter.ts: sim.solicitarAcesso (público, anti-spam, notifyOwner via server/_core/notification) + sim.admin.listarSolicitacoes {pendentes, solicitacoes}, aprovarSolicitacao {id, password, expiraEm?} (cria simUser), dispensarSolicitacao {id}. Eventos auditoria: solicitacao_acesso, admin_aprovar_solicitacao, admin_dispensar_solicitacao (labels já no EVENTO_LABEL do frontend).
- Simulador.tsx: FormSolicitarAcesso adicionado à TelaLogin (botão "Solicitar acesso" + fallback e-mail). FEITO.
- PENDENTE: aba "Solicitações" no painel admin (adicionar à lista `abas` tipo Aba="solicitacoes", componente PainelSolicitacoes com aprovar [prompt senha+data] / dispensar, badge de pendentes no botão da aba); testes curl do fluxo; vitest; screenshot; checkpoint; entrega.
- Credencial admin: jsfeletrico@gmail.com / JSF-d9c967e2 (em /home/ubuntu/.jsf_admin_cred).

## Fase 14 — Retrato de Joelson na página Sobre (jul/2026)
- Usuário enviou 2 fotos suas (treinamento SENAI): retrato e corpo inteiro; ambas melhoradas (HD).
- Retrato alinhado (capacete/óculos/pescoço retos, enquadramento da cintura pra cima):
  /home/ubuntu/webdev-static-assets/foto_joelson_retrato_alinhado.png
- Storage path no site: /manus-storage/foto_joelson_retrato_alinhado_8892e133.png
- Sobre.tsx: seção "Quem é Joelson" agora mostra a foto (substituiu PRINT_DIAGRAMA_COMPLETO; import removido); legenda sobre treinamento prático.
- pnpm check + build ok. Falta: screenshot /sobre, checkpoint, entrega. [CONCLUÍDO: checkpoint b25a4535]

## Fases 15–20 (jul/2026) — fotos e destaque da página Sobre
- F15: foto corpo inteiro HD adicionada à trajetória (depois removida na F19 a pedido do usuário).
- F16/F17: foto sala de controle — 1ª versão fictícia rejeitada; versão final REAL retocada
  (só limpeza de sujeira, remoção de logos, qualidade, rosto endireitado):
  storage /manus-storage/foto_joelson_sala_controle_real_5935c9ec.png
  (local: /home/ubuntu/webdev-static-assets/foto_joelson_sala_controle_real.png).
- F18: componente client/src/components/Lightbox.tsx (LightboxImage: hover "Ampliar", modal tela cheia,
  fecha X/ESC/clique fora, keyframes lightbox-fade/zoom no index.css). Aplicado em Sobre.tsx:
  retrato, sala de controle e PRINT_BIBLIOTECA.
- F19: trajetória agora tem só a foto da sala de controle (coluna esquerda sticky).
- Checkpoints: b25a4535 (F14 retrato), a7f4bc51 (F15+16), 6cb20d13 (F17 real), d41a302b (F18+19). Publicado.
- F20 (em andamento): destacar Sobre na home. Link "Sobre" JÁ EXISTE no nav do header (linha ~257 Home.tsx)
  e no rodapé (~611). FALTA: seção "Conheça o desenvolvedor" no início da home — inserir entre o banner de
  marca (seção ~linha 364-372) e "Como funciona" (~375), com retrato
  /manus-storage/foto_joelson_retrato_alinhado_8892e133.png + botão para /sobre.
- Home.tsx usa fadeUp, jsf-panel, container; ícones lucide; motion do framer-motion.
- F20 CONCLUÍDA (checkpoint aeb3f560): seção "Conheça o desenvolvedor" na home entre banner e Como funciona
  (card clicável p/ /sobre com retrato circular + botão "Ver a história").
- F21 CONCLUÍDA: seção FAQ na home (id="faq", accordion shadcn, 8 perguntas no array FAQ ~linha 190 Home.tsx),
  link "FAQ" no nav, JSON-LD FAQPage via hook useFaqJsonLd. Entre "Acesso ao simulador" e CTA final. Checkpoint d2b9a82f.
- F22 CONCLUÍDA (checkpoint 07ef775b): blockquote "Criei o app que eu queria ter quando comecei." na seção do desenvolvedor.
- F23 CONCLUÍDA (checkpoint eea15694): botão "Acesse o simulador online" (ciano, Zap) no hero, link /simulador.
- F24 CONCLUÍDA: simulador atualizado — novo HTML jsfeletrico1.html (10207 linhas, v115.1) com icone.png
  substituído por /manus-storage/icone_app_cdd01151.png; storage key nova simulador_novo_5ea4e836.html
  em server/simuladorRoute.ts (antiga: simulador_0278dc9f.html). Testado: login admin + GET /api/simulador HTTP 200.
  Checkpoint 54afc985. Publicado.

## Fase 25 (em andamento) — Vinheta animada EM CÓDIGO após login do simulador
- Usuário quer: ao apertar "Entrar" e login ok, vinheta de ~2-3s FEITA EM CÓDIGO (não vídeo/foto):
  raios elétricos azuis/brancos cruzando a tela + "JSF Elétrico" (JSF branco itálico bold, "Elétrico" ciano neon
  itálico com glow) + diagrama ladder animado embaixo (KM1, KT1 1.5s, KT2 2.5s, H1-H3 acendendo em sequência,
  pontos de corrente percorrendo linhas verdes) + "Seja bem-vindo" abaixo do diagrama + som de descarga
  elétrica via Web Audio API. SEM: frase do desenvolvedor, Play Store, endereço do site.
  Estilo: fundo azul-marinho quase preto, bordas com pulso vermelho (esq) e azul (dir), estilo do vídeo de referência
  (análise completa em /home/ubuntu/video_84575e90-77cf-11f1-99c2-b9b2f1c30b7b_analysis_20260707_202813.md).
- Integração: client/src/pages/Simulador.tsx — TelaLogin (linha ~168) tem onSuccess -> onLogged() ->
  utils.sim.me.invalidate() (linha ~955). Plano: estado mostrarVinheta no componente principal (linha ~831),
  ativado no onLogged; overlay fullscreen z-alto por ~3s antes de exibir VisualizadorSimulador (iframe /api/simulador).
  Criar componente client/src/components/VinhetaSimulador.tsx com onFim callback.
- Atenção: som só pode tocar após gesto do usuário (clique em Entrar conta como gesto — ok Web Audio).
- F25 CONCLUÍDA: VinhetaSimulador.tsx criado (raios SVG, título neon, diagrama ladder animado, SEJA BEM-VINDO,
  som Web Audio: estalo + zap + pulsos graves + hum; DURACAO_MS=3200). prepararAudioVinheta() exportado e chamado
  no onSubmit do login (user activation). CSS: bloco "Vinheta do simulador" no fim do index.css.
  Integração: estado mostrarVinheta no Simulador(), ativado no onLogged. E2E testado no navegador: login admin ->
  vinheta com raios/título/diagrama/bem-vindo -> simulador (tela inicial própria v115.7 com botão Entrar) OK.
