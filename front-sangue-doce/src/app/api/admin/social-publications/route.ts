import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function GET(request: Request) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const publications = await api.socialPublications.list({
      accessToken,
      page: Number(searchParams.get("page") ?? "1"),
      limit: Number(searchParams.get("limit") ?? "24"),
    });

    return NextResponse.json(publications);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Nao foi possivel carregar as publicacoes.",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!accessToken) return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });

  try {
    const body = await request.json();
    return NextResponse.json(await api.socialPublications.generate(body, { accessToken }), {
      status: 202,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nao foi possivel gerar a nova versao." },
      { status: 400 },
    );
  }
}
