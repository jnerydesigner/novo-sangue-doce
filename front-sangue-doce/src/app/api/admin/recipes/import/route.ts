import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function POST(request: Request) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  const { url } = (await request.json()) as { url?: string };
  try {
    return NextResponse.json(await api.recipes.importFromUrl(url ?? "", { accessToken: token }));
  } catch (error) {
    let message = error instanceof Error ? error.message : "Nao foi possivel importar a receita.";
    try {
      const parsed = JSON.parse(message) as { message?: string };
      message = parsed.message ?? message;
    } catch {}
    return NextResponse.json({ message }, { status: 400 });
  }
}
