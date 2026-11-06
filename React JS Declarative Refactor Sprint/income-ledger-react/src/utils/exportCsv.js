import { formatDate } from "./format.js";

/**
 * Turns one value into a safe CSV cell:
 * - Wraps it in quotes and doubles any quotes inside, so commas and quotes don't break columns.
 * - Puts ' in front of text starting with = + - @ so Excel won't run it as a formula.
 */
function toCsvCell(value) {
  let text = String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Builds the CSV text and makes the browser download it as a file. */
export function exportCategoriesToCsv(categories) {
  const header = ["Category Name", "Description", "Monthly Amount (PHP)", "Date Added"];
  const rows = categories.map((c) => [
    c.name,
    c.description,
    c.amount.toFixed(2),
    formatDate(c.createdAt),
  ]);

  const csv = [header, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\r\n");

  // "﻿" (a BOM) tells Excel the file is UTF-8, so accented letters show correctly
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  // A download needs a temporary link that is clicked once. This is a browser
  // file API, not page rendering, so it is fine to do outside React.
  const link = document.createElement("a");
  link.href = url;
  link.download = `income-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
