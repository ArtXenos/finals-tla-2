import CategoryRow from "./CategoryRow.jsx";
import EditCategoryRow from "./EditCategoryRow.jsx";
import SortableHeader from "./SortableHeader.jsx";
import { formatPeso } from "../utils/format.js";

const COLUMN_COUNT = 5;

/**
 * The "Registered Categories" card: count, search, export, Delete All, and the table.
 * Replaces <tbody id="listIncomeCat">: instead of inserting <tr> strings,
 * it maps over the categories array and returns one row component per item.
 */
export default function LedgerTable({
  categories,
  totalCount,
  searchText,
  onSearchChange,
  sort,
  onSort,
  editing,
  onDelete,
  onDeleteAll,
  onExport,
}) {
  const isSearching = searchText.trim() !== "";
  const countLabel = isSearching ? `${categories.length} of ${totalCount}` : totalCount;
  const shownTotal = categories.reduce((sum, c) => sum + c.amount, 0);

  let emptyMessage = "";
  if (totalCount === 0) emptyMessage = "No categories registered yet. Add your first one above.";
  else if (categories.length === 0) emptyMessage = `No categories match "${searchText.trim()}".`;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
        <h2 className="h6 mb-0 text-brand fw-bold text-uppercase d-flex align-items-center gap-2">
          Registered Categories
          <span className="badge badge-accent rounded-pill" aria-label="Category count">
            {countLabel}
          </span>
        </h2>

        <div className="d-flex flex-wrap gap-2 toolbar">
          <label htmlFor="txtSearch" className="visually-hidden">
            Search categories
          </label>
          <input
            type="search"
            id="txtSearch"
            className="form-control form-control-sm"
            placeholder="Search name or description"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={totalCount === 0}
          />
          <button
            type="button"
            className="btn btn-outline-brand btn-sm fw-semibold text-nowrap"
            onClick={onExport}
            disabled={totalCount === 0}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm fw-semibold text-nowrap"
            onClick={onDeleteAll}
            disabled={totalCount === 0}
          >
            Delete All
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <SortableHeader label="Category Name" sortKey="name" sort={sort} onSort={onSort} className="col-name" />
              <th scope="col">Description</th>
              <SortableHeader label="Monthly Amount" sortKey="amount" sort={sort} onSort={onSort} className="text-end" />
              <SortableHeader label="Date Added" sortKey="createdAt" sort={sort} onSort={onSort} className="d-none d-md-table-cell" />
              <th scope="col" className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody id="listIncomeCat">
            {emptyMessage ? (
              <tr className="empty-row">
                <td colSpan={COLUMN_COUNT} className="text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              categories.map((category) =>
                category.id === editing.id ? (
                  <EditCategoryRow key={category.id} category={category} editing={editing} />
                ) : (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onEdit={editing.onStart}
                    onDelete={onDelete}
                  />
                )
              )
            )}
          </tbody>
          {!emptyMessage && (
            <tfoot>
              <tr className="total-row">
                <th scope="row" colSpan={2}>
                  {isSearching ? "Total of shown categories" : "Total"}
                </th>
                <td className="text-end amount-cell">{formatPeso(shownTotal)}</td>
                <td className="d-none d-md-table-cell" />
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
