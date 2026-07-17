import { NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const response = await fetch(`${API_URL}/newsletter/subscriptions/confirm?token=${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({ message: "Não foi possível confirmar a assinatura." }));
  return NextResponse.json(data, { status: response.status });
}
