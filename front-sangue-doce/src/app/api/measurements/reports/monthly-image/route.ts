import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export async function GET(request: NextRequest) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Sessao expirada." }, { status: 401 });
  const response = await fetch(`${API_URL}/measurements/reports/monthly.png?${request.nextUrl.searchParams}`, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) return NextResponse.json({ message: "Nao foi possivel gerar a imagem." }, { status: response.status });
  return new NextResponse(await response.arrayBuffer(), { headers: { "Content-Type": "image/png", "Content-Disposition": response.headers.get("Content-Disposition") ?? 'attachment; filename="relatorio-glicemia.png"' } });
}
