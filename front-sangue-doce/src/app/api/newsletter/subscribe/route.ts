import { NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export async function POST(request: Request) {
  const response = await fetch(`${API_URL}/newsletter/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  });
  const data = await response.json().catch(() => ({ message: "Não foi possível concluir a inscrição." }));
  return NextResponse.json(data, { status: response.status });
}
