/**
 * Helpers de banco para o sistema do simulador:
 * usuários (simUsers) e auditoria (simAuditLog).
 */
import { desc, eq, sql } from "drizzle-orm";
import {
  simUsers,
  simAuditLog,
  type InsertSimUser,
  type InsertSimAuditEntry,
} from "../drizzle/schema";
import { getDb } from "./db";

/* ---------- usuários ---------- */

export async function listSimUsers() {
  const db = await getDb();
  if (!db) return [];
  // Ordena pelo último acesso (mais recente primeiro); sem login vai para o fim
  return db
    .select()
    .from(simUsers)
    .orderBy(sql`${simUsers.lastLoginAt} IS NULL`, desc(simUsers.lastLoginAt));
}

export async function getSimUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(simUsers)
    .where(eq(simUsers.email, email.toLowerCase().trim()))
    .limit(1);
  return rows[0];
}

export async function getSimUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(simUsers).where(eq(simUsers.id, id)).limit(1);
  return rows[0];
}

export async function createSimUser(user: InsertSimUser) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(simUsers).values({ ...user, email: user.email.toLowerCase().trim() });
  return getSimUserByEmail(user.email);
}

export async function updateSimUser(id: number, set: Partial<InsertSimUser>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(simUsers).set(set).where(eq(simUsers.id, id));
}

export async function deleteSimUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(simUsers).where(eq(simUsers.id, id));
}

export async function touchSimUserLogin(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(simUsers).set({ lastLoginAt: new Date() }).where(eq(simUsers.id, id));
}

/* ---------- auditoria ---------- */

export async function logAudit(entry: InsertSimAuditEntry) {
  try {
    const db = await getDb();
    if (!db) return;
    await db.insert(simAuditLog).values(entry);
  } catch (error) {
    console.error("[Auditoria] Falha ao registrar evento:", error);
  }
}

export async function listAudit(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(simAuditLog).orderBy(desc(simAuditLog.createdAt)).limit(limit);
}
