import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  try {
    return NextResponse.json(
      await api.socialPublications.retry((await params).id, { accessToken }),
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nao foi possivel tentar novamente." },
      { status: 400 },
    );
  }
}
