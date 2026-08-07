import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";
export async function GET() {
  const token = (await cookies()).get("sangue_doce_token")?.value;
  if (!token) return NextResponse.json({ message: "Sessao expirada." }, { status: 401 });
  const response = await fetch(`${API_URL}/food-consumptions/today`, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json" } });
}
