import type { AuthProfile, LoginPayload, UserRole } from "./api";

const API_URL =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";
const FRONTEND_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.FRONTEND_URL ?? "http://localhost:3010";

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

function splitCombinedSetCookieHeader(header: string | null) {
  if (!header) {
    return [];
  }

  return header.split(/,(?=\s*[^;,]+=)/);
}

export function getSetCookieHeaders(headers: Headers) {
  const setCookieHeaders = (headers as HeadersWithSetCookie).getSetCookie?.();

  if (setCookieHeaders?.length) {
    return setCookieHeaders;
  }

  return splitCombinedSetCookieHeader(headers.get("set-cookie"));
}

export function appendSetCookieHeaders(targetHeaders: Headers, sourceHeaders: Headers) {
  for (const cookie of getSetCookieHeaders(sourceHeaders)) {
    targetHeaders.append("set-cookie", cookie);
  }
}

function getOriginHeader(origin: string | null) {
  return origin ?? FRONTEND_URL;
}

export async function signInWithBetterAuth(payload: LoginPayload, origin: string | null) {
  return fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: getOriginHeader(origin),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}

export async function signOutWithBetterAuth(cookieHeader: string | null, origin: string | null) {
  return fetch(`${API_URL}/api/auth/sign-out`, {
    method: "POST",
    headers: {
      Origin: getOriginHeader(origin),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });
}

type BetterAuthUser = {
  avatarUrl?: string | null;
  birthDate?: string | null;
  createdAt?: string | null;
  diabetesType?: string | null;
  email?: string | null;
  id?: string | null;
  image?: string | null;
  name?: string | null;
  role?: string | null;
  updatedAt?: string | null;
};

type BetterAuthSessionResponse = {
  user?: BetterAuthUser | null;
} | null;

function normalizeRole(role: string | null | undefined): UserRole {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

export function mapBetterAuthSessionToProfile(
  session: BetterAuthSessionResponse,
): AuthProfile | null {
  const user = session?.user;

  if (!user?.id || !user.email) {
    return null;
  }

  const role = normalizeRole(user.role);
  const now = new Date().toISOString();

  return {
    sub: user.id,
    name: user.name ?? user.email,
    email: user.email,
    avatarUrl: user.avatarUrl ?? user.image ?? undefined,
    birthDate: user.birthDate ?? undefined,
    diabetesType: user.diabetesType ?? "UNKNOWN",
    role,
    roles: [role],
    passwordSetupRequired: false,
    createdAt: user.createdAt ?? now,
    updatedAt: user.updatedAt ?? now,
  };
}

export async function getBetterAuthSession(cookieHeader: string | null) {
  return fetch(`${API_URL}/api/auth/get-session?disableRefresh=true`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: "no-store",
  });
}

export async function getBetterAuthProfile(cookieHeader: string | null) {
  const response = await getBetterAuthSession(cookieHeader);

  if (!response.ok) {
    return null;
  }

  const session = (await response.json()) as BetterAuthSessionResponse;

  return mapBetterAuthSessionToProfile(session);
}
