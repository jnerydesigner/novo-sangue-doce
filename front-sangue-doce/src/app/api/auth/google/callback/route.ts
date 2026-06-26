import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth-cookie";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";

export async function GET(request: NextRequest) {
  const accessToken = request.nextUrl.searchParams.get("token");

  if (!accessToken) {
    return NextResponse.redirect(new URL("/login?error=google", siteUrl));
  }

  const profile = await api.auth.profile(accessToken).catch(() => null);

  if (!profile) {
    return NextResponse.redirect(new URL("/login?error=google", siteUrl));
  }

  const redirectTo = profile.passwordSetupRequired
    ? "/dashboard/account/password"
    : profile.role === "ADMIN"
      ? "/admin"
      : "/dashboard";
  const response = NextResponse.redirect(new URL(redirectTo, siteUrl));

  response.cookies.set(AUTH_COOKIE_NAME, accessToken, authCookieOptions);

  return response;
}
