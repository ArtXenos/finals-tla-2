import { useState, useRef } from "react";
import AppHeader from "./components/AppHeader.jsx";
import CategoryForm from "./components/CategoryForm.jsx";
import SummaryCards from "./components/SummaryCards.jsx";
import LedgerTable from "./components/LedgerTable.jsx";
import DeleteConfirmModal from "./components/DeleteConfirmModal.jsx";
import ToastStack from "./components/ToastStack.jsx";
import { exportCategoriesToCsv } from "./utils/exportCsv.js";

const EMPTY_VALUES = { name: "", desc: "", amount: "" };
const NO_ERRORS = { name: "", desc: "", amount: "" };
const TOAST_DURATION_MS = 3000;

// "Consulting" and "  consulting " count as the same name
const isSameName = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Whole pesos, or pesos with 1–2 centavo digits: "15000", "15000.5", "15000.50"
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const MAX_AMOUNT = 999_999_999.99;

export default function App() {
  // ---------- 1. State (replaces reading values from DOM nodes) ----------
  // Midterm baseline: the list + the form inputs (now with an amount)
  const [categories, setCategories] = useState([]);             // replaces rows inside <tbody id="listIncomeCat">
  const [formValues, setFormValues] = useState(EMPTY_VALUES);   // replaces txtCatName.value / txtCatDesc.value
  const [formErrors, setFormErrors] = useState(NO_ERRORS);

  // Refs are only used to move the cursor (focus), like categoryNameInput.focus()
  const inputRefs = { name: useRef(null), desc: useRef(null), amount: useRef(null) };

  // New features
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState({ key: "createdAt", direction: "asc" }); // oldest first = Midterm order
  const [editingId, setEditingId] = useState(null);             // id of the row being edited, or null
  const [editValues, setEditValues] = useState(EMPTY_VALUES);
  const [editErrors, setEditErrors] = useState(NO_ERRORS);
  const [pendingDelete, setPendingDelete] = useState(null);     // { mode: "one", category } | { mode: "all" } | null
  const [toasts, setToasts] = useState([]);                     // [{ id, message }]

  // ---------- 2. Validation shared by "add" and "edit" ----------
  // ignoreId lets a row being edited keep its own name without counting as a duplicate
  function getErrors(values, ignoreId = null) {
    const errors = { ...NO_ERRORS };
    const name = values.name.trim();
    const amount = values.amount.trim().replace(/,/g, ""); // allow "15,000"

    if (!name) {
      errors.name = "Please enter a category name.";
    } else if (categories.some((c) => c.id !== ignoreId && isSameName(c.name, name))) {
      errors.name = `"${name}" is already registered.`;
    }

    if (!values.desc.trim()) {
      errors.desc = "Please enter a description.";
    }

    if (!amount) {
      errors.amount = "Please enter the expected monthly amount.";
    } else if (!AMOUNT_PATTERN.test(amount)) {
      errors.amount = "Enter a valid amount, e.g. 15000 or 15000.50.";
    } else if (Number(amount) <= 0) {
      errors.amount = "The amount must be greater than ₱0.";
    } else if (Number(amount) > MAX_AMOUNT) {
      errors.amount = "The amount is too large.";
    }
    return errors;
  }

  const firstError = (errors) => ["name", "desc", "amount"].find((field) => errors[field]);

  // Turns the validated form text into the object stored in the list
  const toCategoryFields = (values) => ({
    name: values.name.trim(),
    description: values.desc.trim(),
    amount: Number(values.amount.trim().replace(/,/g, "")),
  });

  // ---------- 3. Success messages ----------
  function showToast(message) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => closeToast(id), TOAST_DURATION_MS);
  }

  function closeToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ---------- 4. Controller action (same name as the Midterm function) ----------
  function handleAddCategory(event) {
    event.preventDefault(); // stop the page from reloading on submit

    // Guard clause validation (Midterm used alert(); now errors show under each input)
    const errors = getErrors(formValues);
    setFormErrors(errors);
    const invalidField = firstError(errors);
    if (invalidField) {
      inputRefs[invalidField].current.focus();
      return;
    }

    // Instead of insertAdjacentHTML: add an object to the array, React draws the row
    const newCategory = {
      id: crypto.randomUUID(),
      ...toCategoryFields(formValues),
      createdAt: Date.now(), // date added, as a number so it is easy to sort
    };
    setCategories((prev) => [...prev, newCategory]);
    showToast(`"${newCategory.name}" saved.`);

    // Reset inputs & refocus (same as the Midterm)
    setFormValues(EMPTY_VALUES);
    inputRefs.name.current.focus();
  }

  // Typing in a field updates that field and clears its error
  function handleFormChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  }

  // ---------- 5. Editing ----------
  function startEdit(category) {
    setEditingId(category.id);
    setEditValues({
      name: category.name,
      desc: category.description,
      amount: category.amount.toFixed(2),
    });
    setEditErrors(NO_ERRORS);
  }

  function saveEdit() {
    const errors = getErrors(editValues, editingId);
    setEditErrors(errors);
    if (firstError(errors)) return;

    const changes = toCategoryFields(editValues);
    setCategories((prev) =>
      prev.map((c) => (c.id === editingId ? { ...c, ...changes } : c))
    );
    setEditingId(null);
    showToast(`"${changes.name}" updated.`);
  }

  const editing = {
    id: editingId,
    values: editValues,
    errors: editErrors,
    onChange: (field, value) => {
      setEditValues((prev) => ({ ...prev, [field]: value }));
      if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: "" }));
    },
    onStart: startEdit,
    onSave: saveEdit,
    onCancel: () => setEditingId(null),
  };

  // ---------- 6. Deleting (always confirmed first) ----------
  function confirmDelete() {
    if (pendingDelete.mode === "all") {
      setCategories([]);
      setSearchText("");
      setEditingId(null);
      showToast("All categories deleted.");
    } else {
      const { id, name } = pendingDelete.category;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) setEditingId(null);
      showToast(`"${name}" deleted.`);
    }
    setPendingDelete(null);
  }

  // ---------- 7. Sorting ----------
  // Same column again = flip direction; new column = start ascending
  function handleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  }

  function compareCategories(a, b) {
    const result =
      sort.key === "name"
        ? a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        : a[sort.key] - b[sort.key]; // amount and createdAt are numbers
    return sort.direction === "asc" ? result : -result;
  }

  // ---------- 8. Export ----------
  function handleExport() {
    exportCategoriesToCsv(sortedCategories);
    showToast(`Exported ${categories.length} ${categories.length === 1 ? "category" : "categories"} to CSV.`);
  }

  // ---------- 9. Derived values (computed every render, never stored) ----------
  // [...categories] copies the array first, because .sort() changes the array it is called on
  const sortedCategories = [...categories].sort(compareCategories);

  const query = searchText.trim().toLowerCase();
  const visibleCategories = query
    ? sortedCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query)
      )
    : sortedCategories;

  // ---------- 10. What to show ----------
  return (
    <>
      <AppHeader />

      <main className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <CategoryForm
              values={formValues}
              errors={formErrors}
              onChange={handleFormChange}
              onSubmit={handleAddCategory}
              inputRefs={inputRefs}
            />

            <SummaryCards categories={categories} />

            <LedgerTable
              categories={visibleCategories}
              totalCount={categories.length}
              searchText={searchText}
              onSearchChange={setSearchText}
              sort={sort}
              onSort={handleSort}
              editing={editing}
              onDelete={(category) => setPendingDelete({ mode: "one", category })}
              onDeleteAll={() => setPendingDelete({ mode: "all" })}
              onExport={handleExport}
            />
          </div>
        </div>
      </main>

      {pendingDelete && (
        <DeleteConfirmModal
          pending={pendingDelete}
          totalCount={categories.length}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      <ToastStack toasts={toasts} onClose={closeToast} />
    </>
  );
}
