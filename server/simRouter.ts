/**
 * Router tRPC do sistema do simulador: login por e-mail/senha,
 * gestão de usuários pelo admin e auditoria.
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  createSessionToken,
  getSessionFromRequest,
  setSimSessionCookie,
  clearSimSessionCookie,
  hashPassword,
  verifyPassword,
  getClientInfo,
  type SimSession,
} from "./simAuth";
import {
  getSimUserByEmail,
  getSimUserById,
  listSimUsers,
  createSimUser,
  updateSimUser,
  deleteSimUser,
  touchSimUserLogin,
  logAudit,
  listAudit,
} from "./simDb";

async function requireSession(req: any): Promise<SimSession> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Faça login para continuar" });
  }
  const user = await getSimUserById(session.uid);
  if (!user || user.ativo !== 1) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Conta desativada ou inexistente" });
  }
  return { uid: user.id, email: user.email, role: user.role };
}

async function requireAdmin(req: any): Promise<SimSession> {
  const session = await requireSession(req);
  if (session.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao administrador" });
  }
  return session;
}

export const simRouter = router({
  /** Sessão atual (null se não logado) */
  me: publicProcedure.query(async ({ ctx }) => {
    const session = await getSessionFromRequest(ctx.req);
    if (!session) return null;
    const user = await getSimUserById(session.uid);
    if (!user || user.ativo !== 1) return null;
    return { id: user.id, email: user.email, nome: user.nome, role: user.role };
  }),

  login: publicProcedure
    .input(z.object({ email: z.string().email("E-mail inválido"), password: z.string().min(1, "Informe a senha") }))
    .mutation(async ({ ctx, input }) => {
      const { ip, userAgent } = getClientInfo(ctx.req);
      const email = input.email.toLowerCase().trim();
      const user = await getSimUserByEmail(email);

      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        await logAudit({ email, evento: "login_falha", detalhe: "E-mail ou senha incorretos", ip, userAgent });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "E-mail ou senha incorretos" });
      }
      if (user.ativo !== 1) {
        await logAudit({ userId: user.id, email, evento: "login_bloqueado", detalhe: "Conta desativada", ip, userAgent });
        throw new TRPCError({ code: "FORBIDDEN", message: "Conta desativada. Entre em contato com o administrador." });
      }
      if (user.expiraEm && user.expiraEm.getTime() < Date.now()) {
        await logAudit({ userId: user.id, email, evento: "login_bloqueado", detalhe: "Acesso expirado", ip, userAgent });
        throw new TRPCError({ code: "FORBIDDEN", message: "Seu acesso expirou. Entre em contato com o administrador para renovar." });
      }

      const token = await createSessionToken({ uid: user.id, email: user.email, role: user.role });
      setSimSessionCookie(ctx.req, ctx.res, token);
      await touchSimUserLogin(user.id);
      await logAudit({ userId: user.id, email, evento: "login_ok", ip, userAgent });

      return { id: user.id, email: user.email, nome: user.nome, role: user.role };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const session = await getSessionFromRequest(ctx.req);
    if (session) {
      const { ip, userAgent } = getClientInfo(ctx.req);
      await logAudit({ userId: session.uid, email: session.email, evento: "logout", ip, userAgent });
    }
    clearSimSessionCookie(ctx.req, ctx.res);
    return { success: true } as const;
  }),

  /** Registra acesso ao simulador (chamado quando o iframe carrega) */
  registrarAcesso: publicProcedure.mutation(async ({ ctx }) => {
    const session = await requireSession(ctx.req);
    const { ip, userAgent } = getClientInfo(ctx.req);
    await logAudit({ userId: session.uid, email: session.email, evento: "simulador_acesso", ip, userAgent });
    return { success: true } as const;
  }),

  admin: router({
    listarUsuarios: publicProcedure.query(async ({ ctx }) => {
      await requireAdmin(ctx.req);
      const users = await listSimUsers();
      return {
        total: users.length,
        ativos: users.filter(u => u.ativo === 1).length,
        usuarios: users.map(u => ({
          id: u.id,
          email: u.email,
          nome: u.nome,
          ativo: u.ativo === 1,
          role: u.role,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
          expiraEm: u.expiraEm,
          expirado: Boolean(u.expiraEm && u.expiraEm.getTime() < Date.now()),
        })),
      };
    }),

    criarUsuario: publicProcedure
      .input(
        z.object({
          email: z.string().email("E-mail inválido"),
          nome: z.string().max(160).optional(),
          password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
          expiraEm: z.date().nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const admin = await requireAdmin(ctx.req);
        const email = input.email.toLowerCase().trim();
        const existing = await getSimUserByEmail(email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Já existe um usuário com esse e-mail" });
        }
        const user = await createSimUser({
          email,
          nome: input.nome?.trim() || null,
          passwordHash: hashPassword(input.password),
          ativo: 1,
          role: "user",
          expiraEm: input.expiraEm ?? null,
        });
        const { ip, userAgent } = getClientInfo(ctx.req);
        await logAudit({
          userId: admin.uid,
          email: admin.email,
          evento: "admin_criar_usuario",
          detalhe: `Criou o usuário ${email}`,
          ip,
          userAgent,
        });
        return { id: user!.id, email: user!.email };
      }),

    alternarAtivo: publicProcedure
      .input(z.object({ id: z.number(), ativo: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const admin = await requireAdmin(ctx.req);
        const target = await getSimUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
        if (target.role === "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Não é possível desativar o administrador" });
        }
        await updateSimUser(input.id, { ativo: input.ativo ? 1 : 0 });
        const { ip, userAgent } = getClientInfo(ctx.req);
        await logAudit({
          userId: admin.uid,
          email: admin.email,
          evento: input.ativo ? "admin_ativar_usuario" : "admin_desativar_usuario",
          detalhe: `${input.ativo ? "Ativou" : "Desativou"} o usuário ${target.email}`,
          ip,
          userAgent,
        });
        return { success: true } as const;
      }),

    redefinirSenha: publicProcedure
      .input(z.object({ id: z.number(), password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres") }))
      .mutation(async ({ ctx, input }) => {
        const admin = await requireAdmin(ctx.req);
        const target = await getSimUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
        await updateSimUser(input.id, { passwordHash: hashPassword(input.password) });
        const { ip, userAgent } = getClientInfo(ctx.req);
        await logAudit({
          userId: admin.uid,
          email: admin.email,
          evento: "admin_redefinir_senha",
          detalhe: `Redefiniu a senha de ${target.email}`,
          ip,
          userAgent,
        });
        return { success: true } as const;
      }),

    excluirUsuario: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const admin = await requireAdmin(ctx.req);
        const target = await getSimUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
        if (target.role === "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Não é possível excluir o administrador" });
        }
        await deleteSimUser(input.id);
        const { ip, userAgent } = getClientInfo(ctx.req);
        await logAudit({
          userId: admin.uid,
          email: admin.email,
          evento: "admin_excluir_usuario",
          detalhe: `Excluiu o usuário ${target.email}`,
          ip,
          userAgent,
        });
        return { success: true } as const;
      }),

    definirExpiracao: publicProcedure
      .input(z.object({ id: z.number(), expiraEm: z.date().nullable() }))
      .mutation(async ({ ctx, input }) => {
        const admin = await requireAdmin(ctx.req);
        const target = await getSimUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
        await updateSimUser(input.id, { expiraEm: input.expiraEm });
        const { ip, userAgent } = getClientInfo(ctx.req);
        await logAudit({
          userId: admin.uid,
          email: admin.email,
          evento: "admin_definir_expiracao",
          detalhe: input.expiraEm
            ? `Definiu expiração de ${target.email} para ${input.expiraEm.toLocaleDateString("pt-BR")}`
            : `Removeu a expiração de ${target.email}`,
          ip,
          userAgent,
        });
        return { success: true } as const;
      }),

    auditoria: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(500).optional() }).optional())
      .query(async ({ ctx, input }) => {
        await requireAdmin(ctx.req);
        return listAudit(input?.limit ?? 200);
      }),
  }),
});
