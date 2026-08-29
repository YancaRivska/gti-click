import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "gti-click-admin";
const ADMIN_SESSION_DURATION_SECONDS = 60 * 60;
const MAX_ADMIN_CODE_LENGTH = 128;

function createDigest(value: string, secret: string) {
  return createHmac("sha256", secret)
    .update(value)
    .digest("hex");
}

function createCodeDigest(code: string, secret: string) {
  return createDigest(`gti-click-admin-code:${code}`, secret);
}

function createSessionToken(code: string, secret: string, expiresAt: number) {
  const signature = createDigest(
    `gti-click-admin-session:${code}:${expiresAt}`,
    secret,
  );

  return `${expiresAt}.${signature}`;
}

function getAdminSecrets() {
  const code = process.env.GTI_CLICK_ADMIN_CODE;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return code && secret ? { code, secret } : null;
}

function tokensMatch(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  );
}

export async function createAdminSession(inputCode: string) {
  const secrets = getAdminSecrets();
  const normalizedCode = inputCode.trim();

  if (
    !secrets ||
    !normalizedCode ||
    normalizedCode.length > MAX_ADMIN_CODE_LENGTH
  ) {
    return false;
  }

  const inputToken = createCodeDigest(normalizedCode, secrets.secret);
  const expectedToken = createCodeDigest(secrets.code, secrets.secret);

  if (!tokensMatch(inputToken, expectedToken)) {
    return false;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_DURATION_SECONDS;
  const sessionToken = createSessionToken(
    secrets.code,
    secrets.secret,
    expiresAt,
  );
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ADMIN_SESSION_DURATION_SECONDS,
    path: "/",
  });

  return true;
}

export async function hasAdminSession() {
  const secrets = getAdminSecrets();

  if (!secrets) {
    return false;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const [expiresAtValue, signature] = token?.split(".") ?? [];
  const expiresAt = Number(expiresAtValue);

  if (
    !signature ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  const expectedToken = createSessionToken(
    secrets.code,
    secrets.secret,
    expiresAt,
  );

  return Boolean(token && tokensMatch(token, expectedToken));
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/admin",
  });
}
