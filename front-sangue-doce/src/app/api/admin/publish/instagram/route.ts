import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function POST(request: Request) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { postId?: string; socialPublicationId?: string };

    if (!body.postId && !body.socialPublicationId) {
      return NextResponse.json(
        { message: "A materia ou publicacao social e obrigatoria." },
        { status: 400 },
      );
    }

    return NextResponse.json(await api.socialPublications.publishInstagram(body, { accessToken }));
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Nao foi possivel publicar no Instagram.",
      },
      { status: 400 },
    );
  }
}
