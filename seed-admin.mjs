/**
 * Cria (ou atualiza) a conta do administrador do simulador.
 * Uso: node seed-admin.mjs <email> <senha>
 */
import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import mysql from "mysql2/promise";

const email = (process.argv[2] || "jsfeletrico@gmail.com").toLowerCase().trim();
const senha = process.argv[3];

if (!senha || senha.length < 6) {
  console.error("Informe a senha (mínimo 6 caracteres): node seed-admin.mjs <email> <senha>");
  process.exit(1);
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(senha, salt, 64).toString("hex");
const passwordHash = `${salt}:${hash}`;

const conn = await mysql.createConnection(process.env.DATABASE_URL);

await conn.execute(
  `INSERT INTO simUsers (email, nome, passwordHash, ativo, role)
   VALUES (?, ?, ?, 1, 'admin')
   ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash), role = 'admin', ativo = 1`,
  [email, "Administrador", passwordHash]
);

console.log(`Admin configurado: ${email}`);
await conn.end();
