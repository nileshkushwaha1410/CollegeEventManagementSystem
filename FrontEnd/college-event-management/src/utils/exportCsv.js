
export function exportCsv(filename, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    alert("There is no data to export yet.");
    return;
  }

  const headers = Object.keys(rows[0]);

  const escapeCsvValue = (value) => {
    let text = value == null ? "" : String(value);

    // Reduce the risk of spreadsheet formula injection.
    if (/^[\t\r ]*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
