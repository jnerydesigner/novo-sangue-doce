import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth-cookie";

export async function GET(request: NextRequest) {
  const accessToken = request.nextUrl.searchParams.get("token");

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }

  const profile = await api.auth.profile(accessToken).catch(() => null);

  if (!profile) {
    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }

  const redirectTo = profile.passwordSetupRequired
    ? "/dashboard/account/password"
    : profile.role === "ADMIN"
      ? "/admin"
      : "/dashboard";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  response.cookies.set(AUTH_COOKIE_NAME, accessToken, authCookieOptions);

  return response;
}
