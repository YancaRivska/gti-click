const FALLBACK_PATH = "/evento/entrar";

export function safeReturnPath(value: unknown) {
  if (Array.isArray(value)) {
    value = value[0];
  }

  if (typeof value !== "string") {
    return FALLBACK_PATH;
  }

  if (value.startsWith("/evento/") && !value.startsWith("//")) {
    return value;
  }

  try {
    const url = new URL(value);
    const path = `${url.pathname}${url.search}`;
    return path.startsWith("/evento/") ? path : FALLBACK_PATH;
  } catch {
    return FALLBACK_PATH;
  }
}
