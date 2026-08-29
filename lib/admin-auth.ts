import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "gti-click-admin";
const ADMIN_SESSION_DURATION = 60 * 60;

function createToken(code: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`gti-click-admin:${code}`)
    .digest("hex");
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

  if (!secrets) {
    return false;
  }

  const inputToken = createToken(inputCode.trim(), secrets.secret);
  const expectedToken = createToken(secrets.code, secrets.secret);

  if (!tokensMatch(inputToken, expectedToken)) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, expectedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ADMIN_SESSION_DURATION,
    path: "/admin",
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

  return Boolean(
    token && tokensMatch(token, createToken(secrets.code, secrets.secret)),
  );
}
