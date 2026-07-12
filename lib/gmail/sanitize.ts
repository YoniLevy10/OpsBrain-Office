const BLOCKED_TAGS = /<(script|iframe|object|embed|form|link|meta|base)[\s>]/gi;

export function sanitizeEmailHtml(html: string): string {
  let out = html.replace(BLOCKED_TAGS, "&lt;blocked ");
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/javascript:/gi, "blocked:");
  out = out.replace(/data:text\/html/gi, "blocked:");
  return out;
}

export function extractEmailAddress(header?: string): string | null {
  if (!header) return null;
  const angle = header.match(/<([^>]+)>/);
  if (angle?.[1]) return angle[1].trim().toLowerCase();
  if (header.includes("@")) return header.trim().toLowerCase();
  return null;
}
