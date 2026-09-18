/**
 * Paginated fetch helper — the Data API caps a single response at 1000 rows,
 * so friend / follower lists silently truncated at 1000 entries.
 * Unique has NO cap on friends or followers: we page until the source is empty.
 */
const PAGE = 1000;
const MAX_PAGES = 500; // hard safety stop (500k rows)

type RangeQuery<T> = { range: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }> };

export async function fetchAllRows<T>(
  build: () => RangeQuery<T>,
  pageSize = PAGE,
): Promise<T[]> {
  const out: T[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * pageSize;
    const { data, error } = await build().range(from, from + pageSize - 1);
    if (error) {
      if (out.length) break;
      throw error;
    }
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}

/**
 * Fetch rows for an unbounded id list: chunks the `in(...)` filter so neither
 * the URL length nor the 1000-row response cap truncates the result.
 */
export async function fetchRowsByIds<T>(
  build: (ids: string[]) => RangeQuery<T>,
  ids: string[],
  chunkSize = 500,
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    if (!chunk.length) continue;
    out.push(...(await fetchAllRows<T>(() => build(chunk))));
  }
  return out;
}
