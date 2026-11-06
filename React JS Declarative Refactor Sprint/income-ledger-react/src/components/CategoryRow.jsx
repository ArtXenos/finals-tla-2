import { formatPeso, formatDate } from "../utils/format.js";

/**
 * One row in normal view mode. Same cells and classes as the Midterm's
 * newRowHTML template, plus Amount, Date Added and Actions columns.
 * React escapes {category.name}, so typed HTML shows as plain text.
 */
export default function CategoryRow({ category, onEdit, onDelete }) {
  return (
    <tr>
      <td className="fw-semibold text-brand">{category.name}</td>
      <td className="text-secondary">{category.description}</td>
      <td className="text-end amount-cell">{formatPeso(category.amount)}</td>
      <td className="text-secondary small text-nowrap d-none d-md-table-cell">
        {formatDate(category.createdAt)}
      </td>
      <td className="text-end text-nowrap">
        <button
          type="button"
          className="btn btn-outline-brand btn-sm me-2"
          onClick={() => onEdit(category)}
          aria-label={`Edit ${category.name}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(category)}
          aria-label={`Delete ${category.name}`}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
