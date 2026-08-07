import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";
const AUTH_COOKIE_NAME = "sangue_doce_token";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Sessao expirada." }, { status: 401 });

  const response = await fetch(`${API_URL}/foods`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.text();
  return new NextResponse(body, { status: response.status, headers: { "Content-Type": "application/json" } });
}
