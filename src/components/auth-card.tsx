"use client";

import { useState } from "react";

const hasPublicSupabaseEnv =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function AuthCard() {
  const initialStatus =
    typeof window === "undefined"
      ? ""
      : (() => {
          const authStatus = new URLSearchParams(window.location.search).get(
            "auth",
          );

          if (authStatus === "success") {
            return "Magic link verified. You are now signed in.";
          }

          if (authStatus === "error") {
            return "Magic link verification failed. Please try again.";
          }

          return "";
        })();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string>(initialStatus);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      setStatus("Enter an email address.");
      return;
    }

    setLoading(true);
    setStatus("");

    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (response.ok) {
      setStatus("Check your inbox for the magic link.");
      setEmail("");
    } else {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setStatus(payload?.error ?? "Unable to send magic link.");
    }

    setLoading(false);
  }

  if (!hasPublicSupabaseEnv) {
    return (
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="text-base font-semibold">Supabase auth not configured</h2>
        <p className="mt-2">
          Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
          enable magic link sign-in.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Authentication</h2>
      <p className="mt-1 text-sm text-slate-600">
        Slice 1 foundation uses Supabase magic link auth.
      </p>

      <form className="mt-4 space-y-3" onSubmit={handleMagicLink}>
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-900 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Send magic link
        </button>
      </form>

      {status ? <p className="mt-3 text-sm text-slate-700">{status}</p> : null}
    </section>
  );
}
