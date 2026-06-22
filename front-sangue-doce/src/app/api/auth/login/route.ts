import { NextResponse } from "next/server";
import { api, type LoginPayload } from "@/lib/api";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth-cookie";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel entrar.";
  }

  try {
    const parsed = JSON.parse(error.message) as {
      message?: string | string[];
    };

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(" ");
    }

    return parsed.message ?? error.message;
  } catch {
    return error.message;
  }
}

export async function POST(request: Request) {
  const payload = (await request.json()) as LoginPayload;
  const loginResponse = await api.auth.login(payload).catch((error: unknown) => {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 401 });
  });

  if (loginResponse instanceof NextResponse) {
    return loginResponse;
  }

  if (!loginResponse?.access_token) {
    return NextResponse.json({ message: "E-mail ou senha invalidos." }, { status: 401 });
  }

  const profile = await api.auth.profile(loginResponse.access_token).catch(() => null);
  const redirectTo = profile?.role === "ADMIN" ? "/admin" : "/dashboard";

  const response = NextResponse.json({ ok: true, redirectTo });
  response.cookies.set(AUTH_COOKIE_NAME, loginResponse.access_token, authCookieOptions);

  return response;
}
