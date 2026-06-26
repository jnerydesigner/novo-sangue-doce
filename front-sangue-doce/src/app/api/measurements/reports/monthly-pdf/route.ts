import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3011";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Sessao expirada." }, { status: 401 });
  }

  const searchParams = new URLSearchParams(request.nextUrl.searchParams);
  const response = await fetch(`${API_URL}/measurements/reports/monthly.pdf?${searchParams}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Nao foi possivel gerar o relatorio." },
      { status: response.status },
    );
  }

  const pdf = await response.arrayBuffer();

  return new NextResponse(pdf, {
    headers: {
      "Content-Disposition":
        response.headers.get("Content-Disposition") ??
        'attachment; filename="relatorio-glicemia.pdf"',
      "Content-Type": "application/pdf",
    },
  });
}
