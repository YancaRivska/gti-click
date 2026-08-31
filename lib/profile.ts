export function normalizeInstagramHandle(value: string) {
  const handle = value.trim().replace(/^@+/, "").replace(/\s+/g, "");
  return handle ? `@${handle}` : null;
}

export function instagramProfileUrl(handle: string) {
  const username = handle.trim().replace(/^@+/, "");
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}
