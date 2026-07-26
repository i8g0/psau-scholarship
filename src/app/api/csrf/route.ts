import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "csrf-token";
const TOKEN_LENGTH = 32;

function generateToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString("hex");
}

export async function GET() {
  const token = generateToken();

  const response = NextResponse.json({ csrfToken: token });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  return response;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
  };
  const headerToken = request.headers.get("x-csrf-token");
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;

  const submittedToken = body.token || headerToken;

  if (!submittedToken || !cookieToken) {
    return NextResponse.json(
      { error: "CSRF token missing" },
      { status: 403 }
    );
  }

  if (!crypto.timingSafeEqual(Buffer.from(submittedToken), Buffer.from(cookieToken))) {
    return NextResponse.json(
      { error: "CSRF token mismatch" },
      { status: 403 }
    );
  }

  // Generate a fresh token (one-time use)
  const newToken = generateToken();
  const response = NextResponse.json({ csrfToken: newToken, valid: true });

  response.cookies.set(COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
