import { NextResponse } from "next/server";
import { api, type CreateUserPayload } from "@/lib/api";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel criar sua conta.";
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
  const payload = (await request.json()) as CreateUserPayload;
  const user = await api.users.create(payload).catch((error: unknown) => {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  });

  if (user instanceof NextResponse) {
    return user;
  }

  return NextResponse.json(user);
}
