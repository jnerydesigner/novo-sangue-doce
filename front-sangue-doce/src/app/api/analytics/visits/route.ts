import { NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export async function POST(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");

  await fetch(`${API_URL}/analytics/visits`, {
    body: JSON.stringify(await request.json()),
    headers: {
      "Content-Type": "application/json",
      ...(forwardedFor ? { "x-forwarded-for": forwardedFor } : {}),
      ...(realIp ? { "x-real-ip": realIp } : {}),
      ...(userAgent ? { "user-agent": userAgent } : {}),
    },
    method: "POST",
  }).catch(() => null);

  return new NextResponse(null, { status: 204 });
}
