import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/auth-cookie";

const API_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel enviar sua imagem de perfil.";
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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const uploadResponse = await fetch(`${API_URL}/uploads/users/avatar`, {
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    });

    if (!uploadResponse.ok) {
      throw new Error(await uploadResponse.text());
    }

    const payload = (await uploadResponse.json()) as {
      access_token?: string;
      avatarUrl: string;
      bucket: string;
      objectName: string;
      profile?: unknown;
    };
    const response = NextResponse.json(payload);

    if (payload.access_token) {
      response.cookies.set(AUTH_COOKIE_NAME, payload.access_token, authCookieOptions);
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
