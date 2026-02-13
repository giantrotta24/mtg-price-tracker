import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const supabase = createSupabaseRouteClient(request, response);

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { error: "Unable to sign out right now." },
      { status: 400 },
    );
  }

  return response;
}
