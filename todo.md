# TODO — Simulador integrado + login + painel admin

## Fase 1 — Backend e autenticação
- [x] Fazer upgrade do projeto para web-db-user (backend + banco)
- [x] Criar schema: tabela de usuários do simulador (email, senha hash, ativo) e tabela de auditoria (logins/acessos)
- [x] Implementar login próprio com e-mail/senha (sessão via cookie/JWT)
- [x] Semear conta do administrador (jsfeletrico@gmail.com) com senha inicial

## Fase 2 — Simulador protegido
- [x] Hospedar o HTML do simulador (arquivo enviado) servido apenas para autenticados
- [x] Página /simulador com verificação de login; iframe fullscreen do simulador
- [x] Tela de login no mesmo endereço, com aviso: novos usuários devem contatar o administrador (e-mail pré-preenchido)
- [x] Botão para voltar à tela inicial do site

## Fase 3 — Painel admin
- [x] Painel acessível pelo mesmo endereço (aba/rota interna), visível só para admin
- [x] Criar usuário (e-mail + senha definida pelo admin), ativar/desativar, redefinir senha, excluir
- [x] Auditoria: lista de acessos com data/hora, usuário, evento (login, acesso ao simulador, falha de login)
- [x] Botão de voltar à tela inicial do site
- [x] Contador de usuários (total/ativos) e ordenação por último acesso
- [x] Data de expiração de acesso por usuário (bloqueio automático no login)
- [x] Link "Simulador online" no header e na seção "Acesso ao simulador" da home

## Fase 4 — Testes
- [x] Testar login válido/inválido, usuário desativado
- [x] Testar criação de usuário pelo admin e acesso ao simulador
- [x] Testar registro de auditoria
- [x] Testes vitest (simAuth: senha + sessão JWT) — 9 testes passando
- [x] pnpm check + build + screenshots
- [ ] Checkpoint

## Fase 5 — Entrega
- [ ] Entregar com credenciais do admin e instruções de publicação
