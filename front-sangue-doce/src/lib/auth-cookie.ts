export const AUTH_COOKIE_NAME = "sangue_doce_token";

const authCookieSecure = process.env.AUTH_COOKIE_SECURE === "true";

export const authCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax",
  secure: authCookieSecure,
} as const;
