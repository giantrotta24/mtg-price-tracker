import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const supabase = createSupabaseRouteClient(request, response);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json(
      { authenticated: false, email: null },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      authenticated: Boolean(user),
      email: user?.email ?? null,
    },
    {
      status: 200,
      headers: response.headers,
    },
  );
}
