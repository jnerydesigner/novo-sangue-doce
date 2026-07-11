import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

export async function GET(_request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!accessToken) return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });

  try {
    return NextResponse.json(await api.postBanners.status((await params).jobId, { accessToken }));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Nao foi possivel acompanhar o banner." },
      { status: 400 },
    );
  }
}
