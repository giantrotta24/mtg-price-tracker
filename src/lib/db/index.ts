import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

const { DATABASE_URL } = getServerEnv();

const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

const sql =
  globalForDb.sql ??
  postgres(DATABASE_URL, {
    max: process.env.NODE_ENV === "development" ? 1 : 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export const db = drizzle(sql, { schema });

export type Database = typeof db;
