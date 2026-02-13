import { NextRequest, NextResponse } from "next/server";

import { createSupabaseRouteClient } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const redirectUrl = new URL("/", request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (!code) {
    redirectUrl.searchParams.set("auth", "error");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createSupabaseRouteClient(request, response);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  redirectUrl.searchParams.set("auth", error ? "error" : "success");
  return NextResponse.redirect(redirectUrl, {
    headers: response.headers,
  });
}
