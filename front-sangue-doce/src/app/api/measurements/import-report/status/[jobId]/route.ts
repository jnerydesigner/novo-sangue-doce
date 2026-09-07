import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3011";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel consultar o status da importacao.";
  }

  try {
    const parsed = JSON.parse(error.message) as {
      message?: string | string[];
    };

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(" ");
    }

    return parsed.message ?? error.message;
  } catch {
    return error.message;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const accessToken = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const cookieHeader = request.headers.get("cookie");

  if (!accessToken && !cookieHeader) {
    return NextResponse.json({ message: "Sessao expirada." }, { status: 401 });
  }

  try {
    const { jobId } = await context.params;
    const response = await fetch(
      `${API_URL}/measurements/upload/report/measurement/status/${jobId}`,
      {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error) },
      { status: 400 },
    );
  }
}
