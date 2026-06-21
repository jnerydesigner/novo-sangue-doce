export const AUTH_COOKIE_NAME = "sangue_doce_token";

export const authCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;
