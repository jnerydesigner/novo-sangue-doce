import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";
export async function GET() { const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value; if (!token) return NextResponse.json({ message: "Não autenticado." }, { status: 401 }); const response = await fetch(`${API_URL}/invites`, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } }); return NextResponse.json(await response.json(), { status: response.status }); }
