import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { events, type Event } from "@/data/events";

export type EventAccessRole = "viewer" | "contributor";

const EVENT_ACCESS_COOKIE = "gti-click-event-access";
const EVENT_ACCESS_DURATION_SECONDS = 60 * 60 * 24 * 14;
const MAX_ACCESS_CODE_LENGTH = 128;

// Compatibilidade imediata com os códigos já definidos para o evento atual.
// As variáveis server-only substituem estes valores quando configuradas.
const DEFAULT_VIEWER_CODE = "GALERADOTI";
const DEFAULT_CONTRIBUTOR_CODE = "GALERADOTIAWS";

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function accessCodes() {
  return {
    viewer: normalizeCode(
      process.env.GTI_CLICK_VIEWER_CODE || DEFAULT_VIEWER_CODE,
    ),
    contributor: normalizeCode(
      process.env.GTI_CLICK_CONTRIBUTOR_CODE || DEFAULT_CONTRIBUTOR_CODE,
    ),
  };
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function valuesMatch(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  );
}

function codeMatches(input: string, expected: string) {
  return valuesMatch(digest(input), digest(expected));
}

function createAccessToken(eventSlug: string, role: EventAccessRole, code: string) {
  const proof = digest(`gti-click-access:${eventSlug}:${role}:${code}`);
  return `${eventSlug}.${role}.${proof}`;
}

function expectedCodeForRole(role: EventAccessRole) {
  return accessCodes()[role];
}

export async function createEventAccessSession(inputCode: string): Promise<{
  event: Event;
  role: EventAccessRole;
} | null> {
  const code = normalizeCode(inputCode);

  if (!code || code.length > MAX_ACCESS_CODE_LENGTH) {
    return null;
  }

  const codes = accessCodes();
  const role: EventAccessRole | null = codeMatches(code, codes.contributor)
    ? "contributor"
    : codeMatches(code, codes.viewer)
      ? "viewer"
      : null;
  const event = events[0];

  if (!role || !event) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(
    EVENT_ACCESS_COOKIE,
    createAccessToken(event.slug, role, codes[role]),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: EVENT_ACCESS_DURATION_SECONDS,
      path: "/",
    },
  );

  return { event, role };
}

export async function getEventAccessRole(eventSlug: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(EVENT_ACCESS_COOKIE)?.value;
  const [tokenSlug, tokenRole, proof] = token?.split(".") ?? [];

  if (
    tokenSlug !== eventSlug ||
    (tokenRole !== "viewer" && tokenRole !== "contributor") ||
    !proof
  ) {
    return null;
  }

  const role: EventAccessRole = tokenRole;
  const expected = createAccessToken(
    eventSlug,
    role,
    expectedCodeForRole(role),
  );

  return token && valuesMatch(token, expected) ? role : null;
}

export async function clearEventAccessSession() {
  const cookieStore = await cookies();
  cookieStore.set(EVENT_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}
