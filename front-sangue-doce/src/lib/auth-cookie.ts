export const AUTH_COOKIE_NAME = "sangue_doce_token";

const authCookieSecure = process.env.AUTH_COOKIE_SECURE === "true";
const defaultSessionMaxAge = 60 * 60 * 8;
const legacySessionMaxAge = 60 * 60 * 24 * 7;
const rememberedSessionMaxAge = 60 * 60 * 24 * 30;

export function getAuthCookieOptions(rememberMe = false) {
  return {
    httpOnly: true,
    maxAge: rememberMe ? rememberedSessionMaxAge : defaultSessionMaxAge,
    path: "/",
    sameSite: "lax",
    secure: authCookieSecure,
  } as const;
}

export const authCookieOptions = {
  httpOnly: true,
  maxAge: legacySessionMaxAge,
  path: "/",
  sameSite: "lax",
  secure: authCookieSecure,
} as const;
