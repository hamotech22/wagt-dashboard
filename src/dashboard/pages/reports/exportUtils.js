import { formatCell } from "./reportDefs";

// CSV يفتح في Excel مع دعم العربية (BOM)
export function exportCSV(filename, columns, rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    columns.map((c) => esc(c.label)).join(","),
    ...rows.map((r) => columns.map((c) => esc(formatCell(c, r[c.key]))).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// PDF: نافذة الطباعة → "حفظ كـ PDF"
export const exportPDF = () => window.print();
