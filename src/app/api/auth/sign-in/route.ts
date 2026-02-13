import { NextRequest, NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/env";
import { createSupabaseRouteClient } from "@/lib/supabase/route";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseRouteClient(request, response);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: "Unable to send magic link right now." },
      { status: 400 },
    );
  }

  return response;
}
