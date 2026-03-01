import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: number; // ms timestamp
  code_verifier?: string; // transient PKCE field
  oauth_state?: string; // transient CSRF field
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "change_me_to_a_random_32_char_hex_string_here!",
  cookieName: "pixelai_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 90, // 90 days (matches refresh token lifetime)
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
