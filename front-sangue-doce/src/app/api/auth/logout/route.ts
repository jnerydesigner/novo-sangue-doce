import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { appendSetCookieHeaders, signOutWithBetterAuth } from "@/lib/better-auth-server";

export async function POST(request: Request) {
  const betterAuthResponse = await signOutWithBetterAuth(
    request.headers.get("cookie"),
    request.headers.get("origin"),
  ).catch(() => null);
  const response = NextResponse.json({ ok: true });

  if (betterAuthResponse) {
    appendSetCookieHeaders(response.headers, betterAuthResponse.headers);
  }

  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}
