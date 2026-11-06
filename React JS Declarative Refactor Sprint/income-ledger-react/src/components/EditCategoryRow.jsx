import InputField from "./InputField.jsx";
import { formatDate } from "../utils/format.js";

/**
 * The row being edited. Values and errors come from App (the `editing` object).
 * Enter saves, Escape cancels; key presses bubble up from the inputs to the <tr>.
 * The date added can't be edited, so it is shown as plain text.
 */
export default function EditCategoryRow({ category, editing }) {
  function handleKeyDown(e) {
    if (e.key === "Enter") editing.onSave();
    if (e.key === "Escape") editing.onCancel();
  }

  return (
    <tr className="editing-row" onKeyDown={handleKeyDown}>
      <td>
        <InputField
          id="editCatName"
          label="Category Name"
          hideLabel
          small
          autoFocus
          value={editing.values.name}
          error={editing.errors.name}
          onChange={(value) => editing.onChange("name", value)}
        />
      </td>
      <td>
        <InputField
          id="editCatDesc"
          label="Description"
          hideLabel
          small
          value={editing.values.desc}
          error={editing.errors.desc}
          onChange={(value) => editing.onChange("desc", value)}
        />
      </td>
      <td className="amount-edit-cell">
        <InputField
          id="editCatAmount"
          label="Expected Monthly Amount"
          hideLabel
          small
          prefix="₱"
          inputMode="decimal"
          value={editing.values.amount}
          error={editing.errors.amount}
          onChange={(value) => editing.onChange("amount", value)}
        />
      </td>
      <td className="text-secondary small text-nowrap d-none d-md-table-cell">
        {formatDate(category.createdAt)}
      </td>
      <td className="text-end text-nowrap">
        <button type="button" className="btn btn-accent btn-sm me-2" onClick={editing.onSave}>
          Save
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={editing.onCancel}>
          Cancel
        </button>
      </td>
    </tr>
  );
}
