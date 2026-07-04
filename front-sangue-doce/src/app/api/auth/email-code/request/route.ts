import { NextResponse } from "next/server";
import { api, type RequestEmailLoginCodePayload } from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel enviar o codigo.";
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

export async function POST(request: Request) {
  const payload = (await request.json()) as RequestEmailLoginCodePayload;
  const response = await api.auth.requestEmailCode(payload).catch((error: unknown) => {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  });

  if (response instanceof NextResponse) {
    return response;
  }

  return NextResponse.json({ ok: true });
}
