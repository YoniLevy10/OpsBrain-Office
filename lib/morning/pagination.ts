import type { MorningClient } from "./client";
import { DEFAULT_MAX_PAGES, DEFAULT_PAGE_SIZE } from "./constants";

export type SearchPage<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total?: number;
};

export type PaginatedSearchBody = Record<string, unknown> & {
  page?: number;
  pageSize?: number;
};

export async function searchAllPages<T>(
  client: MorningClient,
  path: string,
  baseBody: PaginatedSearchBody,
  options?: { pageSize?: number; maxPages?: number }
): Promise<T[]> {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = options?.maxPages ?? DEFAULT_MAX_PAGES;
  const all: T[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const data = await client.post<SearchPage<T>>(path, {
      ...baseBody,
      page,
      pageSize,
    });
    const items = data.items ?? [];
    all.push(...items);
    if (items.length < pageSize) break;
  }

  return all;
}
