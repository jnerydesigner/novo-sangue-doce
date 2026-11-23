import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[A-Za-z0-9_-]{11}$/.test(code)) return new Response("Link não encontrado.", { status: 404 });
  try {
    const cookieName = `short_link_${code}`;
    const alreadyVisited = request.cookies.has(cookieName);
    const query = new URLSearchParams();
    if (alreadyVisited) query.set("count", "0");
    if (!alreadyVisited && process.env.SHORT_LINK_GEO_PROVIDER === "cloudflare") {
      const country = request.headers.get("cf-ipcountry")?.toUpperCase();
      const region = request.headers.get("cf-region");
      if (country) query.set("country", country);
      if (region) query.set("region", region);
    }
    const response = await fetch(`${API_URL}/short-links/${encodeURIComponent(code)}?${query}`, { cache: "no-store" });
    if (response.status === 404) return new Response("Link não encontrado.", { status: 404 });
    if (!response.ok) return new Response("Não foi possível acessar o link.", { status: 502 });
    const data: { url: string } = await response.json();
    const destination = new URL(data.url);
    if (!["https:", "http:"].includes(destination.protocol)) throw new Error("Destino inválido");
    const redirect = NextResponse.redirect(destination, 302);
    redirect.headers.set("Cache-Control", "no-store");
    redirect.headers.set("Referrer-Policy", "no-referrer");
    if (!alreadyVisited) {
      redirect.cookies.set(cookieName, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path: `/l/${code}`,
      });
    }
    return redirect;
  } catch {
    return new Response("Não foi possível acessar o link.", { status: 502 });
  }
}
