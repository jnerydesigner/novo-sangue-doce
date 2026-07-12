import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, type CreateRecipePayload } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

function message(error: unknown) {
  if (!(error instanceof Error)) return "Nao foi possivel atualizar a receita.";
  try {
    const parsed = JSON.parse(error.message) as { message?: string | string[] };
    return Array.isArray(parsed.message)
      ? parsed.message.join(" ")
      : (parsed.message ?? error.message);
  } catch {
    return error.message;
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  try {
    return NextResponse.json(
      await api.recipes.update((await params).id, (await request.json()) as CreateRecipePayload, {
        accessToken: token,
      }),
    );
  } catch (error) {
    return NextResponse.json({ message: message(error) }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  try {
    return NextResponse.json(await api.recipes.delete((await params).id, { accessToken: token }));
  } catch (error) {
    return NextResponse.json({ message: message(error) }, { status: 400 });
  }
}
