import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const API_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel enviar a imagem da materia.";
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
    const response = await fetch(`${API_URL}/uploads/post/images`, {
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
