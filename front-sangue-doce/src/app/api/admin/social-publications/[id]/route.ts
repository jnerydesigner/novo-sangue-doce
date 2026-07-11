import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, type SocialNetwork } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      description: string;
      socialNetworks: SocialNetwork[];
    };
    return NextResponse.json(
      await api.socialPublications.update((await params).id, body, { accessToken }),
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nao foi possivel salvar a revisao." },
      { status: 400 },
    );
  }
}
