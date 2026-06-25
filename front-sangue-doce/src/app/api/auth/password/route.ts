import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, type SetPasswordPayload } from "@/lib/api";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth-cookie";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel criar sua senha.";
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

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Sessao expirada." }, { status: 401 });
  }

  const payload = (await request.json()) as SetPasswordPayload;
  const updateResponse = await api.auth.setPassword(payload, accessToken).catch((error) => {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  });

  if (updateResponse instanceof NextResponse) {
    return updateResponse;
  }

  const response = NextResponse.json({ ok: true, profile: updateResponse.profile });
  response.cookies.set(AUTH_COOKIE_NAME, updateResponse.access_token, authCookieOptions);

  return response;
}
