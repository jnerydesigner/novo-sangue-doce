import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, type CreatePostTagPayload } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel atualizar a tag.";
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

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as CreatePostTagPayload;

  try {
    const tag = await api.posts.updateTag(id, payload, { accessToken });

    return NextResponse.json(tag);
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
