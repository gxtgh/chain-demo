export function downloadTextFile(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function downloadJson(filename: string, data: unknown) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), "application/json");
}

export function downloadCsv(
  filename: string,
  rows: Array<Record<string, string | number | boolean | null | undefined>>
) {
  if (!rows.length) {
    downloadTextFile(filename, "");
    return;
  }

  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const escape = (value: unknown) =>
    `"${String(value ?? "")
      .replaceAll('"', '""')
      .replaceAll("\n", " ")}"`;

  const csv = [headers.join(","), ...rows.map((row) => headers.map((key) => escape(row[key])).join(","))].join("\n");
  downloadTextFile(filename, csv, "text/csv;charset=utf-8;");
}
