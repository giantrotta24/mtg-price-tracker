const requiredServerEnv = [
  "DATABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

const requiredPublicEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type ServerEnvKey = (typeof requiredServerEnv)[number];
type PublicEnvKey = (typeof requiredPublicEnv)[number];

function readEnv<K extends string>(keys: readonly K[]): Record<K, string> {
  const entries = keys.map((key) => {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }

    return [key, value] as const;
  });

  return Object.fromEntries(entries) as Record<K, string>;
}

export function getServerEnv(): Record<ServerEnvKey, string> {
  return readEnv(requiredServerEnv);
}

export function getPublicEnv(): Record<PublicEnvKey, string> {
  return readEnv(requiredPublicEnv);
}

export function hasPublicSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
