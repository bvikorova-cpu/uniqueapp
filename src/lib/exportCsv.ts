/** Minimal, dependency-free CSV exporter */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columns?: { key: keyof T | string; label: string; format?: (v: any, row: T) => string }[]
) {
  if (!rows || rows.length === 0) return;

  const cols =
    columns ||
    Object.keys(rows[0]).map((k) => ({ key: k, label: k, format: undefined as any }));

  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = cols.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) =>
      cols
        .map((c) => {
          const raw = (row as any)[c.key as string];
          return escape(c.format ? c.format(raw, row) : raw);
        })
        .join(",")
    )
    .join("\n");

  const csv = "\ufeff" + header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
