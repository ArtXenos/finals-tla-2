/**
 * A column header that sorts the table when clicked.
 * Shows ▲ (ascending) or ▼ (descending) on the active column.
 */
export default function SortableHeader({ label, sortKey, sort, onSort, className = "" }) {
  const isActive = sort.key === sortKey;
  const arrow = isActive ? (sort.direction === "asc" ? "▲" : "▼") : "↕";

  // aria-sort tells screen readers how the column is currently sorted
  const ariaSort = isActive ? (sort.direction === "asc" ? "ascending" : "descending") : "none";

  return (
    <th scope="col" className={className} aria-sort={ariaSort}>
      <button
        type="button"
        className={`sort-button${isActive ? " active" : ""}`}
        onClick={() => onSort(sortKey)}
      >
        {label} <span aria-hidden="true">{arrow}</span>
      </button>
    </th>
  );
}
