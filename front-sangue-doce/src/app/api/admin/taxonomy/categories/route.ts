import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, type CreatePostCategoryPayload } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel criar a categoria.";
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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const payload = (await request.json()) as CreatePostCategoryPayload;

  try {
    const category = await api.posts.createCategory(payload, { accessToken });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
