import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function GET(request: Request) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!accessToken) return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });

  const { searchParams } = new URL(request.url);

  try {
    return NextResponse.json(
      await api.institutionalPublications.list({
        accessToken,
        page: Number(searchParams.get("page") ?? "1"),
        limit: Number(searchParams.get("limit") ?? "20"),
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nao foi possivel carregar." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!accessToken) return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });

  try {
    return NextResponse.json(
      await api.institutionalPublications.create(await request.json(), { accessToken }),
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nao foi possivel criar." },
      { status: 400 },
    );
  }
}
