import type { Client } from "./data";

/** Resolve a client row id from form selection or fuzzy name match. */
export function resolveClientId(
  clientId: string | null | undefined,
  clientName: string,
  clients: Pick<Client, "id" | "company">[]
): string | null {
  const trimmedId = String(clientId ?? "").trim();
  if (trimmedId && clients.some((c) => c.id === trimmedId)) return trimmedId;

  const name = clientName.trim();
  if (!name) return null;

  const exact = clients.find((c) => c.company === name);
  if (exact) return exact.id;

  const firstWord = name.split(/\s+/)[0]?.toLowerCase();
  if (firstWord && firstWord.length >= 2) {
    const partial = clients.find((c) => c.company.toLowerCase().includes(firstWord));
    if (partial) return partial.id;
  }

  return null;
}

export function clientNameById(
  clientId: string | null | undefined,
  clients: Pick<Client, "id" | "company">[]
): string | null {
  if (!clientId) return null;
  return clients.find((c) => c.id === clientId)?.company ?? null;
}
