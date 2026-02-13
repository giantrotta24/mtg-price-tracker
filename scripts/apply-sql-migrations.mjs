import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL");
}

const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");

const sql = postgres(databaseUrl, { max: 1, prepare: false });

async function ensureMigrationsTable() {
  await sql`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `;
}

async function getAppliedMigrations() {
  const rows = await sql`select id from schema_migrations`;
  return new Set(rows.map((row) => row.id));
}

async function applyMigration(filename) {
  const fullPath = path.join(migrationsDir, filename);
  const contents = await fs.readFile(fullPath, "utf8");

  await sql.begin(async (tx) => {
    await tx.unsafe(contents);
    await tx`insert into schema_migrations (id) values (${filename})`;
  });
}

async function main() {
  await ensureMigrationsTable();

  const files = (await fs.readdir(migrationsDir))
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const applied = await getAppliedMigrations();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip ${file}`);
      continue;
    }

    console.log(`apply ${file}`);
    await applyMigration(file);
  }

  console.log("done");
}

try {
  await main();
} finally {
  await sql.end();
}
