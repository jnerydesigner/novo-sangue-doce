import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

async function proxy(request?: Request) {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  try {
    const response = await fetch(`${API_URL}/short-links`, {
      method: request ? "POST" : "GET",
      headers: { Authorization: `Bearer ${token}`, ...(request ? { "Content-Type": "application/json" } : {}) },
      ...(request ? { body: await request.text() } : {}),
      cache: "no-store",
    });
    return NextResponse.json(await response.json(), { status: response.status });
  } catch {
    return NextResponse.json({ message: "Não foi possível acessar o serviço de links." }, { status: 502 });
  }
}

export async function GET() { return proxy(); }
export async function POST(request: Request) { return proxy(request); }
